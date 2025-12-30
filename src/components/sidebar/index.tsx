"use client";

import Image from "next/image";
import { NavigationMain } from "./navigation-main";
import { NavigationSecond } from "./navigation-second";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/providers/user";
import ProfileImageViewer from "../profileImage";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import LogoSi3 from "@/assets/logo-si3-portais.png";

export function Sidebar() {
  const { Profile, profile } = useContext(UserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    Profile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar");
      const hamburger = document.getElementById("hamburger-button");

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        hamburger &&
        !hamburger.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const contextProfile = (context?: string) => {
    if (!context) return "Visitante";

    const roleMap: { [key: string]: string } = {
      administrador: "Administrador",
      "chefe de redação": "Chefe de Redação",
      "gerente comercial": "Gerente Comercial",
      colunista: "Colunista",
      vendedor: "Vendedor",
      jornalista: "Jornalista",
    };

    const normalizedContext = context.toLowerCase();
    return roleMap[normalizedContext] || "Visitante";
  };

  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??";

  return (
    <>
      {/* Botão Hamburguer - apenas mobile */}
      <button
        id="hamburger-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed z-50 p-2 rounded-xl bg-white shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay - apenas mobile quando menu está aberto */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Espaço vazio - apenas desktop */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-[80px]" : "w-[300px]"
        }`}
      />

      {/* Sidebar */}
      <nav
        id="mobile-sidebar"
        className={`
          fixed top-0 left-0 h-screen p-6 
          bg-white shadow-xl overflow-y-auto z-40
          transition-all duration-300 ease-in-out
          
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          
          flex flex-col items-start gap-16
          
          ${isCollapsed ? "lg:w-[80px]" : "w-[300px]"}
        `}
      >
        {/* Logo */}
        <div
          className={`mx-auto transition-all duration-300 ${
            isCollapsed
              ? "lg:w-[40px] lg:h-[40px] overflow-hidden"
              : "w-[197px]"
          }`}
        >
          <Image
            src={LogoSi3}
            alt="Logo Si3 Sistemas"
            className={`w-full h-full transition-all duration-300 ${
              isCollapsed ? "lg:object-contain" : "object-cover"
            }`}
            height={100}
            width={200}
            unoptimized
          />
        </div>

        {/* Perfil */}
        <div
          className={`flex items-center transition-all duration-300 w-full ${
            isCollapsed ? "lg:flex-col lg:gap-1 lg:justify-center" : "gap-2"
          }`}
        >
          <div
            className={`flex items-center justify-center transition-all duration-300 ${
              isCollapsed ? "lg:w-12 lg:h-12" : "w-20 h-20"
            }`}
          >
            <ProfileImageViewer
              imageUrl={profile?.user_image?.url}
              userName={profile?.name}
              size={isCollapsed ? "sm" : "md"}
              fallbackInitials={initials}
              isCollapsed={isCollapsed}
            />
          </div>

          <div
            className={`flex flex-col gap-1 transition-all duration-300 overflow-hidden ${
              isCollapsed ? "lg:hidden" : "flex-1 min-w-0"
            }`}
          >
            <span className="text-header-xs truncate">
              {profile?.name || "Carregando..."}
            </span>
            <span className="text-gray-30 capitalize text-sm truncate">
              {contextProfile(profile?.role.name)}
            </span>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex flex-col h-full justify-between w-full">
          <div className="space-y-3">
            <NavigationMain isCollapsed={isCollapsed} />
          </div>

          <div className="space-y-3">
            <NavigationSecond isCollapsed={isCollapsed} />

            {/* Botão de colapsar/expandir - apenas desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center rounded-full transition-all duration-300 font-[600] w-10 h-10 bg-gray-300 mx-auto"
            >
              {isCollapsed ? (
                <ChevronRight size={20} color="black" />
              ) : (
                <ChevronLeft size={20} color="black" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

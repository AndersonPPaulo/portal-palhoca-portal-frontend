"use client";

import Image from "next/image";
import { NavigationMain } from "./navigation-main";
import { NavigationSecond } from "./navigation-second";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/providers/user";
import ProfileImageViewer from "../profileImage";
import { Menu, X } from "lucide-react";
import LogoSi3 from "@/assets/logo-si3.png";

export function Sidebar() {
  const { Profile, profile } = useContext(UserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    Profile();
  }, []);

  // Fechar menu quando clicar em um link (opcional)
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    // Fechar ao clicar fora
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
      <div className="hidden lg:block w-[300px] flex-shrink-0" />

      {/* Sidebar */}
      <nav
        id="mobile-sidebar"
        className={`
          fixed top-0 left-0 h-screen w-[300px] p-6 
          bg-white shadow-xl overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          
          flex flex-col items-start gap-16
        `}
      >
        {/* Logo */}
        <Image
          src={LogoSi3}
          alt="Logo Si3 Sistemas"
          className="mx-auto max-w-[197px] min-w-[197px]"
        />

        {/* Perfil */}
        <div className="flex items-center gap-2">
          <div className="w-20">
            <ProfileImageViewer
              imageUrl={profile?.user_image?.url}
              userName={profile?.name}
              size="md"
              fallbackInitials={initials}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-header-xs">
              {profile?.name || "Carregando..."}
            </span>
            <span className="text-gray-30 capitalize">
              {contextProfile(profile?.role.name)}
            </span>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex flex-col h-full justify-between w-full">
          <div className="space-y-3">
            <NavigationMain />
          </div>

          <div className="space-y-3">
            <NavigationSecond />
          </div>
        </div>
      </nav>
    </>
  );
}

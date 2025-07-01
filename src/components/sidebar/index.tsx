"use client";

import Image from "next/image";
import LogoSi3 from "../../assets/logo-si3.png";
import { NavigationMain } from "./navigation-main";
import { NavigationSecond } from "./navigation-second";
import { useContext, useEffect } from "react";
import { UserContext } from "@/providers/user";
import ProfileImageViewer from "../profileImage";

export function Sidebar() {
  const { Profile, profile } = useContext(UserContext);

  useEffect(() => {
    Profile();
  }, []);

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

  // Iniciais para o placeholder
  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??";

  return (
    <>
      {/* Espaço vazio com a mesma largura da sidebar para empurrar o conteúdo */}
      <div className="w-[300px] flex-shrink-0"></div>

      {/* Sidebar fixa */}
      <nav className="fixed top-0 left-0 flex flex-col items-start shadow-xl h-screen w-[300px] p-6 gap-16 overflow-y-auto bg-white z-10">
        <Image
          src={LogoSi3}
          alt="Logo Si3 Sistemas"
          className="mx-auto max-w-[197px] min-w-[197px]"
        />

        <div className="flex items-center gap-2">
          <div className="w-20">
            {/* Imagem de perfil com modal de visualização */}
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

"use client";

import Image from "next/image";
import LogoSi3 from "../../assets/logo-si3.png";
import ProfileImg from "../../assets/profile-img.jpg";
import { NavigationMain } from "./navigation-main";
import { NavigationSecond } from "./navigation-second";
import { useContext, useEffect } from "react";
import { UserContext } from "@/providers/user";

export function Sidebar() {
  const { Profile, profile } = useContext(UserContext);

  useEffect(() => {
    Profile();
  }, []);

  const contextProfile = (context?: string) => {
    if (context?.toLocaleLowerCase() === "administrador") {
      return "Administrador";
    } else if (context?.toLocaleLowerCase() === "common") {
      return "Autor";
    } else if (
      context?.toLocaleLowerCase() !== "common" &&
      context?.toLocaleLowerCase() !== "superuser"
    ) {
      return "Visitante";
    }
  };

  return (
    <>
      {/* Espaço vazio com a mesma largura da sidebar para empurrar o conteúdo */}
      <div className="w-[300px] flex-shrink-0"></div>

      {/* Sidebar fixa */}
      <nav className="fixed top-0 left-0 flex flex-col items-start shadow-xl h-screen w-[300px] p-6 gap-16 overflow-y-auto bg-white z-10">
        <Image
          src={LogoSi3}
          alt="Logo Si3 Sistemas"
          className="mx-auto max-w-[197px]"
        />

        <div className="flex items-center gap-4">
          <Image
            src={ProfileImg}
            alt="Logo Si3 Sistemas"
            className="rounded-full h-14 w-14 object-cover"
          />
          <div className="flex flex-col gap-1">
            <span className="text-header-xs">{profile?.name}</span>
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

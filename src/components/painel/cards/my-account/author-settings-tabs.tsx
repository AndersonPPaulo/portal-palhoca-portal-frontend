"use client";

import { useContext, useState } from "react";
import FormUpdateAuthors from "./forms/update-account";
import { UserContext } from "@/providers/user";
import FormUpdatePassword from "./forms/update-password";

export default function AuthorSettingsTabs() {
  const { profile } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  if (!profile || !profile.id || !profile.role.id) {
    return null;
  }

  return (
    <div className="w-full p-6 bg-white rounded-[24px]">
      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`pb-2 px-4 font-medium ${
            activeTab === "info"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Informações Gerais
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`pb-2 px-4 font-medium ${
            activeTab === "password"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Alterar Senha
        </button>
      </div>

      {/* Conteúdo de cada aba */}
      {activeTab === "info" && (
        <FormUpdateAuthors
          profileData={{
            ...profile,
            roleId: profile.role.id,
            phone: profile.phone ?? "",
          }}
        />
      )}
      {activeTab === "password" && <FormUpdatePassword />}
    </div>
  );
}

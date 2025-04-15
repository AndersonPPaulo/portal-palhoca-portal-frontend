"use client";

import Header from "@/components/header";
import FormUpdateAuthors from "@/components/painel/cards/my-account/forms/update-account";
import { UserContext } from "@/providers/user";
import { useContext } from "react";
export default function MinhaConta() {
  const { profile } = useContext(UserContext);

  if (!profile) {
    return null;
  }

  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Minha conta"
        buttonHidden
        description="Dados da minha conta"
      />
      <div className="flex-1 p-6">
        <FormUpdateAuthors profileData={profile} />
      </div>
    </div>
  );
}

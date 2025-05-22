"use client";

import Header from "@/components/header";
import Usuarios from "@/components/tabs/cards/users";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Autores() {
  const { push } = useRouter();

  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Usuários"
        text_button="Novo usuário"
        onClick={() => push("/usuarios/criar")}
        description="Criar usuários para poderem publicarem artigos/postagens para o blog"
      />
      <div className="flex-1 p-6">
        <div className="">
          <Card>
            <Usuarios />
          </Card>
        </div>
      </div>
    </div>
  );
}

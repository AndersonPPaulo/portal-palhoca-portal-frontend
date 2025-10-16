"use client";

import Header from "@/components/header";
import Usuarios from "@/components/tabs/cards/users";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Autores() {
  const { push } = useRouter();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen h-full bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Usuários"
        text_button="Novo usuário"
        onClick={() => push("/usuarios/criar")}
        description="Criar usuários para poderem publicar artigos/postagens para o blog"
        isMobile={isMobile}
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

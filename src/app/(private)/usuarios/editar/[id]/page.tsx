"use client";

import Header from "@/components/header";
import FormEditUser from "@/components/painel/cards/authors/forms/edit-authors";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function EditarUsuario() {
  const params = useParams();
  const userId = params.id as string;
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen h-full bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Editar Usuário"
        description="Edite as informações do usuário selecionado"
        isMobile={isMobile}
      />
      <div className="flex-1 p-6">
        <div className="">
          <Card>
            <FormEditUser userId={userId} />
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import Header from "@/components/header";
import TableUsers from "@/components/tables/users/page";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Autores() {
  const { push } = useRouter();

  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Autores"
        text_button="Novo autor"
        onClick={() => push("/autores/criar")}
        description="Criar autores para poderem publicarem artigos/postagens para o blog"
      />
      <div className="flex-1 p-6">
        <div className="flex flex-col gap-4 h-full">
          <Card className="bg-white rounded-3xl px-4">
            <TableUsers />
          </Card>
        </div>
      </div>
    </div>
  );
}

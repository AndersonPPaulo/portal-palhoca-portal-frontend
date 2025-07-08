"use client";

import Header from "@/components/header";
import TablePortals from "@/components/tables/portais/page";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Portais() {
  const { push } = useRouter();

  return (
    <div className="min-h-screen h-full bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Portais"
        text_button="Novo portal"
        onClick={() => push("/portais/criar")}
        description="Gerenciar portais para publicação e referenciamento de conteúdo"
      />
      <div className="flex-1 p-6">
        <div className="">
          <Card>
            <TablePortals />
          </Card>
        </div>
      </div>
    </div>
  );
}
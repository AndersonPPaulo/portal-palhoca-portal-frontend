"use client";

import Header from "@/components/header";
import CompanyFilter from "@/components/painel/cards/company/filters";
import TableCompany from "@/components/tables/company/page";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Comercio() {
  const { push } = useRouter();
  const [filter, setFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    name: string[];
    status?: string[];
  }>({
    name: [],
  });
  
  return (
    <div className="bg-primary-light flex flex-col h-screen overflow-hidden">
      <Header
        title="Comércios"
        description="Comercios listados nos portais"
        text_button="Adicionar Comércio"
        onClick={() => push("/comercio/criar")}
      />
      <div className="flex flex-col gap-4 h-full p-4">
        <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
          <CompanyFilter
            filter={filter}
            setFilter={setFilter}
            onFilterChange={setActiveFilters}
          />
        </Card> 
        <Card className="bg-white rounded-3xl px-4">
          <TableCompany filter={activeFilters} />
        </Card>
      </div>
    </div>
  );
}
"use client";

import CompanyFilter from "@/components/painel/cards/company/filters";
import TableCompany from "@/components/tables/company/page";
import TableNewLeads from "@/components/tables/new-leads/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Leads() {
  const [filter, setFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    name: string;
    status?: string[];
    email?: string[];
    responsibleName?: string[];
  }>({
    name: "",
    status: [],
    email: [],
    responsibleName: [],
  });
  
  return (
    <div className="bg-primary-light flex flex-col  overflow-hidden">
      <div className="flex flex-col gap-4 h-full ">
        <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
          <CompanyFilter
            filter={filter}
            setFilter={setFilter}
            onFilterChange={setActiveFilters}
          />
        </Card> 
        <Card className="bg-white rounded-3xl px-4">
          <TableNewLeads filter={activeFilters} />
        </Card>
      </div>
    </div>
  );
}
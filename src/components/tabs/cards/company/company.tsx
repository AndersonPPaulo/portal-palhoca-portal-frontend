"use client";

import CompanyFilter from "@/components/painel/cards/company/filters";
import TableCompany from "@/components/tables/company/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Comercio() {
  const [filter, setFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    name?: string;
    category?: string;
    isActive?: boolean | null;
  }>({});

  // Adapter to convert FilterState to local state shape
  const handleFilterChange = (filters: {
    name?: string;
    category?: string;
    isActive?: boolean | null;
  }) => {
    setActiveFilters({
      name: filters.name,
      category: filters.category,
      isActive: filters.isActive ?? null,
    });
  };

  return (
    <div className="bg-primary-light flex flex-col  overflow-hidden">
      <div className="flex flex-col gap-4 h-full ">
        <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
          <CompanyFilter
            filter={filter}
            setFilter={setFilter}
            onFilterChange={handleFilterChange}
          />
        </Card>
        <Card className="bg-white rounded-3xl px-4">
          <TableCompany filter={activeFilters} />
        </Card>
      </div>
    </div>
  );
}

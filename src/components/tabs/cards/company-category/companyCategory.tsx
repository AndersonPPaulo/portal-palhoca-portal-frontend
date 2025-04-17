"use client"
import CompanyCategoryFilter from "@/components/painel/cards/company-category/filters";
import TableCategoryCompany from "@/components/tables/company-category/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function CategoriaComercio() {
    const [filter, setFilter] = useState("");
    const [activeFilters, setActiveFilters] = useState<{
      name: string[];
    }>({
      name: [],
    });
    
    return (
      <div className="bg-primary-light flex flex-col  overflow-y-hidden">
        <div className="flex flex-col gap-4 h-full p-4">
          <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
            <CompanyCategoryFilter
              filter={filter}
              setFilter={setFilter}
              onFilterChange={setActiveFilters}
            />
          </Card> 
          <Card className="bg-white rounded-3xl px-4">
            <TableCategoryCompany filter={activeFilters} />
          </Card>
        </div>
      </div>
    );
  }
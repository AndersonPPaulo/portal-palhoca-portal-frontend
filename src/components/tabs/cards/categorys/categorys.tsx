"use client";

import FilterCategorys from "@/components/painel/cards/postagens/categorys/filters";
import TableCategorys from "@/components/tables/categorys/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface FilterState {
  status: boolean | null;
}

const Categorys = () => {
  const [filter, setFilter] = useState("");

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: null,
  });
  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
        <FilterCategorys
          filter={filter}
          setFilter={setFilter}
          onFilterChange={setActiveFilters}
        />
      </Card>
      <Card className="bg-white rounded-3xl px-4">
        <TableCategorys filter={filter} activeFilters={activeFilters} />
      </Card>
    </div>
  );
};

export default Categorys;

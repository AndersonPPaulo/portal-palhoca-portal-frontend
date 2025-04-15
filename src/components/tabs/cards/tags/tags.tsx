"use client";

import FiltersTags from "@/components/painel/cards/postagens/tags/filters";
import TableTags from "@/components/tables/tags/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface FilterState {
  status: boolean | null;
}

const Tags = () => {
  const [filter, setFilter] = useState("");

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: null,
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
        <FiltersTags
          filter={filter}
          setFilter={setFilter}
          onFilterChange={setActiveFilters}
        />
      </Card>
      <Card className="bg-white rounded-3xl px-4">
        <TableTags filter={filter} activeFilters={activeFilters} />
      </Card>
    </div>
  );
};

export default Tags;

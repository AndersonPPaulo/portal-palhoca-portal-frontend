"use client";

import FilterUsers from "@/components/painel/cards/authors/filters/filters";
import TableUsers from "@/components/tables/users/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface FilterState {
  status: boolean | null;
}

const Usuarios = () => {
  const [filter, setFilter] = useState("");

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: null,
  });
  return (
    <div className="flex flex-col gap-4 p-4 bg-primary-light">
      <Card className="rounded-3xl bg-white flex items-center gap-4 p-4 shadow-none">
        <FilterUsers
          filter={filter}
          setFilter={setFilter}
          onFilterChange={setActiveFilters}
        />
      </Card>
      <Card className="bg-white rounded-3xl px-4 shadow-none">
        <TableUsers filter={filter} activeFilters={activeFilters} />
      </Card>
    </div>
  );
};

export default Usuarios;

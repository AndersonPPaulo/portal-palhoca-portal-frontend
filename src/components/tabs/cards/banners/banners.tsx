"use client";

import FilterBanners from "@/components/painel/cards/banners/filters";
import TableBanners from "@/components/tables/banner/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface FilterState {
  status: boolean | null;
}

const Banners = () => {
  const [filter, setFilter] = useState("");

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: null,
  });
  return (
    <div className="flex flex-col gap-4 p-4 bg-primary-light">
      <Card className="rounded-3xl bg-white flex items-center gap-4 p-4 shadow-none">
        <FilterBanners
          filter={filter}
          setFilter={setFilter}
          onFilterChange={setActiveFilters}
        />
      </Card>
      <Card className="bg-white rounded-3xl px-4 shadow-none">
        <TableBanners filter={filter} activeFilters={activeFilters} />
      </Card>
    </div>
  );
};

export default Banners;

"use client";

import ArticleFilter from "@/components/painel/cards/postagens/articles/filters";
import TableArticles from "@/components/tables/articles/page";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export interface FilterState {
  status: boolean | null;
  categories: string[];
  creators: string[];
  highlight: boolean | null;
}

const Articles = () => {
  const [filter, setFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: null,
    categories: [],
    creators: [],
    highlight: null,
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="rounded-3xl min-h-[140px] bg-white flex items-center gap-4 p-4">
        <ArticleFilter
          filter={filter}
          setFilter={setFilter}
          onFilterChange={setActiveFilters}
        />
      </Card>
      <Card className="bg-white rounded-3xl px-4">
        <TableArticles filter={filter} activeFilters={activeFilters} />
      </Card>
    </div>
  );
};

export default Articles;

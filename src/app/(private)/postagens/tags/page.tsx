"use client";

import Header from "@/components/header";
import FiltersTags from "@/components/painel/cards/postagens/tags/filters";
import TableTags from "@/components/tables/tags/page";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface FilterState {
  status: boolean | null;
}

const Tags = () => {
  const [filter, setFilter] = useState("");
  const { push } = useRouter();
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: null,
  });
  const isMobile = useIsMobile();

  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Tags"
        text_button="Cadastrar Tag"
        onClick={() => push("/postagens/tags/criar")}
        description="Listagem de Tags cadastradas."
        isMobile={isMobile}
      />
      <div className="flex flex-col gap-4 h-full p-4">
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
    </div>
  );
};

export default Tags;

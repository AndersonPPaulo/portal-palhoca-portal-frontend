"use client";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCompanyCategory } from "@/providers/company-category/index.tsx";

interface TableCategoryCompanyProps {
  filter?: string; // filter agora é apenas uma string
}

export default function TableCategoryCompany({ filter }: TableCategoryCompanyProps) {
  const { fetchCategories, categories, loading } = useCompanyCategory();
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    const load = async () => {
      await fetchCategories(); // Carrega as categorias ao montar o componente
    };
    load();
  }, [fetchCategories]);

  useEffect(() => {
    const applyFilters = () => {
      let result = categories;

      if (filter) {
        result = result.filter((item) =>
          item.name.toLowerCase().includes(filter.toLowerCase())
        );
      }

      setFilteredCategories(result); // Aplica o filtro às categorias
    };

    applyFilters();
  }, [filter, categories]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <p>Carregando categorias...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <p>Nenhuma categoria encontrada.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredCategories} />
      )}
    </>
  );
}

"use client";

import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CategoryCompanyProps, CompanyCategoryContext } from "@/providers/company-category/index.tsx";


interface TableCategoryCompanyProps {
  filter: {
    name?: string[] | string;
  };
}

export default function TableCategoryCompany({ filter }: TableCategoryCompanyProps) {
  const { ListCompanyCategory, listCompanyCategory } = useContext(CompanyCategoryContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        await ListCompanyCategory(4000, 1);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = listCompanyCategory?.data?.filter((item: CategoryCompanyProps) => {
    let matchesName = true;

    if (filter.name) {
      if (Array.isArray(filter.name) && filter.name.length > 0) {
        matchesName = filter.name.some(name =>
          typeof name === "string" &&
          item.name.toLowerCase().includes(name.toLowerCase())
        );
      } else if (typeof filter.name === "string" && filter.name.trim() !== "") {
        matchesName = item.name.toLowerCase().includes(filter.name.toLowerCase());
      }
    }

    return matchesName;
  }) || [];

  return <DataTable columns={columns} data={filteredCategories} />;
}

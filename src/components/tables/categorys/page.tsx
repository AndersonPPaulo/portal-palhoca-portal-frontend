import { DataTable } from "./data-table";
import { useContext, useEffect } from "react";
import { columns } from "./columns";
import { CategorysContext } from "@/providers/categorys";

interface TableTagsProps {
  filter: string;
  activeFilters: {
    status: boolean | null;
  };
}

export default function TableCategorys({
  filter,
  activeFilters,
}: TableTagsProps) {
  const { ListCategorys, listCategorys } = useContext(CategorysContext);

  useEffect(() => {
    ListCategorys();
  }, []);

  const filteredCategorys = listCategorys.filter((item) => {
    const search = filter.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesStatus =
      activeFilters.status === null || activeFilters.status === item.status;

    return matchesSearch && matchesStatus;
  });

  return <DataTable data={filteredCategorys} columns={columns} />;
}

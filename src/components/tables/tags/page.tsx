import { DataTable } from "./data-table";
import { useContext, useEffect } from "react";
import { TagContext } from "@/providers/tags";
import { columns } from "./columns";

interface TableTagsProps {
  filter: string;
  activeFilters: {
    status: boolean | null;
  };
}

export default function TableTags({ filter, activeFilters }: TableTagsProps) {
  const { ListTags, listTags } = useContext(TagContext);

  useEffect(() => {
    ListTags();
  }, []);

  const filteredTags = listTags.filter((item) => {
    const search = filter.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesStatus =
      activeFilters.status === null || activeFilters.status === item.status;

    return matchesSearch && matchesStatus;
  });

  return <DataTable data={filteredTags} columns={columns} />;
}

import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { UserContext } from "@/providers/user";

interface TableUsersProps {
  filter: string;
  activeFilters: {
    status: boolean | null;
  };
}

export default function TableUsers({ filter, activeFilters }: TableUsersProps) {
  const { ListUser, listUser } = useContext(UserContext);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(9);

  useEffect(() => {
    ListUser(pageIndex + 1, pageSize);
  }, [pageIndex, pageSize]);

  const filteredUsers =
    listUser?.data?.filter((item) => {
      const search = filter.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        item.phone.toLowerCase().includes(search) ||
        item.role?.name.toLowerCase().includes(search) ||
        item.topic?.toLowerCase().includes(search);

      const matchesStatus =
        activeFilters.status === null || activeFilters.status === item.isActive;

      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <DataTable
      columns={columns}
      data={filteredUsers}
      totalPages={listUser?.totalPages || 1}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}

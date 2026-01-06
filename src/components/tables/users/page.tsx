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

  console.log(listUser);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params: any = {
          page: pageIndex + 1,
          limit: pageSize,
        };

        if (filter) {
          params.name = filter; // Envie apenas um campo de busca (como 'name')
        }

        if (activeFilters.status !== null) {
          params.status = activeFilters.status ? "true" : "false";
        }

        await ListUser(params);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    fetchUsers();
  }, [pageIndex, pageSize, filter, activeFilters]);

  return (
    <DataTable
      columns={columns}
      data={(listUser?.data || []).map((user: any) => ({
        ...user,
        phone: user.phone ?? "",
      }))}
      totalPages={listUser?.totalPages || 1}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}

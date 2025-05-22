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

  useEffect(() => {
    const fetch = async () => {
      await ListUser();
    };

    fetch();
  }, []);

  // Se listUser ainda não foi carregado, evite tentar usar .filter
  const filteredUsers = listUser?.length
    ? listUser.filter((item) => {
        const search = filter.toLowerCase();

        // Busca por nome, email, telefone ou função
        const matchesSearch =
          item.name.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search) ||
          item.phone.toLowerCase().includes(search) ||
          item.role?.name.toLowerCase().includes(search) ||
          item.topic?.toLowerCase().includes(search);

        // Filtro por status (isActive)
        const matchesStatus =
          activeFilters.status === null ||
          activeFilters.status === item.isActive;

        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <>
      <DataTable columns={columns} data={filteredUsers} />
    </>
  );
}

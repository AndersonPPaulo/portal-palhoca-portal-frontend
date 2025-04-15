import { useContext, useEffect } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { UserContext } from "@/providers/user";

export default function TableUsers() {
  const { ListUser, listUser } = useContext(UserContext);

  useEffect(() => {
    ListUser();
  }, []);

  return <DataTable data={listUser} columns={columns} />;
}

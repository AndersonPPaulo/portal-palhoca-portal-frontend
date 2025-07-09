"use cliente";

import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { PortalContext, ResponsePromise } from "@/providers/portal";
import { DataTable } from "./data-table";
import { set } from "date-fns";

interface TablePortalsProps {
  filter?: string;
  activeFilters?: {
    status: boolean | null;
  };
}

export default function TablePortals({
  filter = "",
  activeFilters = { status: null },
}: TablePortalsProps) {
  const { ListPortals, listPortals } = useContext(PortalContext);
  const [filteredPortals, setFilteredPortals] = useState<ResponsePromise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortals = async () => {
      try {
        await ListPortals();
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar portais:", error);
      }
    };

    fetchPortals();
  }, []);

  useEffect(() => {
    let filtered = listPortals || [];

    // Aplicar filtro por nome
    if (filter) {
      filtered = filtered.filter((portal) =>
        portal.name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Aplicar filtro por status
    if (activeFilters.status !== null) {
      filtered = filtered.filter(
        (portal) => portal.status === activeFilters.status
      );
    }

    setFilteredPortals(filtered);
  }, [listPortals, filter, activeFilters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <DataTable columns={columns} data={filteredPortals}/>;
}

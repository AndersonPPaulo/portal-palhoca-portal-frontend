import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { WhatsappGroupContext } from "@/providers/whatsapp-group";

interface TableWhatsappProps {
  filter?: string;
  activeFilters?: {
    portal_id: string | null;
    is_active: boolean | null;
  };
}

export default function TableWhatsapp({ 
  filter = "", 
  activeFilters = { portal_id: null, is_active: null } 
}: TableWhatsappProps) {
  const { ListWhatsappGroups, listWhatsappGroups } = useContext(WhatsappGroupContext);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWhatsappGroups = async () => {
      try {
        setLoading(true);
        
        const params: any = {};

        // Filtro por portal
        if (activeFilters.portal_id) {
          params.portal_id = activeFilters.portal_id;
        }

        // Filtro por status
        if (activeFilters.is_active !== null) {
          params.is_active = activeFilters.is_active;
        }

        await ListWhatsappGroups(params);
      } catch (error) {
        console.error("Erro ao buscar grupos de WhatsApp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsappGroups();
  }, []);

  // Filtrar dados no frontend se necessário (quando a API não suporta busca por texto)
  const filteredData = listWhatsappGroups?.filter((group) => {
    if (!filter) return true;
    
    const searchTerm = filter.toLowerCase();
    const portalName = group.portal?.name?.toLowerCase() || "";
    const link = group.link?.toLowerCase() || "";
    
    return portalName.includes(searchTerm) || link.includes(searchTerm);
  }) || [];

  // Simular paginação no frontend para os dados filtrados
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={paginatedData}
      totalPages={totalPages}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}
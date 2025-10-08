import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CompanyContext } from "@/providers/company";

interface TableCompanyProps {
  filter: {
    name?: string;
    categories?: string[]; // ✅ Adicionar categories
    highlight?: boolean | null; // ✅ Adicionar highlight
    isActive?: boolean | null;
  };
}

export default function TableCompany({ filter }: TableCompanyProps) {
  const { ListCompany, listCompany } = useContext(CompanyContext);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(9);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const options: any = {};

        // Filtro por nome
        if (filter.name) {
          options.name = filter.name;
        }

        // Filtro por categorias (array)
        if (filter.categories && filter.categories.length > 0) {
          options.categories = filter.categories;
        }

        // Filtro por highlight
        if (filter.highlight !== undefined && filter.highlight !== null) {
          options.highlight = filter.highlight;
        }

        // Filtro por status ativo
        if (filter.isActive !== undefined && filter.isActive !== null) {
          options.isActive = filter.isActive;
        }

        await ListCompany(pageIndex + 1, pageSize, options);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [pageIndex, pageSize, filter]);

  // Filtrar dados localmente para remover new_lead e in_process
  const filteredData = listCompany?.data?.filter(company => 
    company.status !== "new_lead" && company.status !== "in_process"
  ) || [];

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      totalPages={Number(listCompany?.totalPages) || 1}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}
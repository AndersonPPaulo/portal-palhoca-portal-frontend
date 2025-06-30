import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CompanyContext } from "@/providers/company";

interface TableCompanyProps {
  filter: {
    name?: string;
    category?: string;
    isActive?: boolean | null;
  };
}

export default function TableCompany({ filter }: TableCompanyProps) {
  const { ListCompany, listCompany } = useContext(CompanyContext);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const options: any = {};

        if (filter.name) {
          options.name = filter.name;
        }

        if (filter.category) {
          options.category = filter.category;
        }

        //utilizar filtro de isActive como booleano usando select caso solicitado
        // if (filter.isActive !== null && filter.isActive !== undefined) {
        //   options.isActive = filter.isActive;
        // }

        await ListCompany(pagination.pageIndex + 1, pagination.pageSize, options);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [pagination.pageIndex, pagination.pageSize, filter]);

  return (
    <DataTable
      columns={columns}
      data={listCompany?.data || []}
      totalPages={Number(listCompany?.totalPages) || 1}
      pagination={pagination}
      onPaginationChange={(updater) =>
        setPagination((prev) =>
          typeof updater === "function" ? updater(prev) : updater
        )
      }
    />
  );
}

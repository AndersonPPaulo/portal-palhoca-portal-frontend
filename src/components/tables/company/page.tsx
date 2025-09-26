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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(9);

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

        await ListCompany(pageIndex + 1, pageSize, options);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [pageIndex, pageSize, filter]);

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
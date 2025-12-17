import { useContext, useEffect, useState } from "react";
import { useResponsiveColumns } from "./columns";
import { DataTable } from "./data-table";
import { CompanyContext } from "@/providers/company";

interface TableCompanyProps {
  filter: {
    name?: string;
    categories?: string[];
    highlight?: boolean | null;
    isActive?: boolean | null;
  };
}

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function TableCompany({ filter }: TableCompanyProps) {
  const { ListCompany, listCompany } = useContext(CompanyContext);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const columns = useResponsiveColumns();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const options: any = {};

        if (filter.name) {
          options.name = normalizeText(filter.name);
        }

        if (filter.categories && filter.categories.length > 0) {
          options.categories = filter.categories;
        }

        if (filter.highlight !== undefined && filter.highlight !== null) {
          options.highlight = filter.highlight;
        }

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

  const data = listCompany?.data || [];

  return (
    <DataTable
      columns={columns}
      data={data}
      totalPages={Number(listCompany?.totalPages) || 1}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}

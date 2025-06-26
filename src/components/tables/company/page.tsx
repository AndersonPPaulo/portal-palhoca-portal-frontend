import { useContext, useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CompanyContext, ICompanyProps } from "@/providers/company";

interface TableCompanyProps {
  filter: {
    name?: string[] | string;
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
        await ListCompany(pagination.pageIndex + 1, pagination.pageSize); // importante somar +1
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [pagination.pageIndex, pagination.pageSize]);

  const filteredCompanies =
    listCompany?.data?.filter((item: ICompanyProps) => {
      let matchesName = true;

      if (filter.name) {
        if (item.status === "new_lead") return false;

        if (Array.isArray(filter.name) && filter.name.length > 0) {
          matchesName = filter.name.some(
            (name) =>
              typeof name === "string" &&
              item.name.toLowerCase().includes(name.toLowerCase())
          );
        } else if (
          typeof filter.name === "string" &&
          filter.name.trim() !== ""
        ) {
          matchesName = item.name
            .toLowerCase()
            .includes(filter.name.toLowerCase());
        }
      }

      return matchesName;
    }) || [];

  return (
    <DataTable
      columns={columns}
      data={filteredCompanies}
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


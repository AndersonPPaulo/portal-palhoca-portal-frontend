"use client";

import { useContext, useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, ILeadProps } from "./columns";
import { CompanyContext, ICompanyProps } from "@/providers/company";

interface TableLeadsProps {
  filter: {
    name?: string[] | string;
    responsibleName?: string[] | string;
    email?: string[] | string;
  };
}

export default function TableLeads({ filter }: TableLeadsProps) {
  const { ListCompany, listCompany } = useContext(CompanyContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ListCompany();
    setLoading(false);
  }, []);

  const filteredLeads =
    listCompany?.data?.filter((item: ICompanyProps) => {
      let matchesCompanyName = true;
      let matchesResponsibleName = true;
      let matchesEmail = true;

      // Filtro por nome do comércio
      if (filter.name) {
        if (Array.isArray(filter.name) && filter.name.length > 0) {
          matchesCompanyName = filter.name.some(
            (name) =>
              typeof name === "string" &&
              item.name.toLowerCase().includes(name.toLowerCase())
          );
        } else if (
          typeof filter.name === "string" &&
          filter.name.trim() !== ""
        ) {
          matchesCompanyName = item.name
            .toLowerCase()
            .includes(filter.name.toLowerCase());
        }
      }

      // Filtro por nome do responsável
      if (filter.responsibleName) {
        if (
          Array.isArray(filter.responsibleName) &&
          filter.responsibleName.length > 0
        ) {
          matchesResponsibleName = filter.responsibleName.some(
            (name) =>
              typeof name === "string" &&
              item.responsibleName.toLowerCase().includes(name.toLowerCase())
          );
        } else if (
          typeof filter.responsibleName === "string" &&
          filter.responsibleName.trim() !== ""
        ) {
          matchesResponsibleName = item.responsibleName
            .toLowerCase()
            .includes(filter.responsibleName.toLowerCase());
        }
      }

      // Filtro por email
      if (filter.email) {
        if (Array.isArray(filter.email) && filter.email.length > 0) {
          matchesEmail = filter.email.some(
            (email) =>
              typeof email === "string" &&
              item.email.toLowerCase().includes(email.toLowerCase())
          );
        } else if (
          typeof filter.email === "string" &&
          filter.email.trim() !== ""
        ) {
          matchesEmail = item.email
            .toLowerCase()
            .includes(filter.email.toLowerCase());
        }
      }

      return matchesCompanyName && matchesResponsibleName && matchesEmail;
    }) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <DataTable columns={columns} data={filteredLeads} />;
}

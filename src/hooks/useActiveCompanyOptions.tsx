"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanyContext } from "@/providers/company";
import type { OptionType } from "@/components/select/custom-select";

const COMPANIES_PER_PAGE = 100;

/**
 * Busca TODAS as empresas ativas percorrendo as páginas da API
 * e devolve já no formato usado pelos selects do painel.
 */
export function useActiveCompanyOptions() {
  const { ListCompany } = useContext(CompanyContext);
  const [companyOptions, setCompanyOptions] = useState<OptionType[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAllCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const firstPage = await ListCompany(1, COMPANIES_PER_PAGE, {
          isActive: true,
        });

        let companies = firstPage?.data ?? [];
        const totalPages = Number(firstPage?.totalPages) || 1;

        for (let page = 2; page <= totalPages; page++) {
          const nextPage = await ListCompany(page, COMPANIES_PER_PAGE, {
            isActive: true,
          });
          companies = [...companies, ...(nextPage?.data ?? [])];
        }

        if (!isMounted) return;

        setCompanyOptions(
          companies
            .filter((company) => company.status === "active")
            .map((company) => ({
              value: company.id,
              label: company.name ?? "Empresa sem nome",
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))
        );
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        toast.error("Erro ao carregar as empresas");
      } finally {
        if (isMounted) {
          setLoadingCompanies(false);
        }
      }
    };

    loadAllCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  return { companyOptions, loadingCompanies };
}

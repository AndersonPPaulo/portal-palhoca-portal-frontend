"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CompanyContext, type ICompanyProps } from "@/providers/company";
import type { OptionType } from "@/components/select/custom-select";

const COMPANIES_PER_PAGE = 20;
/** Quantas opções tentar reunir por lote antes de devolver para a tela. */
const MIN_OPTIONS_PER_BATCH = 10;
const SEARCH_DEBOUNCE_MS = 400;

const toOptions = (companies: ICompanyProps[]): OptionType[] =>
  companies
    .filter((company) => company.status === "active")
    .map((company) => ({
      value: company.id,
      label: company.name ?? "Empresa sem nome",
    }));

/**
 * Carrega empresas ativas sob demanda para os selects do painel:
 * traz a primeira página no mount, as seguintes conforme a rolagem do menu
 * e refaz a busca no servidor quando o usuário digita.
 *
 * O filtro de status é feito no cliente porque a API não tem filtro de
 * status funcional em GET /company.
 */
export function useActiveCompanyOptions() {
  const { ListCompany } = useContext(CompanyContext);

  // ListCompany é recriada a cada render do provider; guardar em ref evita
  // que os efeitos/callbacks abaixo disparem em loop.
  const listCompanyRef = useRef(ListCompany);
  listCompanyRef.current = ListCompany;

  const [companyOptions, setCompanyOptions] = useState<OptionType[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadedPageRef = useRef(0);
  const totalPagesRef = useRef(1);
  const isFetchingRef = useRef(false);
  const requestIdRef = useRef(0);

  const fetchCompanies = useCallback(async (startPage: number, name: string) => {
    const requestId = ++requestIdRef.current;
    isFetchingRef.current = true;
    setLoadingCompanies(true);

    try {
      const collected: OptionType[] = [];
      let page = startPage;
      let totalPages = Number.POSITIVE_INFINITY;

      // Uma página pode vir só com empresas inativas (o filtro é no cliente),
      // então seguimos buscando até juntar opções suficientes ou acabarem as páginas.
      do {
        const response = await listCompanyRef.current(
          page,
          COMPANIES_PER_PAGE,
          name ? { name } : {}
        );

        // Descarta resposta antiga (a busca mudou enquanto carregava).
        if (requestId !== requestIdRef.current) return;

        totalPages = Number(response?.totalPages) || 1;
        collected.push(...toOptions(response?.data ?? []));
        page++;
      } while (collected.length < MIN_OPTIONS_PER_BATCH && page <= totalPages);

      loadedPageRef.current = page - 1;
      totalPagesRef.current = totalPages;

      setCompanyOptions((previous) => {
        if (startPage === 1) return collected;

        const known = new Set(previous.map((option) => option.value));
        return [
          ...previous,
          ...collected.filter((option) => !known.has(option.value)),
        ];
      });
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar as empresas");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingCompanies(false);
        isFetchingRef.current = false;
      }
    }
  }, []);

  // Primeira página no mount e a cada busca (com debounce ao digitar).
  useEffect(() => {
    const term = searchTerm.trim();
    const timeout = setTimeout(
      () => {
        loadedPageRef.current = 0;
        fetchCompanies(1, term);
      },
      term ? SEARCH_DEBOUNCE_MS : 0
    );

    return () => clearTimeout(timeout);
  }, [searchTerm, fetchCompanies]);

  const loadMoreCompanies = useCallback(() => {
    if (isFetchingRef.current) return;
    if (loadedPageRef.current >= totalPagesRef.current) return;

    fetchCompanies(loadedPageRef.current + 1, searchTerm.trim());
  }, [fetchCompanies, searchTerm]);

  return {
    companyOptions,
    loadingCompanies,
    loadMoreCompanies,
    searchCompanies: setSearchTerm,
  };
}

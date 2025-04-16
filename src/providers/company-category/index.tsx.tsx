import { api } from "@/service/api";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { getCookie } from "cookies-next";

export interface CompanyCategoryProps {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
  }[];
}

interface CreateCompanyCategoryData {
  name: string;
  companyIds?: string[];
}

interface CompanyCategoryContextType {
  createCompanyCategory: (data: CreateCompanyCategoryData) => Promise<void>;
  loading: boolean;
  categories: CompanyCategoryProps[];
  fetchCategories: (page?: number, limit?: number) => Promise<void>;
}

export const CompanyCategoryContext = createContext({} as CompanyCategoryContextType);

export const CompanyCategoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<CompanyCategoryProps[]>([]);
  const [loading, setLoading] = useState(false);

  const token = getCookie("token"); // Autenticação com token

  // Função para criar uma nova categoria
  const createCompanyCategory = async (data: CreateCompanyCategoryData) => {
    try {
      setLoading(true);

      const response = await api.post("/company-category", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Categoria criada com sucesso!");
      await fetchCategories(); // Recarrega as categorias após a criação
    } catch (error: any) {
      const message = error?.response?.data?.message || "Erro ao criar categoria";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar categorias com paginação
  const fetchCategories = async (page: number = 1, limit: number = 30) => {
    try {
      setLoading(true);
      const response = await api.get("/company-category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page, limit },
      });
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyCategoryContext.Provider
      value={{ createCompanyCategory, loading, categories, fetchCategories }}
    >
      {children}
    </CompanyCategoryContext.Provider>
  );
};

export const useCompanyCategory = () => useContext(CompanyCategoryContext);

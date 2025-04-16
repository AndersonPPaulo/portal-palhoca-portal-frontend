"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

export interface CategoryCompanyProps {
  id: string;
  name: string;
}

export type CompanyCategoryListProps = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: CategoryCompanyProps[];
};

interface UpdateCategoryCompanyProps {
  name: string;
  description?: string;

}
type ResponsePromise = {
  name: string;
  id: string;
};

interface ICompanyCategoryData {
  ListCompanyCategory(limit?: number, page?: number): Promise<CompanyCategoryListProps>;
  CreateCompanyCategory(data: UpdateCategoryCompanyProps): Promise<void>;
  UpdateCompanyCategory(data: UpdateCategoryCompanyProps, id: string): Promise<void>;
  listCompanyCategory: CompanyCategoryListProps | null;
  SelfCompanyCategory(categoryId: string): Promise<CategoryCompanyProps>;
  companyCategory: CategoryCompanyProps | null;
  DeleteCompanyCategory(categoryId: string): Promise<void>;
}

interface IChildrenReact {
  children: ReactNode;
}

export const CompanyCategoryContext = createContext<ICompanyCategoryData>({} as ICompanyCategoryData);

export const CompanyCategoryProvider = ({ children }: IChildrenReact) => {
  const { push } = useRouter();
  const [listCompanyCategory, setListCompanyCategory] = useState<CompanyCategoryListProps | null>(null);
  const [companyCategory, setCompanyCategory] = useState<CategoryCompanyProps | null>(null);

  const ListCompanyCategory = async (
    limit: number = 30,
    page: number = 1
  ): Promise<CompanyCategoryListProps> => {
    const config = { params: { limit, page } };
    const response = await api
      .get("/company-category", config)
      .then((res) => {
        const dataWithStatus = res.data.response.data.map(
          (category: CategoryCompanyProps) => ({
            ...category,
          })
        );

        const formattedResponse = {
          ...res.data.response,
          data: dataWithStatus,
        };

        setListCompanyCategory(formattedResponse);
        return formattedResponse;
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Erro ao listar categorias de empresas");
        return {
          total: 0,
          page: 0,
          limit: 0,
          totalPages: 0,
          data: [],
        };
      });
    return response;
  };

  const DeleteCompanyCategory = async (categoryId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      
    };
    const response = await api
      .delete(`/company-category/${categoryId}`, config)
      .then(() => {
        toast.success("Categoria deletada com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const CreateCompanyCategory = async (data: UpdateCategoryCompanyProps): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      await api.post("/company-category", data, config);
      toast.success("Categoria criada com sucesso!");
      push("/comercio?tab=categoria");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar categoria");
    }
  };

  const UpdateCompanyCategory = async (
    data: UpdateCategoryCompanyProps,
    id: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      await api.patch(`/company-category/${id}`, data, config);
      toast.success("Categoria atualizada com sucesso!");
      push("/categorias");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar categoria");
    }
  };

  const SelfCompanyCategory = async (categoryId: string): Promise<CategoryCompanyProps> => {
    const response = await api
      .get(`/company-category/${categoryId}`)
      .then((res) => {
        const categoryWithStatus = {
          ...res.data.response,
          status: res.data.response.status || "inactive",
        };
        setCompanyCategory(categoryWithStatus);
        return categoryWithStatus;
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Erro ao buscar categoria");
        return err;
      });

    return response;
  };

  return (
    <CompanyCategoryContext.Provider
      value={{
        ListCompanyCategory,
        CreateCompanyCategory,
        UpdateCompanyCategory,
        listCompanyCategory,
        SelfCompanyCategory,
        companyCategory,
        DeleteCompanyCategory
      }}
    >
      {children}
    </CompanyCategoryContext.Provider>
  );
};
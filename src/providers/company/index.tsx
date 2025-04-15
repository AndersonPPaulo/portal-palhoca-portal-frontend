"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

export interface Props {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: {
    id: string;
    name?: string;
    phone?: string;
    openingHours: string;
    description?: string;
    linkInstagram?: string;
    linkWhatsapp?: string;
    linkLocationMaps: string;
    linkLocationWaze: string;
    address: string;
    status: "active" | "inactive" | "blocked";
    created_at: Date;
    update_at: Date;
  }[];
}

interface UpdateCompanyProps {
  name: string;
  phone?: string;
  openingHours?: string;
  description?: string;
  linkInstagram?: string;
  linkWhatsapp?: string;
  linkLocationMaps?: string;
  linkLocationWaze?: string;
  address?: string;
  status: "active" | "inactive" | "blocked";
}

export interface ICompanyProps extends UpdateCompanyProps {
  id: string;
  created_at?: Date;
  update_at?: Date;
}

export type CompanyProps = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ICompanyProps[];
};

interface ICompanyData {
  ListCompany(limit?: number, page?: number): Promise<CompanyProps>;
  CreateCompany(data: UpdateCompanyProps): Promise<void>;
  UpdateCompany(data: UpdateCompanyProps, id: string): Promise<void>;
  listCompany: CompanyProps | null;
  SelfCompany(companyId: string): Promise<CompanyProps>;
  company: ICompanyProps | null;
}


interface IChildrenReact {
  children: ReactNode;
}

export const CompanyContext = createContext<ICompanyData>({} as ICompanyData);
export const CompanyProvider = ({ children }: IChildrenReact) => {
  const { push } = useRouter();
  const [listCompany, setListCompany] = useState<CompanyProps | null>(null);

  const ListCompany = async (
    limit: number = 1000,
    page: number = 1
  ): Promise<CompanyProps> => {
    const config = { params: { limit, page } };
    const response = await api
      .get("/company", config)
      .then((res) => {
        const dataWithStatus = res.data.response.data.map((company: ICompanyProps) => ({
          ...company,
          status: company.status || "active"
        }));
  
        const formattedResponse = {
          ...res.data.response,
          data: dataWithStatus
        };
  
        setListCompany(formattedResponse);
        return formattedResponse;
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Erro ao listar empresas");
        return {
          total: 0,
          page: 0,
          limit: 0,
          totalPages: 0,
          data: []
        };
      });
    return response;
  };
  

  const CreateCompany = async (data: UpdateCompanyProps): Promise<void> => {
    try {
      await api.post("/company", data);
      toast.success("Empresa criada com sucesso!");
      push("/comercio");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar empresa");
    }
  };
  

  const UpdateCompany = async (
    data: UpdateCompanyProps,
    id: string
  ): Promise<void> => {
    try {
      await api.patch(`/company/${id}`, data);
      toast.success("Empresa atualizada com sucesso!");
      push("/comercio");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar empresa");
    }
  };

  const [company, setCompany] = useState<ICompanyProps | null>(null);
  const SelfCompany = async (companyId: string): Promise<CompanyProps> => {
    const response = await api
      .get(`/company/${companyId}`)
      .then((res) => {
        const companyWithStatus = {
          ...res.data.response,
          status: res.data.response.status || "inactive"
        };
        setCompany(companyWithStatus);
        return companyWithStatus;
      })
      .catch((err) => {
        toast.error(err.response?.data?.message);
        return err;
      });

    return response;
  };

  return (
    <CompanyContext.Provider
      value={{
        ListCompany,
        CreateCompany,
        UpdateCompany,
        listCompany,
        SelfCompany,
        company
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
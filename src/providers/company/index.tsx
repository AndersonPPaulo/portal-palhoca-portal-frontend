"use client";

import { api, api_cep } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
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
  district?: string;
  status: "active" | "inactive" | "blocked";
  portalIds?: string[];
}

export interface ICompanyProps extends UpdateCompanyProps {
  id: string;
  created_at?: Date;
  update_at?: Date;
  company_image: UploadCompanyImageProps
}

export type CompanyProps = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ICompanyProps[];
};

export interface UploadCompanyImageProps {
  id?: string;
  key: string;
  url: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
  uploaded_at?: Date;
  company_id: string;
}

interface ICompanyData {
  ListCompany(limit?: number, page?: number, options?: any): Promise<CompanyProps>;
  CreateCompany(data: UpdateCompanyProps): Promise<void>;
  apiCep: GetCEPProps | null;
  setApiCep: React.Dispatch<React.SetStateAction<GetCEPProps | null>>;
  UpdateCompany(data: UpdateCompanyProps, id: string): Promise<void>;
  listCompany: CompanyProps | null;
  SelfCompany(companyId: string): Promise<CompanyProps>;
  company: ICompanyProps | null;
  CreateImageCompany(
    data: UploadCompanyImageProps,
    company_id: string
  ): Promise<void>;
  UploadCompanyLogo(file: File, company_id: string): Promise<void>;
}

interface GetCEPProps {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface IChildrenReact {
  children: ReactNode;
}

export const CompanyContext = createContext<ICompanyData>({} as ICompanyData);
export const CompanyProvider = ({ children }: IChildrenReact) => {
  const { push } = useRouter();
  const [listCompany, setListCompany] = useState<CompanyProps | null>(null);

  const ListCompany = async (limit = 10000, page = 1, options = {}): Promise<CompanyProps> => {
    const config = { params: { limit, page, ...options } };
    const response = await api
      .get("/company", config)
      .then((res) => {
        const dataWithStatus = res.data.response.data.map(
          (company: ICompanyProps) => ({
            ...company,
            status: company.status || "active",
          })
        );

        const formattedResponse = {
          ...res.data.response,
          data: dataWithStatus,
        };

        setListCompany(formattedResponse);
        return formattedResponse;
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Erro ao listar empresas");
        throw err;
      });
    return response;
  };

  const CreateCompany = async (data: UpdateCompanyProps): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      await api.post("/company", data, config);
      toast.success("Empresa criada com sucesso!");
      push("/comercio");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar empresa");
      throw err;
    }
  };

  const UpdateCompany = async (
    data: UpdateCompanyProps,
    id: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      await api.patch(`/company/${id}`, data, config);
      toast.success("Empresa atualizada com sucesso!");
      push("/comercio");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar empresa");
      throw err;
    }
  };

  // API CEP
  const [apiCep, setApiCep] = useState<GetCEPProps | null>(null);
  const GetByZipcode = async (cep: string) => {
    const response = await api_cep
      .get(`/${cep}/json`)
      .then((res) => {
        setApiCep(res.data);
        return res.data;
      })
      .catch((err) => {
        throw err;
      });

    return response;
  };

  const [company, setCompany] = useState<ICompanyProps | null>(null);
  const SelfCompany = async (companyId: string): Promise<CompanyProps> => {
    const response = await api
      .get(`/company/${companyId}`)
      .then((res) => {
        const companyWithStatus = {
          ...res.data.response,
          status: res.data.response.status || "inactive",
        };
        setCompany(companyWithStatus);
        return companyWithStatus;
      })
      .catch((err) => {
        toast.error(err.response?.data?.message);
        throw err;
      });

    return response;
  };

  const CreateImageCompany = async (
    data: UploadCompanyImageProps,
    company_id: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      await api.post(`/company/${company_id}/upload-company-image`, data, config);
      toast.success("Logo da empresa criada com sucesso!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao criar logo da empresa"
      );
      throw err;
    }
  };

  // Nova função para fazer upload direto do arquivo
  const UploadCompanyLogo = async (
    file: File,
    company_id: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const formData = new FormData();
    formData.append('company_image', file);
    
    const config = {
      headers: { 
        Authorization: `bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    };
    
    try {
      await api.post(`/company/${company_id}/upload-company-image`, formData, config);
      toast.success("Logo da empresa enviado com sucesso!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao fazer upload do logo"
      );
      throw err;
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        CreateImageCompany,
        ListCompany,
        CreateCompany,
        UpdateCompany,
        listCompany,
        SelfCompany,
        company,
        apiCep,
        setApiCep,
        UploadCompanyLogo
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
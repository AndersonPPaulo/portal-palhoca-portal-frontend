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
    email?: string;
    phone?: string;
    openingHours: string;
    description?: string;
    linkInstagram?: string;
    linkWhatsapp?: string;
    linkLocationMaps: string;
    linkLocationWaze: string;
    address: string;
    status: "active" | "inactive" | "blocked" | "new_lead";
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
  status: "active" | "inactive" | "blocked" | "new_lead" | "in_process";
  portalIds?: string[];
  companyCategoryIds?: string[];
  email: string;
  responsibleName: string;
  document_number: string;
  document_type: "cnpj" | "cpf";
  lat: string;
  long: string;
  zipcode: string;
  highlight?: boolean;
}

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

export interface ICompanyProps extends UpdateCompanyProps {
  highlight: boolean;
  id: string;
  created_at?: Date;
  update_at?: Date;
  company_image?: UploadCompanyImageProps;
  companyImage?: string;
  companyMessage?: string;
  portals?: {
    id: string;
    name: string;
    link_referer: string;
    status: boolean;
    created_at: string;
    updated_at: string;
  }[];
  company_category?: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }[];
  status: "active" | "inactive" | "blocked" | "new_lead" | "in_process";
  email: string;
  city?: string;
  document_number: string;
  document_type: "cnpj" | "cpf";
  lat: string;
  long: string;
  zipcode: string;
  state: string;
}

export type CompanyProps = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ICompanyProps[];
};

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

interface uploadResponseProps {
  url: string;
  uploadURL: string;
  displayURL: string;
}
interface ListCompanyOptions {
  name?: string;
  categories?: string[];
  highlight?: boolean;
  isActive?: boolean | string;
}

interface ICompanyData {
  ListCompany(
    page?: number,
    limit?: number,
    options?: ListCompanyOptions
  ): Promise<CompanyProps>;
  CreateCompany(data: UpdateCompanyProps): Promise<ICompanyProps | void>;
  apiCep: GetCEPProps | null;
  setApiCep: React.Dispatch<React.SetStateAction<GetCEPProps | null>>;
  UpdateCompany(data: UpdateCompanyProps, id: string): Promise<void>;
  listCompany: CompanyProps | null;
  SelfCompany(companyId: string): Promise<ICompanyProps>;
  GetCompanyById(companyId: string): Promise<ICompanyProps>;
  company: ICompanyProps | null;
  CreateImageCompany(
    data: { filename: string; contentType: string },
    company_id: string
  ): Promise<void>;
  UploadCompanyLogo(
    file: { filename: string; contentType: string },
    company_id: string
  ): Promise<uploadResponseProps>;
  currentFilters: ListCompanyOptions; // ✅ Adicionar
  currentPage: number; // ✅ Adicionar
  currentLimit: number; // ✅ Adicionar
}

interface IChildrenReact {
  children: ReactNode;
}

export const CompanyContext = createContext<ICompanyData>({} as ICompanyData);
export const CompanyProvider = ({ children }: IChildrenReact) => {
  const { push } = useRouter();
  const [listCompany, setListCompany] = useState<CompanyProps | null>(null);
  const [apiCep, setApiCep] = useState<GetCEPProps | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ListCompanyOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(9);

const ListCompany = async (
  page: number = 1,
  limit: number = 9,
  options: ListCompanyOptions = {}
): Promise<CompanyProps> => {
  setCurrentFilters(options);
  setCurrentPage(page);
  setCurrentLimit(limit);

  const params: any = {
    limit: String(limit), 
    page: String(page), 
    excludeStatus: 'new_lead,in_process', 
  };

  if (options.name) {
    params.name = options.name;
  }

  if (options.categories && options.categories.length > 0) {
    params.categories = options.categories.join(',');
  }

  if (options.highlight !== undefined && options.highlight !== null) {
    params.highlight = String(options.highlight);
  }

  if (options.isActive !== undefined && options.isActive !== null) {
    params.isActive =
      typeof options.isActive === "boolean"
        ? String(options.isActive)
        : options.isActive;
  }

  console.log('🔍 Params sendo enviados:', params);
  
  const queryString = new URLSearchParams(params).toString();

  const config = { params };

  const response = await api
    .get("/company", config)
    .then((res) => {
      console.log('📦 Total de empresas retornadas:', res.data.data?.length);
      console.log('📦 Status das empresas:', res.data.data?.map((c: any) => c.status));
      setListCompany(res.data);
      return res.data;
    })
    .catch((err) => {
      console.error("Erro ao listar empresas:", err);
      toast.error(err.response?.data?.message || "Erro ao listar empresas");
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
  const CreateCompany = async (
    data: UpdateCompanyProps
  ): Promise<ICompanyProps | void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      const response = await api.post("/company", data, config);
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar empresa");
      throw err;
    }
  };

  const GetByZipcode = async (cep: string) => {
    try {
      const response = await api_cep.get(`/${cep}/json`);
      setApiCep(response.data);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      throw err;
    }
  };

  const [company, setCompany] = useState<ICompanyProps | null>(null);

  const SelfCompany = async (companyId: string): Promise<ICompanyProps> => {
    try {
      const res = await api.get(`/company/${companyId}`);
      const companyWithStatus = {
        ...res.data.response,
        status: res.data.response.status || "inactive",
      };
      setCompany(companyWithStatus);
      return companyWithStatus;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao buscar empresa");
      throw err;
    }
  };

  // Método adicional para buscar empresa pelo ID (similar ao SelfCompany)
  const GetCompanyById = async (companyId: string): Promise<ICompanyProps> => {
    try {
      const res = await api.get(`/company/${companyId}`);
      return {
        ...res.data.response,
        status: res.data.response.status || "inactive",
      };
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao buscar detalhes da empresa"
      );
      throw err;
    }
  };

  const CreateImageCompany = async (
    data: { filename: string; contentType: string },
    company_id: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    try {
      await api.post(
        `/company/${company_id}/upload-company-image`,
        data,
        config
      );
      toast.success("Logo da empresa criada com sucesso!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao criar logo da empresa"
      );
      throw err;
    }
  };

  const UploadCompanyLogo = async (
    file: { filename: string; contentType: string },
    presignedURL: string
  ): Promise<uploadResponseProps> => {
    const config = {
      headers: {
        "Content-Type": file.contentType,
      },
    };

    try {
      const response = await api.put(presignedURL, file, config);
      toast.success("Logo da empresa enviado com sucesso!");
      return response.data;
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
        currentFilters,
        currentPage,
        currentLimit,
        CreateCompany,
        UpdateCompany,
        listCompany,
        SelfCompany,
        GetCompanyById,
        company,
        apiCep,
        setApiCep,
        UploadCompanyLogo,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

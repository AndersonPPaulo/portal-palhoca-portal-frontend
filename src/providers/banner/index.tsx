"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

export interface IBannerCreate {
  name?: string;
  link_direction?: string;
  banner_style?: string;
  date_active?: Date;
  date_expiration?: Date;
  company_id?: string;
  status?: boolean;
  banner?: File;
  portal_id: string;
}

interface Company {
  id: string;
  name: string;
}

export interface BannerItem {
  id: string;
  url: string; // era url_image no seu tipo, mas a API retorna "url"
  key: string;
  name: string;
  link_direction: string;
  banner_style: string;
  date_active: string; // vem como string ISO
  date_expiration: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  company: Company;
  banner?: File;
  portal: {
    id: string;
    name: string;
    portalReferer: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    id_portal_old_table: string;
  };
}

interface IBanner {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  data: BannerItem[];
}

interface IBannerData {
  CreateBanner(data: IBannerCreate): Promise<void>;
  ListBanners(
    page?: number,
    limit?: number,
    onlyActive?: boolean,
    portalAdmin?: boolean,
    filters?: {
      name?: string;
      status?: "true" | "false";
      bannerStyle?: string;
    }
  ): Promise<void>;
  banners: IBanner;
  UpdateBanner(data: BannerItem, id: string): Promise<void>;
  GetBanner(id: string): Promise<void>;
  banner: BannerItem;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const BannerContext = createContext<IBannerData>({} as IBannerData);

export const BannerProvider = ({ children }: ICihldrenReact) => {
  const { push, back } = useRouter();

  const CreateBanner = async (data: IBannerCreate): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const formData = new FormData();
    formData.append("name", data.name ?? "");
    formData.append("link_direction", data.link_direction ?? "");
    formData.append("banner_style", data.banner_style ?? "");
    formData.append("date_active", data.date_active?.toString() ?? "");
    formData.append("date_expiration", data.date_expiration?.toString() ?? "");
    formData.append("status", data.status?.toString() ?? "");
    formData.append("company_id", data.company_id ?? "");
    formData.append("banner", data.banner ?? "");
    formData.append("portal_id", data.portal_id ?? "");

    const config = {
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };
    const response = await api
      .post("/banner", formData, config)
      .then((res) => {
        toast.success("Banner criado com sucesso!");
        back();
      })
      .catch((err) => {
        toast.error("Erro ao criar o banner");
        return err;
      });

    return response;
  };

  const [banners, setBanners] = useState<IBanner>({} as IBanner);
  const ListBanners = async (
    page?: number,
    limit?: number,
    onlyActive?: boolean,
    portalAdmin?: boolean,
    filters: {
      name?: string;
      status?: "true" | "false";
      bannerStyle?: string;
    } = {}
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();

    const config = {
      headers: {
        Authorization: `bearer ${token}`,
      },
      params: {
        page,
        limit,
        onlyActive,
        portalAdmin,
        ...filters, // agora envia name, status, bannerStyle
      },
    };

    try {
      const response = await api.get("/banner", config);
      setBanners(response.data.response);
    } catch (err) {
      toast.error("Erro ao listar os banners");
    }
  };

  const UpdateBanner = async (data: BannerItem, id: string): Promise<void> => {
  const { "user:token": token } = parseCookies();

  const config = {
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  const formData = new FormData();
  formData.append("name", data.name ?? "");
  formData.append("link_direction", data.link_direction ?? "");
  formData.append("banner_style", data.banner_style ?? "");
  formData.append("date_active", data.date_active?.toString() ?? "");
  formData.append("date_expiration", data.date_expiration?.toString() ?? "");
  formData.append("status", data.status?.toString() ?? "");
  
  // Fix: Extract the portal ID properly
  const portalId = typeof data.portal === 'string' 
    ? data.portal
    : data.portal?.id ?? "";
  formData.append("portal_id", portalId);

  // Only add banner file if it exists
  if (data.banner) {
    formData.append("banner", data.banner);
  }

  const response = await api
    .patch(`/banner/${id}`, formData, config)
    .then((res) => {
      toast.success("Banner atualizado com sucesso!");
      push("/banners");
    })
    .catch((err) => {
      console.error("Erro ao atualizar banner:", err);
      toast.error("Erro ao atualizar o banner");
    });

  return response;
};
  const [banner, setBanner] = useState<BannerItem>({} as BannerItem);
  const GetBanner = async (id: string): Promise<void> => {
    const { "user:token": token } = parseCookies();

    const config = {
      headers: {
        Authorization: `bearer ${token}`,
      },
    };

    const response = await api
      .get(`/banner/${id}`, config)
      .then((res) => {
        setBanner(res.data.response);
      })
      .catch((err) => {
        console.error("Erro ao buscar banner:", err);
        toast.error("Erro ao carregar o banner");
      });

    return response;
  };

  return (
    <BannerContext.Provider
      value={{
        CreateBanner,
        ListBanners,
        banners,
        UpdateBanner,
        banner,
        GetBanner,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
};

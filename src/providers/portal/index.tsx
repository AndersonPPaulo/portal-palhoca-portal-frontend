"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState, useEffect } from "react";
import { toast } from "sonner";

interface PortalProps {
  name: string;
  link_referer: string;
  status: boolean;
}

interface UpdatePortalProps {
  name?: string;
  link_referer?: string;
  status?: boolean;
}

export type ResponsePromise = {
  id: string;
  name: string;
  link_referer: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

interface IPortalData {
  CreatePortal(data: PortalProps): Promise<ResponsePromise>;
  ListPortals(): Promise<ResponsePromise[]>;
  listPortals: ResponsePromise[];
  DeletePortal(portalId: string): Promise<void>;
  UpdatePortal(data: UpdatePortalProps, portalId: string): Promise<void>;
  portal: ResponsePromise | null;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const PortalContext = createContext<IPortalData>({} as IPortalData);

export const PortalProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();

  const CreatePortal = async (data: PortalProps): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    try {
      const response = await api.post("/portal", data, config);
      toast.success(`Portal adicionado com sucesso!`);

      // Recarregar a lista após a criação
      await ListPortals();

      setTimeout(() => {
        back();
      }, 1800);

      return response.data.portal;
    } catch (err: any) {
      console.error("Erro detalhado ao criar portal:", err);
      toast.error(err.response?.data?.message || "Erro ao criar portal");
      throw err;
    }
  };

  const [listPortals, setListPortals] = useState<ResponsePromise[]>([]);
  const ListPortals = async (): Promise<ResponsePromise[]> => {
    const { "user:token": token } = parseCookies();
    const response = await api
      .get("/portal", { headers: { Authorization: `bearer ${token}` } })
      .then((res) => {
        setListPortals(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const DeletePortal = async (portalId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { portalId },
    };

    try {
      await api.delete("/portal", config);
      toast.success("Portal deletado com sucesso!");

      await ListPortals();
    } catch (err: any) {
      console.error("Erro detalhado ao excluir portal:", err);
      toast.error(err.response?.data?.message || "Erro ao excluir portal");
      throw err;
    }
  };

  const UpdatePortal = async (
    data: UpdatePortalProps,
    portalId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();

    try {
      // Ajustando para usar URL com parâmetro em vez de query params
      await api.patch(`/portal/${portalId}`, data, {
        headers: { Authorization: `bearer ${token}` },
      });

      toast.success("Portal atualizado com sucesso!");

      // Recarregar depois de atualizar
      await ListPortals();
    } catch (err: any) {
      console.error("Erro detalhado ao atualizar portal:", err);
      toast.error(err.response?.data?.message || "Erro ao atualizar portal");
      throw err;
    }
  };

  return (
    <PortalContext.Provider
      value={{
        CreatePortal,
        ListPortals,
        DeletePortal,
        UpdatePortal,
        listPortals,
        portal: null,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

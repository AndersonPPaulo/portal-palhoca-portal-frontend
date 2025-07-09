"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

interface WhatsappGroupProps {
  link: string;
  portal_id: string;
  user_id: string;
}

interface UpdateWhatsappGroupProps {
  link?: string;
  is_active?: boolean;
}

export type WhatsappGroupResponse = {
  id: string;
  link: string;
  is_active: boolean;
  portal: {
    id: string;
    name: string;
    link_referer: string;
    status: boolean;
  };
  created_at: string;
  updated_at: string;
};

interface IWhatsappGroupData {
  CreateWhatsappGroup(data: WhatsappGroupProps): Promise<WhatsappGroupResponse>;
  ListWhatsappGroups(filters?: {
    portal_id?: string;
    is_active?: boolean;
  }): Promise<WhatsappGroupResponse[]>;
  listWhatsappGroups: WhatsappGroupResponse[];
  DeleteWhatsappGroup(groupId: string): Promise<void>;
  UpdateWhatsappGroup(
    data: UpdateWhatsappGroupProps,
    groupId: string
  ): Promise<void>;
  GetWhatsappGroup(groupId: string): Promise<WhatsappGroupResponse>;
  whatsappGroup: WhatsappGroupResponse | null;
}

interface IChildrenReact {
  children: ReactNode;
}

export const WhatsappGroupContext = createContext<IWhatsappGroupData>(
  {} as IWhatsappGroupData
);

export const WhatsappGroupProvider = ({ children }: IChildrenReact) => {
  const { back } = useRouter();

  const CreateWhatsappGroup = async (
    data: WhatsappGroupProps
  ): Promise<WhatsappGroupResponse> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    try {
      const response = await api.post("/whatsapp-group", data, config);
      toast.success(`Grupo de WhatsApp adicionado com sucesso!`);

      await ListWhatsappGroups();

      setTimeout(() => {
        back();
      }, 1800);

      return response.data.group;
    } catch (err: any) {
      console.error("Erro detalhado ao criar grupo de WhatsApp:", err);
      toast.error(
        err.response?.data?.message || "Erro ao criar grupo de WhatsApp"
      );
      throw err;
    }
  };

  const [listWhatsappGroups, setListWhatsappGroups] = useState<
    WhatsappGroupResponse[]
  >([]);
  const [whatsappGroup, setWhatsappGroup] =
    useState<WhatsappGroupResponse | null>(null);

  const ListWhatsappGroups = async (filters?: {
    portal_id?: string;
    is_active?: boolean;
  }): Promise<WhatsappGroupResponse[]> => {
    const { "user:token": token } = parseCookies();

    try {
      const params = new URLSearchParams();

      if (filters?.portal_id) {
        params.append("portal_id", filters.portal_id);
      }

      if (typeof filters?.is_active !== "undefined") {
        params.append("is_active", filters.is_active.toString());
      }

      const queryString = params.toString();
      const url = queryString
        ? `/whatsapp-group?${queryString}`
        : "/whatsapp-group";

      const response = await api.get(url, {
        headers: { Authorization: `bearer ${token}` },
      });

      setListWhatsappGroups(response.data.response || response.data);
      return response.data.response || response.data;
    } catch (err: any) {
      console.error("Erro ao listar grupos de WhatsApp:", err);
      toast.error(
        err.response?.data?.message || "Erro ao carregar grupos de WhatsApp"
      );
      return [];
    }
  };

  const GetWhatsappGroup = async (
    groupId: string
  ): Promise<WhatsappGroupResponse> => {
    const { "user:token": token } = parseCookies();

    try {
      const response = await api.get(`/whatsapp-group/${groupId}`, {
        headers: { Authorization: `bearer ${token}` },
      });

      setWhatsappGroup(response.data);
      return response.data;
    } catch (err: any) {
      console.error("Erro ao buscar grupo de WhatsApp:", err);
      toast.error(
        err.response?.data?.message || "Erro ao carregar grupo de WhatsApp"
      );
      throw err;
    }
  };

  const DeleteWhatsappGroup = async (groupId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();

    try {
      await api.delete(`/whatsapp-group/${groupId}`, {
        headers: { Authorization: `bearer ${token}` },
      });

      toast.success("Grupo de WhatsApp deletado com sucesso!");

      await ListWhatsappGroups();
    } catch (err: any) {
      console.error("Erro detalhado ao excluir grupo de WhatsApp:", err);
      toast.error(
        err.response?.data?.message || "Erro ao excluir grupo de WhatsApp"
      );
      throw err;
    }
  };

  const UpdateWhatsappGroup = async (
    data: UpdateWhatsappGroupProps,
    groupId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();

    try {
      await api.patch(`/whatsapp-group/${groupId}`, data, {
        headers: { Authorization: `bearer ${token}` },
      });

      toast.success("Grupo de WhatsApp atualizado com sucesso!");

      await ListWhatsappGroups();
    } catch (err: any) {
      console.error("Erro detalhado ao atualizar grupo de WhatsApp:", err);
      toast.error(
        err.response?.data?.message || "Erro ao atualizar grupo de WhatsApp"
      );
      throw err;
    }
  };

  return (
    <WhatsappGroupContext.Provider
      value={{
        CreateWhatsappGroup,
        ListWhatsappGroups,
        GetWhatsappGroup,
        DeleteWhatsappGroup,
        UpdateWhatsappGroup,
        listWhatsappGroups,
        whatsappGroup,
      }}
    >
      {children}
    </WhatsappGroupContext.Provider>
  );
};

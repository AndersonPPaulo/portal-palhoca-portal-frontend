"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

// Tipos atualizados baseados no backend
export interface UserProps {
  name: string;
  email: string;
  phone: string;
  password: string;
  topic?: string;
  roleId: string;
  chiefEditorId?: string;
  user_image: string

}

interface UpdateUserProps {
  isActive?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  topic?: string;
  roleId?: string;
  chiefEditorId?: string;
  user_image: string

}

export interface ResponsePromise {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic?: string;
  role: { id: string; name: string; isDefault?: boolean };
  password?: string;
  chiefEditor?: { id: string; name: string };
  created_at?: string;
  updated_at?: string;
  isActive?: boolean;
  user_image: string
  
}

// Tipo para Role separado
export interface Role {
  id: string;
  name: string;
  isDefault?: boolean;
}

interface IUserData {
  CreateUser(data: UserProps): Promise<ResponsePromise>;
  listUser: ResponsePromise[];
  ListUser(): Promise<ResponsePromise[]>;
  GetUser(userId: string): Promise<ResponsePromise>;
  DeleteUser(userId: string): Promise<void>;
  Profile(): Promise<ResponsePromise>;
  profile: ResponsePromise | null;
  UpdateUser(data: UpdateUserProps, userId: string): Promise<void>;
  UploadUserImage(file: File, userId: string): Promise<void>;
  roles: Role[];
  ListRoles(): Promise<Role[]>;
}

interface IChildrenReact {
  children: ReactNode;
}

export const UserContext = createContext<IUserData>({} as IUserData);

export const UserProvider = ({ children }: IChildrenReact) => {
  const { back } = useRouter();

  const CreateUser = async (data: UserProps): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
      },
    };

    try {
      const response = await api.post("/user", data, config);
      
      toast.success("Usuário criado com sucesso!");
      
      // Recarregar lista de usuários após criação
      await ListUser();
      
      setTimeout(() => {
        back();
      }, 1800);
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao criar usuário";
      toast.error(errorMessage);
      throw err;
    }
  };

  const UpdateUser = async (
    data: UpdateUserProps,
    updateUserId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { updateUserId },
    };

    try {
      await api.patch("/user", data, config);
      toast.success("Usuário atualizado com sucesso!");
      
      // Recarregar perfil e lista após atualização
      await Promise.all([Profile(), ListUser()]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao atualizar usuário";
      toast.error(errorMessage);
      throw err;
    }
  };

  const [profile, setProfile] = useState<ResponsePromise | null>(null);
  const Profile = async (): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    try {
      const response = await api.get("/profile", config);
      setProfile(response.data.response);
      return response.data.response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao carregar perfil";
      toast.error(errorMessage);
      throw err;
    }
  };

  const [listUser, setListUser] = useState<ResponsePromise[]>([]);
  const ListUser = async (): Promise<ResponsePromise[]> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    try {
      const response = await api.get("/user", config);
      setListUser(response.data.response);
      return response.data.response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao carregar usuários";
      toast.error(errorMessage);
      throw err;
    }
  };

  const GetUser = async (userId: string): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    try {
      const response = await api.get(`/user/${userId}`, config);
      return response.data.response || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao carregar usuário";
      toast.error(errorMessage);
      throw err;
    }
  };

  const UploadUserImage = async (file: File, userId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    
    const formData = new FormData();
    formData.append("user_image", file);

    try {
      await api.post(`/user/${userId}/upload-user-image`, formData, {
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Imagem do usuário atualizada com sucesso!");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao fazer upload da imagem";
      toast.error(errorMessage);
      throw err;
    }
  };

  const DeleteUser = async (userId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { userId },
    };

    try {
      await api.delete("/user", config);
      toast.success("Usuário deletado com sucesso!");
      
      // Recarregar lista após deleção
      await ListUser();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao deletar usuário";
      toast.error(errorMessage);
      throw err;
    }
  };

  // Estado e método para roles
  const [roles, setRoles] = useState<Role[]>([]);
  const ListRoles = async (): Promise<Role[]> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    try {
      const response = await api.get("/role", config); // Rota correta baseada no backend
      const rolesData = response.data.response || response.data;
      setRoles(rolesData);
      return rolesData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao carregar funções";
      toast.error(errorMessage);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        CreateUser,
        ListUser,
        listUser,
        GetUser,
        DeleteUser,
        Profile,
        profile,
        UpdateUser,
        UploadUserImage,
        roles,
        ListRoles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
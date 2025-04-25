"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

export interface UserProps {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: { id: string; name: string; isDefault: boolean };
}

interface UpdateUserProps {
  isActive?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  role?: { id: string; name: string; isDefault: boolean };
}



export interface ResponsePromise {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: { id: string; name: string; isDefault: boolean };
  password?: string;
  chiefEditor: {id: string}
}

interface IUserData {
  CreateUser(data: UserProps): Promise<ResponsePromise>;
  listUser: ResponsePromise[];
  ListUser(): Promise<ResponsePromise[]>;
  DeleteUser(userId: string): Promise<void>;
  Profile(): Promise<ResponsePromise>;
  profile: ResponsePromise | null;
  UpdateUser(data: UpdateUserProps, userId: string): Promise<void>;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const UserContext = createContext<IUserData>({} as IUserData);

export const UserProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();

  const CreateUser = async (data: UserProps): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
      },
    };
    const response = await api
      .post("/user", data, config)
      .then(() => {
        toast.success(`Criado com sucesso!`);
        setTimeout(() => {
          back();
        }, 1800);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
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
    const response = await api
      .patch("/user", data, config)
      .then(() => {
        toast.success("Conta atualizado com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      })
      .finally(() => {
        Profile();
      });

    return response;
  };

  const [profile, setProfile] = useState<ResponsePromise | null>(null);
  const Profile = async (): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get("/profile", config)
      .then((res) => {
        setProfile(res.data.response);
        console.log('res', res.data.response)
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const [listUser, setListUser] = useState<ResponsePromise[]>([]);
  const ListUser = async (): Promise<ResponsePromise[]> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get("/users", config)
      .then((res) => {
        setListUser(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const DeleteUser = async (userId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { userId },
    };
    const response = await api
      .delete("/user", config)
      .then(() => {
        toast.success("Usuário deletado com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  return (
    <UserContext.Provider
      value={{
        CreateUser,
        ListUser,
        listUser,
        DeleteUser,
        Profile,
        profile,
        UpdateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

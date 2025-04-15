"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { createContext, ReactNode } from "react";
import { toast } from "sonner";

interface LoginProps {
  email: string;
  password: string;
}

interface IAuthData {
  Login(data: LoginProps): Promise<object>;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const AuthContext = createContext<IAuthData>({} as IAuthData);

export const AuthProvider = ({ children }: ICihldrenReact) => {
  const { push } = useRouter();

  const Login = async (data: LoginProps) => {
    const response = await api
      .post("/login", data)
      .then((res) => {
        setCookie({ res }, "user:token", res.data.token, {
          maxAge: 60 * 60 * 24 * 2,
          path: "/",
        });
        push("/painel");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        Login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

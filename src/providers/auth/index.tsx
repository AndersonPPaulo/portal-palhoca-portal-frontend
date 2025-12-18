"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { createContext, ReactNode } from "react";
import { toast } from "sonner";
import { getApiErrorMessage, hasValidResponse } from "@/utils/apiErrorHandler";

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
    try {
      console.log("🔐 Tentando fazer login...", { email: data.email });

      const response = await api.post("/login", data);

      console.log("✅ Resposta do login:", response);

      // Verificar se a resposta tem a estrutura esperada
      if (!hasValidResponse(response)) {
        throw new Error("Resposta inválida da API (response.data é undefined)");
      }

      const token = response.data.token || response.data.access_token;

      if (!token) {
        console.error("❌ Estrutura da resposta:", response.data);
        throw new Error("Token não encontrado na resposta da API");
      }

      setCookie(null, "user:token", token, {
        maxAge: 60 * 60 * 24 * 2,
        path: "/",
      });

      console.log("✅ Login realizado com sucesso!");
      push("/dashboard");

      return response;
    } catch (err: any) {
      console.error("❌ Erro no login:", err);
      console.error("Detalhes do erro:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const errorMessage = getApiErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    }
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

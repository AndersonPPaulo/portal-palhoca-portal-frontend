/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { UserContext } from "@/providers/user";
import { toast } from "sonner";
import CustomSelect from "@/components/select/custom-select";

interface OptionType {
  value: string;
  label: string;
}

const editUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone/celular obrigatório"),
  password: z.string().optional(),
  isActive: z.string().min(1, "Status é obrigatório"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface FormEditUserProps {
  userId: string;
}

export default function FormEditUser({ userId }: FormEditUserProps) {
  const { GetUser, UpdateUserAsAdmin, profile } = useContext(UserContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const statusOptions: OptionType[] = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      isActive: "true",
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const user = await GetUser(userId);
        setUserData(user);

        // Preencher o formulário com os dados do usuário
        setValue("name", user.name);
        setValue("phone", user.phone || "");
        setValue("isActive", user.isActive ? "true" : "false");
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        toast.error("Erro ao carregar dados do usuário");
        back();
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const getProfileImageUrl = () => {
    if (userData?.user_image?.url) {
      return userData.user_image.url;
    }
    return null;
  };

  const getInitials = () => {
    if (!userData?.name) return "??";
    return userData.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const onSubmit = async (data: EditUserFormData) => {
    try {
      setIsSubmitting(true);

      // Preparar payload apenas com campos editáveis
      const payload: any = {
        name: data.name,
        phone: data.phone,
        isActive: data.isActive === "true",
      };

      // Só incluir senha se foi preenchida
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }

      await UpdateUserAsAdmin(payload, userId);

      toast.success("Usuário atualizado com sucesso!");

      setTimeout(() => {
        back();
      }, 1500);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar usuário:", error);

      let errorMessage = "Erro ao atualizar usuário";
      let errorDetails: string[] = [];

      if (error?.response?.data) {
        const responseData = error.response.data;

        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }

        if (Array.isArray(responseData.errors)) {
          errorDetails = responseData.errors.map((err: any) => {
            if (typeof err === "string") return err;
            if (err.message) return err.message;
            if (err.msg) return err.msg;
            return JSON.stringify(err);
          });
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      let description = "";
      if (error?.response?.status) {
        description = `Código: ${error.response.status}`;
      }
      if (errorDetails.length > 0) {
        description += description ? "\n" : "";
        description += errorDetails.join("\n");
      }

      toast.error(errorMessage, {
        duration: 7000,
        description: description || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 rounded-[24px] bg-white flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          <p className="text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
        </div>

        {/* Layout com foto à esquerda e inputs em duas linhas à direita */}
        <div className="flex gap-6 items-start">
          {/* Foto de Perfil Circular - Não editável */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()!}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {getInitials()}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Foto não editável
            </p>
          </div>

          {/* Container dos inputs organizados */}
          <div className="flex-1 space-y-4">
            {/* Primeira linha - Campos não editáveis (somente exibição) */}
            <div className="grid grid-cols-3 gap-4">
              {/* Email - somente leitura */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Cargo - somente leitura */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <input
                  type="text"
                  value={userData?.role?.name || "Sem cargo"}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Responsável - somente leitura */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Responsável Técnico
                </label>
                <input
                  type="text"
                  value={userData?.chiefEditor?.name || "-"}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Segunda linha - Campos editáveis */}
            <div className="grid grid-cols-3 gap-4">
              {/* Nome - editável */}
              <div className="space-y-1">
                <CustomInput
                  id="name"
                  label="Nome"
                  {...register("name")}
                  placeholder="Nome completo"
                />
                {errors.name && (
                  <span className="text-xs text-red-500 block">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Telefone - editável */}
              <div className="space-y-1">
                <CustomInput
                  id="phone"
                  label="Telefone"
                  {...register("phone")}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <span className="text-xs text-red-500 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              {/* Senha - editável (opcional) */}
              <div className="space-y-1">
                <CustomInput
                  id="password"
                  label="Nova Senha (opcional)"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                />
                <span className="text-xs text-gray-500">
                  Deixe em branco para manter a senha atual
                </span>
                {errors.password && (
                  <span className="text-xs text-red-500 block">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            {/* Terceira linha - Status e Título da Coluna */}
            <div className="grid grid-cols-3 gap-4">
              {/* Status - editável */}
              <div className="space-y-1">
                <CustomSelect
                  id="isActive"
                  label="Status"
                  options={statusOptions}
                  value={watch("isActive")}
                  onChange={(value) =>
                    setValue(
                      "isActive",
                      Array.isArray(value) ? (value[0] ?? "true") : value,
                    )
                  }
                  placeholder="Selecione o status"
                />
                {errors.isActive && (
                  <span className="text-xs text-red-500 block">
                    {errors.isActive.message}
                  </span>
                )}
              </div>

              {/* Título da Coluna - somente leitura */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Título da Coluna
                </label>
                <input
                  type="text"
                  value={userData?.topic || "-"}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex w-full justify-end items-center pt-4">
          <div className="space-x-4">
            <Button
              type="button"
              onClick={back}
              className="bg-red-light text-[#611A1A] hover:bg-red-light/80 rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center">Salvar Alterações</div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

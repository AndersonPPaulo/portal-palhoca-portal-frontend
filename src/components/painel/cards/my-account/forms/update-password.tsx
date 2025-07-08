"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/input/custom-input";
import { useContext, useState } from "react";
import { UserContext } from "@/providers/user";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "A senha atual deve ter no mínimo 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function FormUpdatePassword() {
  const { UpdatePasswordUser, profile } = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setIsSubmitting(true);

      //   Exemplo de envio para backend:
      await UpdatePasswordUser(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        profile!.id
      );

      toast.success("Senha atualizada com sucesso!");
      reset();
    } catch (error) {
      toast.error("Erro ao atualizar a senha");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Senha atual */}
        <div className="space-y-1">
          <CustomInput
            id="currentPassword"
            label="Senha atual"
            type="password"
            placeholder="••••••••"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <span className="text-sm text-red-500">
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        {/* Nova senha */}
        <div className="space-y-1">
          <CustomInput
            id="newPassword"
            label="Nova senha"
            type="password"
            placeholder="••••••••"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <span className="text-sm text-red-500">
              {errors.newPassword.message}
            </span>
          )}
        </div>

        {/* Confirmar nova senha (linha única abaixo se quiser ocupar os dois lados) */}
        <div className="md:col-span-2 space-y-1">
          <CustomInput
            id="confirmPassword"
            label="Confirmar nova senha"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Atualizar Senha"}
        </Button>
      </div>
    </form>
  );
}

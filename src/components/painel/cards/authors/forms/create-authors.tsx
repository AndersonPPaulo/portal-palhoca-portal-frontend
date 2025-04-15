"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { UserContext } from "@/providers/user";

const authorsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().min(1, "Email obrigatório"),
  phone: z.string().min(1, "Telefone/celular obrigatório"),
  role: z.string().min(1, "Função obrigatório"),
  password: z.string().min(1, "Senha obrigatório"),
});

type AuthorsFormData = z.infer<typeof authorsSchema>;

export default function FormCreateAuthors() {
  const { CreateUser } = useContext(UserContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AuthorsFormData>({
    resolver: zodResolver(authorsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "autor",
      password: "",
    },
  });

  const onSubmit = async (data: AuthorsFormData) => {
    setIsSubmitting(true);
    try {
      await CreateUser(data);
      setTimeout(() => {
        setIsSubmitting(false);
        reset();
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      alert(error);
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <CustomInput
              id="name"
              label="Nome"
              {...register("name")}
              placeholder="Digite o nome do Autor"
            />
            {errors.name && (
              <span className="text-sm text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <CustomInput
              id="email"
              label="Email"
              {...register("email")}
              placeholder="Digite o nome do Autor"
            />
            {errors.email && (
              <span className="text-sm text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-2">
            <CustomInput
              id="phone"
              label="Telefone"
              {...register("phone")}
              placeholder="(xx) xxxxx-xxxx"
            />
            {errors.phone && (
              <span className="text-sm text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <CustomInput
              id="password"
              label="Senha"
              type="password"
              {...register("password")}
              placeholder="Digite a senha de acesso do autor"
            />
            {errors.password && (
              <span className="text-sm text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <CustomInput
              id="role"
              disabled
              label="Função"
              {...register("role")}
              placeholder="Autor"
              onChange={() => {
                setValue("role", "autor");
              }}
            />
            {errors.role && (
              <span className="text-sm text-red-500">
                {errors.role.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end items-center">
          <div className="space-x-4">
            <Button
              type="button"
              onClick={back}
              className="bg-red-light text-[#611A1A] hover:bg-red-light/80  rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Criar Categoria
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

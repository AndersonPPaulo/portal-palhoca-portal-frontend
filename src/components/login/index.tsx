"use client";

import LogoSi3Web from "@/assets/logo-si3.png";
import Image from "next/image";
import { Button } from "../ui/button";
import CustomInput from "../input/custom-input";
import { useContext, useState } from "react";

import { z } from "zod";
import { AuthContext } from "@/providers/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginPage() {
  const { Login } = useContext(AuthContext);
  const [isSubmiting, setIsSubmitting] = useState(false);

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .email("Digite um e-mail válido"),
    password: z
      .string()
      .min(3, "A senha deve ter no mínimo 3 caracteres")
      .max(50, "A senha deve ter no máximo 50 caracteres"),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await Login(data);
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
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-white p-12 rounded-[48px] shadow-lg w-[30%]">
        <Image
          src={LogoSi3Web}
          alt="Logomarca Si3 sistemas"
          className="h-20 w-60"
          priority
        />
        <form className="space-y-6 mt-10" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <CustomInput
              {...register("email")}
              type="email"
              id="email"
              placeholder="Digite seu email"
              error={errors.email && "Email invalido"}
            />
          </div>

          <CustomInput
            {...register("password")}
            type="password"
            id="password"
            placeholder="Digite sua senha"
            error={errors.password && "Senha invalida"}
          />

          <Button
            className="w-full bg-primary text-white h-12 shadow-lg rounded-[32px] hover:bg-primary/80 transition"
            disabled={isSubmiting}
          >
            Fazer login
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import LogoSi3Web from "@/assets/logo-si3.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/input/custom-input";
import { useContext, useState } from "react";
import { z } from "zod";
import { AuthContext } from "@/providers/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";

export default function ModernLoginPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8">
            <Image
              src={LogoSi3Web.src}
              alt="SI3 Sistemas"
              width={300}
              height={80}
              className="brightness-0 invert"
              priority
            />
          </div>
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo de volta!</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Acesse sua conta e continue gerenciando seus projetos com a
              plataforma da sistemas da si3.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src={LogoSi3Web.src}
              alt="SI3 Sistemas"
              width={240}
              height={64}
              className="mx-auto"
              priority
            />
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-blue-100/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Fazer Login
              </h2>
              <p className="text-gray-600">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <CustomInput
                    {...register("email")}
                    type="email"
                    id="email"
                    placeholder="Digite seu email"
                    className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    error={errors.email?.message}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <CustomInput
                    {...register("password")}
                    type="password"
                    id="password"
                    placeholder="Digite sua senha"
                    className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    error={errors.password?.message}
                  />
                </div>
              </div>

              {/* esqueci minha senha / lembrar login */}
              {/* <div className="text-end text-sm bg-red-300">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-600">Lembrar de mim</span>
                </label>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Esqueceu a senha?
                </a>
              </div> */}

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmiting}
              >
                {isSubmiting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Fazer Login"
                )}
              </Button>
            </form>

            {/* <div className="mt-8 text-center">
              <p className="text-gray-600">
                Não tem uma conta?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Cadastre-se aqui
                </a>
              </p>
            </div> */}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 SI3 Sistemas. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

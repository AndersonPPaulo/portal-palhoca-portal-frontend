"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import CustomSelect from "@/components/select/custom-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { PortalContext } from "@/providers/portal";

const portalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  link_referer: z.string().min(1, "Link de redirecionamento é obrigatório"),
  status: z.boolean(),
});

type PortalFormData = z.infer<typeof portalSchema>;

export default function FormCreatePortals() {
  const { CreatePortal } = useContext(PortalContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusValue, setStatusValue] = useState("true");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PortalFormData>({
    resolver: zodResolver(portalSchema),
    defaultValues: {
      name: "",
      link_referer: "",
      status: true, // Ativo por padrão
    },
  });

  const statusOptions = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

  const handleStatusChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    setStatusValue(stringValue);
    setValue("status", stringValue === "true");
  };

  const onSubmit = async (data: PortalFormData) => {
    try {
      setIsSubmitting(true);

      await CreatePortal({
        name: data.name,
        link_referer: data.link_referer,
        status: data.status,
      });

      // Limpar formulário
      reset();
      setStatusValue("true");
    } catch (error) {
      console.error("Erro ao criar portal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
        </div>

        <div className="space-y-4">
          {/* Nome do Portal */}
          <div className="space-y-1">
            <CustomInput
              id="name"
              label="Nome"
              {...register("name")}
              placeholder="Nome do portal"
            />
            {errors.name && (
              <span className="text-xs text-red-500 block px-6">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Link de Redirecionamento */}
          <div className="space-y-1">
            <CustomInput
              id="link_referer"
              label="Link de redirecionamento"
              {...register("link_referer")}
              placeholder="https://exemplo.com"
            />
            {errors.link_referer && (
              <span className="text-xs text-red-500 block px-6">
                {errors.link_referer.message}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <CustomSelect
              id="status"
              label="Status"
              options={statusOptions}
              value={statusValue}
              onChange={handleStatusChange}
              placeholder="Selecione o status"
              error={errors.status?.message}
            />
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
                  Criando...
                </div>
              ) : (
                "Criar Portal"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

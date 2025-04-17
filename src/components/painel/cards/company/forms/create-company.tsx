"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { useRouter } from "next/navigation";
import { CompanyContext } from "@/providers/company";
import ReturnPageButton from "@/components/button/returnPage";
import { Button } from "@/components/ui/button";

const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  openingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
  description: z.string().optional(),
  linkInstagram: z.string().url("URL inválida").optional(),
  linkWhatsapp: z.string().url("URL inválida").optional(),
  linkLocationMaps: z.string().url("URL inválida"),
  linkLocationWaze: z.string().url("URL inválida"),
  address: z.string().min(1, "Endereço é obrigatório"),
  status: z.enum(["active", "inactive", "blocked"]),
});

type CompanyFormData = z.infer<typeof companySchema>;

const statusLabels: Record<CompanyFormData["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export default function FormCreateCompany() {
  const { back } = useRouter();
  const { CreateCompany } = useContext(CompanyContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      phone: "",
      openingHours: "",
      description: "",
      linkInstagram: "",
      linkWhatsapp: "",
      linkLocationMaps: "",
      linkLocationWaze: "",
      address: "",
      status: "active",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true);
      await CreateCompany(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <ReturnPageButton />

            <div className="flex flex-col">
              <label htmlFor="status" className="text-gray-500 mb-1">
                Status
              </label>
              <select
                id="status"
                {...register("status")}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <span className="text-red-500">{errors.status.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CustomInput
              id="name"
              label="Nome da Empresa"
              {...register("name")}
              placeholder="Digite o nome"
            />
            {errors.name && (
              <span className="text-red-500">{errors.name.message}</span>
            )}

            <CustomInput
              id="phone"
              label="Telefone"
              {...register("phone")}
              placeholder="(00) 00000-0000"
            />

            <CustomInput
              id="openingHours"
              label="Horário de Funcionamento"
              {...register("openingHours")}
              placeholder="Seg a Sab - 09h às 18h"
            />
            {errors.openingHours && (
              <span className="text-red-500">
                {errors.openingHours.message}
              </span>
            )}

            <CustomInput
              id="address"
              label="Endereço"
              {...register("address")}
              placeholder="Rua, número, cidade..."
            />
            {errors.address && (
              <span className="text-red-500">{errors.address.message}</span>
            )}

            <CustomInput
              id="linkLocationMaps"
              label="Link Google Maps"
              {...register("linkLocationMaps")}
              placeholder="https://maps.google.com/..."
            />

            <CustomInput
              id="linkLocationWaze"
              label="Link Waze"
              {...register("linkLocationWaze")}
              placeholder="https://waze.com/..."
            />

            <CustomInput
              id="linkInstagram"
              label="Instagram"
              {...register("linkInstagram")}
              placeholder="https://instagram.com/..."
            />

            <CustomInput
              id="linkWhatsapp"
              label="WhatsApp"
              {...register("linkWhatsapp")}
              placeholder="https://wa.me/..."
            />
          </div>

          <CustomInput
            id="description"
            label="Descrição"
            textareaInput
            {...register("description")}
            placeholder="Descreva a empresa, produtos ou serviços"
          />

          <div className="flex justify-end gap-4">
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
              Criar Empresa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

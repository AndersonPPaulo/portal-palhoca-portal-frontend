"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/input/custom-input";
import ReturnPageButton from "@/components/button/returnPage";
import { useRouter } from "next/navigation";
import {
  CompanyContext,
  ICompanyProps,
} from "@/providers/company";

const companySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  openingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
  description: z.string(),
  linkInstagram: z.string().url("Link inválido").optional(),
  linkWhatsapp: z.string().url("Link inválido").optional(),
  linkLocationMaps: z.string().url("Link inválido").optional(),
  linkLocationWaze: z.string().url("Link inválido").optional(),
  address: z.string().min(1, "Endereço é obrigatório"),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface FormUpdateCompanyProps {
  companyData: ICompanyProps;
}

const statusLabels: Record<CompanyFormData["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export default function FormUpdateCompany({
  companyData,
}: FormUpdateCompanyProps) {
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { UpdateCompany } = useContext(CompanyContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: companyData.name,
      phone: companyData.phone,
      openingHours: companyData.openingHours,
      description: companyData.description,
      linkInstagram: companyData.linkInstagram,
      linkWhatsapp: companyData.linkWhatsapp,
      linkLocationMaps: companyData.linkLocationMaps,
      linkLocationWaze: companyData.linkLocationWaze,
      address: companyData.address,
      status: companyData.status,
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        reset({
          name: companyData.name,
          phone: companyData.phone,
          openingHours: companyData.openingHours,
          description: companyData.description,
          linkInstagram: companyData.linkInstagram || "",
          linkWhatsapp: companyData.linkWhatsapp || "",
          linkLocationMaps: companyData.linkLocationMaps || "",
          linkLocationWaze: companyData.linkLocationWaze || "",
          address: companyData.address,
          status: companyData.status,
        });
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyData, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true);
      await UpdateCompany(data, companyData.id);
      console.log("Empresa atualizada com sucesso:", data);
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[24px]">
        <p>Carregando dados da empresa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="flex justify-between items-center -mb-4">
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
                <span className="text-red-500 text-sm">
                  {errors.status.message}
                </span>
              )}
            </div>
          </div>

          <CustomInput
            id="name"
            label="Nome da Empresa"
            {...register("name")}
            placeholder="Digite o nome"
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}

          <div className="flex gap-6">
            <CustomInput
              id="phone"
              label="Telefone"
              {...register("phone")}
              placeholder="(xx) xxxxx-xxxx"
            />
            <CustomInput
              id="openingHours"
              label="Horário de Funcionamento"
              {...register("openingHours")}
              placeholder="Ex: Seg-Sex 8h às 18h"
            />
          </div>

          <CustomInput
            id="description"
            label="Descrição"
            textareaInput
            {...register("description")}
            placeholder="Digite a descrição da empresa"
          />
          {errors.description && (
            <span className="text-sm text-red-500">
              {errors.description.message}
            </span>
          )}

          <CustomInput
            id="address"
            label="Endereço"
            {...register("address")}
            placeholder="Digite o endereço completo"
          />
          {errors.address && (
            <span className="text-sm text-red-500">
              {errors.address.message}
            </span>
          )}

          <div className="grid grid-cols-2 gap-6">
            <CustomInput
              id="linkInstagram"
              label="Link do Instagram"
              {...register("linkInstagram")}
              placeholder="https://instagram.com/suaempresa"
            />
            <CustomInput
              id="linkWhatsapp"
              label="Link do WhatsApp"
              {...register("linkWhatsapp")}
              placeholder="https://wa.me/xxxxxxxxxxx"
            />
            <CustomInput
              id="linkLocationMaps"
              label="Link do Google Maps"
              {...register("linkLocationMaps")}
              placeholder="https://maps.google.com/..."
            />
            <CustomInput
              id="linkLocationWaze"
              label="Link do Waze"
              {...register("linkLocationWaze")}
              placeholder="https://waze.com/..."
            />
          </div>

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
              Atualizar Empresa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

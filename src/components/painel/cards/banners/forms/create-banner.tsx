"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BannerContext } from "@/providers/banner";
import { bannerDimensions, type BannerType } from "../bannerDimensions";
import CustomInput from "@/components/input/custom-input";
import { CompanyContext } from "@/providers/company";
import { CompanySelectCombobox } from "../comboboxSelect";
import ReturnPageButton from "@/components/button/returnPage";

const bannerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  link_direction: z.string().url("Insira uma URL válida"),
  banner_style: z.enum(["topo", "destaque", "sidebar", "noticia"]),
  date_active: z.string().min(1, "Data de ativação é obrigatória"),
  date_expiration: z.string().min(1, "Data de expiração é obrigatória"),
  status: z.boolean(),
  company_id: z.string().min(1),
  banner: z.any().refine((file) => file?.length === 1, "Imagem é obrigatória"),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export function CreateBannerForm() {
  const { CreateBanner } = useContext(BannerContext);
  const { ListCompany, listCompany } = useContext(CompanyContext);

  useEffect(() => {
    ListCompany(); // buscar todas as empresas
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
  });

  const bannerStyle = watch("banner_style");
  const image = watch("banner")?.[0];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSizeValid, setImageSizeValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);

        const img = new Image();
        img.src = result;

        img.onload = () => {
          const expected = bannerDimensions[bannerStyle as BannerType];
          if (!expected) return;

          if (img.width !== expected.width || img.height !== expected.height) {
            setImageSizeValid(false);
            toast.error(
              `Tamanho inválido: Esperado ${expected.width}x${expected.height}, Recebido ${img.width}x${img.height}`
            );
          } else {
            setImageSizeValid(true);
          }
        };
      };
      reader.readAsDataURL(image);
    } else {
      setImagePreview(null);
    }
  }, [image, bannerStyle]);

  const onSubmit = async (data: BannerFormData) => {
    if (!imageSizeValid) {
      toast.error("As dimensões da imagem estão incorretas.");
      return;
    }

    try {
      setIsSubmitting(true);
      await CreateBanner({
        ...data,
        banner: data.banner[0],
        date_active: new Date(data.date_active),
        date_expiration: new Date(data.date_expiration),
      });
    } catch (error) {
      console.error("Erro ao criar banner:", error);
      toast.error("Erro ao criar banner. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-xl shadow overflow-hidden"
      >
        {/* Coluna 1 - Informações do Banner */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 ">
            <ReturnPageButton />

            <h2 className="text-xl font-semibold text-gray-800">
              Informações do Banner
            </h2>
          </div>

          {/* Nome */}
          <div>
            <CustomInput
              placeholder="Insira um nome de identificação"
              label="Nome do Banner"
              {...register("name")}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* URL */}
          <div>
            <CustomInput
              placeholder="https://www.esse-link.com.br"
              type="url"
              label="URL de Destino"
              {...register("link_direction")}
            />
            {errors.link_direction && (
              <span className="text-red-500 text-sm">
                {errors.link_direction.message}
              </span>
            )}
          </div>

          {/* Tipo */}
          <div>
            <Label className="mb-2 block text-base text-black">
              Tipo do Banner
            </Label>
            <Select
              onValueChange={(val) =>
                setValue("banner_style", val as BannerType)
              }
            >
              <SelectTrigger className="bg-white h-[50px] rounded-3xl border">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                {Object.entries(bannerDimensions).map(
                  ([key, { width, height }]) => (
                    <SelectItem key={key} value={key}>
                      {key} - {width}x{height}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.banner_style && (
              <span className="text-red-500 text-sm">
                {errors.banner_style.message}
              </span>
            )}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomInput
                label="Data de Ativação"
                type="date"
                {...register("date_active")}
              />
              {errors.date_active && (
                <span className="text-red-500 text-sm">
                  {errors.date_active.message}
                </span>
              )}
            </div>
            <div>
              <CustomInput
                label="Data de Expiração"
                type="date"
                {...register("date_expiration")}
              />
              {errors.date_expiration && (
                <span className="text-red-500 text-sm">
                  {errors.date_expiration.message}
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="mb-2 block text-base text-black">Status</Label>
            <Select onValueChange={(val) => setValue("status", val === "true")}>
              <SelectTrigger className="bg-white h-[50px] rounded-3xl border">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem key="true" value="true">
                  Ativo
                </SelectItem>
                <SelectItem key="false" value="false">
                  Inativo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empresa */}
          {listCompany && (
            <div>
              <Label className="mb-2 block text-base text-black">Empresa</Label>
              <CompanySelectCombobox
                companies={listCompany.data.filter(
                  (c) => c.status === "active"
                )}
                value={watch("company_id")}
                onChange={(val) => setValue("company_id", val)}
              />
              {errors.company_id && (
                <span className="text-red-500 text-sm">
                  {errors.company_id.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Coluna 2 - Upload e Preview */}
        <div className="p-6 bg-gray-50 space-y-5 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Imagem do Banner
          </h2>

          {/* Upload */}
          <div>
            <Label className="mb-2 block text-base text-black">
              Selecione uma imagem
            </Label>
            <CustomInput type="file" accept="image/*" {...register("banner")} />
            {typeof errors.banner?.message === "string" && (
              <span className="text-red-500 text-sm">
                {errors.banner.message}
              </span>
            )}{" "}
            {!imageSizeValid && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                Dimensões incorretas. Verifique o tamanho recomendado para o
                tipo de banner selecionado.
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-grow flex flex-col">
            {bannerStyle && (
              <div className="mb-2 text-sm text-gray-600">
                Dimensões recomendadas:
                {bannerDimensions[bannerStyle as BannerType]?.width || ""}x
                {bannerDimensions[bannerStyle as BannerType]?.height || ""}
                pixels
              </div>
            )}

            <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-white">
              {imagePreview ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pré-visualização:
                  </div>
                  <div className="relative max-w-full max-h-[300px] overflow-hidden rounded-md border border-gray-200 shadow-sm">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview do banner"
                      className="max-w-full max-h-[300px] object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Nenhuma imagem selecionada</p>
                  <p className="text-sm mt-1">
                    Faça upload de uma imagem para visualizar o preview
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botão */}
          <Button
            type="submit"
            className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
            disabled={isSubmitting}
          >
            Criar Artigo
          </Button>
        </div>
      </form>
    </div>
  );
}

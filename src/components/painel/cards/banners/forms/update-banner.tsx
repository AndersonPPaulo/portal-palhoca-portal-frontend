"use client";

import { BannerContext, BannerItem } from "@/providers/banner";
import { useContext, useEffect, useState } from "react";
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
import { bannerDimensions, type BannerType } from "../bannerDimensions";
import CustomInput from "@/components/input/custom-input";
import { CompanyContext } from "@/providers/company";
import { CompanySelectCombobox } from "../comboboxSelect";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import formatDateForInput from "@/utils/formatDateForInput";

interface IBannerFormProps {
  bannerData?: Partial<BannerItem>;
}

export function FormUpdateBanner({ bannerData }: IBannerFormProps) {
  const { back } = useRouter();

  const { UpdateBanner } = useContext(BannerContext);
  const { ListCompany, listCompany } = useContext(CompanyContext);

  const [name, setName] = useState(bannerData?.name ?? "");
  const [linkDirection, setLinkDirection] = useState(
    bannerData?.link_direction ?? ""
  );
  const [bannerStyle, setBannerStyle] = useState(
    bannerData?.banner_style ?? ""
  );
  const [dateActive, setDateActive] = useState(
    formatDateForInput(bannerData?.date_active ?? "")
  );
  const [dateExpiration, setDateExpiration] = useState(
    formatDateForInput(bannerData?.date_expiration ?? "")
  );
  const [status, setStatus] = useState(
    bannerData?.status?.toString() ?? "true"
  );
  const [companyId, setCompanyId] = useState(bannerData?.company?.id ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(
    bannerData?.url ?? null
  );
  const [imageSizeValid, setImageSizeValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ListCompany();
  }, []);

  useEffect(() => {
    if (bannerFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewBanner(result);

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
      reader.readAsDataURL(bannerFile);
    }
  }, [bannerFile, bannerStyle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageSizeValid && bannerFile) {
      toast.error("As dimensões da imagem estão incorretas.");
      return;
    }

    try {
      setIsSubmitting(true);
      const bannerItem: BannerItem = {
        id: bannerData?.id ?? "",
        name,
        link_direction: linkDirection,
        banner_style: bannerStyle,
        date_active: new Date(dateActive).toISOString(),
        date_expiration: new Date(dateExpiration).toISOString(),
        status: status === "true",
        company: { id: bannerData?.company?.id || "", name: companyId },
        url: previewBanner || "",
        key: bannerData?.key || "",
        created_at: bannerData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        banner: bannerFile ?? undefined, // <-- Adicione isso
      };

      await UpdateBanner(bannerItem, bannerData?.id || "");
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      toast.error("Erro ao atualizar banner. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-xl shadow "
      >
        {/* Coluna 1 - Informações do Banner */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 ">
            <ReturnPageButton />

            <h2 className="text-xl font-semibold text-gray-800">
              Informações do Banner
            </h2>
          </div>

          <div>
            <CustomInput
              label="Nome do Banner"
              placeholder="Insira um nome de identificação"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <CustomInput
              label="URL de Destino"
              placeholder="https://www.esse-link.com.br"
              type="url"
              value={linkDirection}
              onChange={(e) => setLinkDirection(e.target.value)}
            />
          </div>

          <div>
            <Label className="ms-4 mb-2 block text-base text-black">
              Tipo do Banner
            </Label>
            <Select value={bannerStyle} onValueChange={setBannerStyle}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomInput
                label="Data de Ativação"
                type="date"
                value={dateActive}
                onChange={(e) => setDateActive(e.target.value)}
              />
            </div>
            <div>
              <CustomInput
                label="Data de Expiração"
                type="date"
                value={dateExpiration}
                onChange={(e) => setDateExpiration(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="ms-4 mb-2 block text-base text-black">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-white h-[50px] rounded-3xl border">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {listCompany && (
            <div>
              <Label className="ms-4 mb-2 block text-base text-black">
                Empresa
              </Label>
              <CompanySelectCombobox
                companies={listCompany.data.filter(
                  (c) => c.status === "active"
                )}
                value={companyId}
                onChange={setCompanyId}
              />
            </div>
          )}
        </div>

        {/* Coluna 2 - Upload e Preview */}
        <div className="p-6 bg-gray-50 space-y-5 flex flex-col rounded-r-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Imagem do Banner
          </h2>

          <div>
            <Label className="mb-2 block text-base text-black">
              Selecione uma imagem
            </Label>
            <CustomInput
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setBannerFile(e.target.files[0]);
                }
              }}
            />
            {!imageSizeValid && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                Dimensões incorretas. Verifique o tamanho recomendado para o
                tipo de banner selecionado.
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col">
            {bannerStyle && (
              <div className="mb-2 text-sm text-gray-600">
                Dimensões recomendadas:{" "}
                {bannerDimensions[bannerStyle as BannerType]?.width || ""}x
                {bannerDimensions[bannerStyle as BannerType]?.height || ""}{" "}
                pixels
              </div>
            )}

            <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-white">
              {previewBanner ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pré-visualização:
                  </div>
                  <div className="relative max-w-full max-h-[300px] overflow-hidden rounded-md border border-gray-200 shadow-sm">
                    <img
                      src={previewBanner}
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

          <Button
            type="submit"
            className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
            disabled={isSubmitting}
          >
            Atualizar Banner
          </Button>
          <Button
            type="button"
            className="rounded-3xl text-[16px] hover:bg-red-200 hover:text-white pt-3 px-6"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              setName("");
              setLinkDirection("");
              setBannerStyle("");
              setDateActive("");
              setDateExpiration("");
              setStatus("true");
              setCompanyId("");
              setBannerFile(null);
              setPreviewBanner(null);
              back();
            }}
          >
            Cancelar e sair
          </Button>
        </div>
      </form>
    </div>
  );
}

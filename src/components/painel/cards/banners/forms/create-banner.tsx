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
  console.log("bannerStyle", bannerStyle);
  const image = watch("banner")?.[0];
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [imageSizeValid, setImageSizeValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect atualizado para validação das dimensões
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);

        const img = new Image();
        img.src = result;

        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });

          const expected = bannerDimensions[bannerStyle as BannerType];
          if (!expected) return;

          // Considerar válidas tanto imagens menores quanto as de tamanho exato
          const isExactMatch =
            img.width === expected.width && img.height === expected.height;
          const isSmaller =
            img.width <= expected.width && img.height <= expected.height;

          if (!isExactMatch && !isSmaller) {
            // Só mostrar erro se a imagem for maior que o esperado (será cortada)
            setImageSizeValid(false);
            toast.error(
              `Imagem muito grande: Máximo recomendado ${expected.width}x${expected.height}, Recebido ${img.width}x${img.height}`
            );
          } else {
            setImageSizeValid(true);

            // Mostrar toast informativo para imagens menores
            if (isSmaller && !isExactMatch) {
              toast.info(
                `Imagem menor que o banner: ${img.width}x${img.height} será centralizada em ${expected.width}x${expected.height}`
              );
            }
          }
        };
      };
      reader.readAsDataURL(image);
    } else {
      setImagePreview(null);
      setImageDimensions(null);
    }
  }, [image, bannerStyle]);

  const onSubmit = async (data: BannerFormData) => {

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

  // Função melhorada para calcular as dimensões do preview
  const calculatePreviewDimensions = () => {
    if (!bannerStyle || !imageDimensions) return null;

    const expectedDimensions = bannerDimensions[bannerStyle as BannerType];
    if (!expectedDimensions) return null;

    const { width: expectedWidth, height: expectedHeight } = expectedDimensions;
    const { width: imageWidth, height: imageHeight } = imageDimensions;

    // Definir tamanho máximo do preview
    const maxPreviewSize = 400;

    // Verificar se a imagem é menor que as dimensões esperadas
    const isImageSmaller =
      imageWidth < expectedWidth && imageHeight < expectedHeight;

    if (isImageSmaller) {
      // Para imagens menores, mostrar a imagem em seu tamanho natural
      // sem cortes, apenas centralizando dentro da área esperada

      // Calcular escala para o preview mantendo proporções
      const previewScale = Math.min(
        maxPreviewSize / expectedWidth,
        maxPreviewSize / expectedHeight
      );

      // Dimensões da área do banner no preview
      const previewBannerWidth = expectedWidth * previewScale;
      const previewBannerHeight = expectedHeight * previewScale;

      // Dimensões da imagem no preview (mantendo tamanho natural)
      const imageScale = Math.min(previewScale, 1); // Não aumentar se já cabe
      const previewImageWidth = imageWidth * imageScale;
      const previewImageHeight = imageHeight * imageScale;

      // Centralizar a imagem dentro da área do banner
      const visibleX = (previewBannerWidth - previewImageWidth) / 2;
      const visibleY = (previewBannerHeight - previewImageHeight) / 2;

      return {
        previewImageWidth: previewImageWidth,
        previewImageHeight: previewImageHeight,
        previewBannerWidth,
        previewBannerHeight,
        visibleX,
        visibleY,
        visibleWidth: previewImageWidth,
        visibleHeight: previewImageHeight,
        willCrop: false,
        willScale: false,
        isSmaller: true,
        expectedWidth,
        expectedHeight,
      };
    }

    // Lógica original para imagens maiores ou iguais às dimensões esperadas
    // Calcular escala para mostrar a imagem completa no preview
    const imageAspectRatio = imageWidth / imageHeight;
    let previewImageWidth, previewImageHeight;

    if (imageWidth > imageHeight) {
      previewImageWidth = Math.min(maxPreviewSize, imageWidth);
      previewImageHeight = previewImageWidth / imageAspectRatio;
    } else {
      previewImageHeight = Math.min(maxPreviewSize, imageHeight);
      previewImageWidth = previewImageHeight * imageAspectRatio;
    }

    // Verificar se as dimensões são exatamente iguais
    const isExactMatch =
      imageWidth === expectedWidth && imageHeight === expectedHeight;

    if (isExactMatch) {
      return {
        previewImageWidth,
        previewImageHeight,
        visibleX: 0,
        visibleY: 0,
        visibleWidth: previewImageWidth,
        visibleHeight: previewImageHeight,
        willCrop: false,
        willScale: false,
        isSmaller: false,
        expectedWidth,
        expectedHeight,
      };
    }

    // Para imagens maiores - calcular área de corte
    const scaleX = expectedWidth / imageWidth;
    const scaleY = expectedHeight / imageHeight;

    // Usar a maior escala para preencher completamente a área esperada
    const scale = Math.max(scaleX, scaleY);

    // Calcular dimensões da área visível no preview
    const visibleWidth =
      (expectedWidth / scale) * (previewImageWidth / imageWidth);
    const visibleHeight =
      (expectedHeight / scale) * (previewImageHeight / imageHeight);

    // Calcular posição da área visível (centralizada)
    const visibleX = (previewImageWidth - visibleWidth) / 2;
    const visibleY = (previewImageHeight - visibleHeight) / 2;

    return {
      previewImageWidth,
      previewImageHeight,
      visibleX,
      visibleY,
      visibleWidth,
      visibleHeight,
      willCrop: true,
      willScale: scale !== 1,
      isSmaller: false,
      expectedWidth,
      expectedHeight,
    };
  };

  const previewDimensions = calculatePreviewDimensions();

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
            )}
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
                {` ${
                  bannerDimensions[bannerStyle as BannerType]?.width || ""
                }x${
                  bannerDimensions[bannerStyle as BannerType]?.height || ""
                } pixels`}
                {imageDimensions && (
                  <span className="block">
                    Imagem atual: {imageDimensions.width}x
                    {imageDimensions.height} pixels
                  </span>
                )}
              </div>
            )}

            <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-white">
              {bannerStyle && imagePreview && previewDimensions ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pré-visualização:
                  </div>

                  {/* Container do preview */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Para imagens menores */}
                    {previewDimensions.isSmaller ? (
                      <div
                        className="relative border-2 border-blue-300 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center"
                        style={{
                          width: `${previewDimensions.previewBannerWidth}px`,
                          height: `${previewDimensions.previewBannerHeight}px`,
                          maxWidth: "100%",
                        }}
                      >
                        {/* Área do banner (fundo) */}
                        <div className="absolute inset-0 bg-gray-200 border-2 border-dashed border-gray-400 opacity-50"></div>

                        {/* Imagem centralizada */}
                        <img
                          src={imagePreview}
                          alt="Imagem menor centralizada"
                          className="relative z-10 object-contain"
                          style={{
                            width: `${previewDimensions.previewImageWidth}px`,
                            height: `${previewDimensions.previewImageHeight}px`,
                          }}
                        />

                        {/* Indicador de imagem menor */}
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <span>ℹ️</span>
                          <span>Imagem menor</span>
                        </div>

                        {/* Labels indicando espaço vazio */}
                        <div className="absolute bottom-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                          Espaço vazio
                        </div>
                      </div>
                    ) : (
                      /* Lógica original para imagens maiores ou iguais */
                      <div
                        className="relative border-2 border-gray-300 rounded-md overflow-hidden bg-gray-50"
                        style={{
                          width: `${previewDimensions.previewImageWidth}px`,
                          height: `${previewDimensions.previewImageHeight}px`,
                          maxWidth: "100%",
                        }}
                      >
                        {/* Imagem completa */}
                        <img
                          src={imagePreview}
                          alt="Imagem completa"
                          className="w-full h-full object-contain"
                        />

                        {previewDimensions.willCrop && (
                          <>
                            {/* Área visível (não será cortada) */}
                            <div
                              className="absolute border-4 border-green-400"
                              style={{
                                left: `${previewDimensions.visibleX}px`,
                                top: `${previewDimensions.visibleY}px`,
                                width: `${previewDimensions.visibleWidth}px`,
                                height: `${previewDimensions.visibleHeight}px`,
                                backgroundColor: "transparent",
                                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                              }}
                            >
                              <div className="absolute -top-8 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                ✓ ÁREA VISÍVEL
                              </div>
                            </div>

                            {/* Labels para áreas cortadas */}
                            {previewDimensions.visibleY > 10 && (
                              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                ❌ SERÁ CORTADA
                              </div>
                            )}

                            {previewDimensions.visibleY +
                              previewDimensions.visibleHeight <
                              previewDimensions.previewImageHeight - 10 && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                ❌ SERÁ CORTADA
                              </div>
                            )}

                            {previewDimensions.visibleX > 10 && (
                              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                <span className="transform -rotate-90 block">
                                  ❌ CORTADA
                                </span>
                              </div>
                            )}

                            {previewDimensions.visibleX +
                              previewDimensions.visibleWidth <
                              previewDimensions.previewImageWidth - 10 && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                <span className="transform -rotate-90 block">
                                  ❌ CORTADA
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {/* Indicador de dimensões corretas */}
                        {!previewDimensions.willCrop &&
                          !previewDimensions.isSmaller && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <span>✓</span>
                              <span>Dimensões perfeitas</span>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Informações adicionais */}
                    {previewDimensions.isSmaller ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm max-w-md">
                        <div className="font-medium text-blue-800 mb-1">
                          ℹ️ Imagem menor que o banner
                        </div>
                        <div className="text-blue-700 space-y-1">
                          <div>
                            • Imagem atual: {imageDimensions?.width}×
                            {imageDimensions?.height}px
                          </div>
                          <div>
                            • Tamanho do banner:{" "}
                            {previewDimensions.expectedWidth}×
                            {previewDimensions.expectedHeight}px
                          </div>
                          <div>
                            • A imagem será{" "}
                            <span className="font-medium">centralizada</span>{" "}
                            dentro do banner
                          </div>
                          <div>
                            •{" "}
                            <span className="text-gray-600">Áreas cinzas</span>:
                            espaço vazio no banner
                          </div>
                        </div>
                      </div>
                    ) : previewDimensions.willCrop ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm max-w-md">
                        <div className="font-medium text-yellow-800 mb-1">
                          ⚠️ Atenção: Imagem será redimensionada
                        </div>
                        <div className="text-yellow-700 space-y-1">
                          <div>
                            • Imagem atual: {imageDimensions?.width}×
                            {imageDimensions?.height}px
                          </div>
                          <div>
                            • Tamanho necessário:{" "}
                            {previewDimensions.expectedWidth}×
                            {previewDimensions.expectedHeight}px
                          </div>
                          <div>
                            •{" "}
                            <span className="text-green-600 font-medium">
                              Área verde
                            </span>
                            : parte que ficará visível
                          </div>
                          <div>
                            •{" "}
                            <span className="text-red-600 font-medium">
                              Áreas escuras
                            </span>
                            : partes que serão cortadas
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm max-w-md">
                        <div className="font-medium text-green-800 flex items-center gap-2">
                          <span>✓</span>
                          <span>Imagem com dimensões perfeitas!</span>
                        </div>
                        <div className="text-green-700 mt-1">
                          A imagem será exibida sem cortes ou redimensionamento.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : bannerStyle && imagePreview ? (
                <div className="text-center text-gray-500">
                  <p>Carregando preview...</p>
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
            Criar Banner
          </Button>
        </div>
      </form>
    </div>
  );
}

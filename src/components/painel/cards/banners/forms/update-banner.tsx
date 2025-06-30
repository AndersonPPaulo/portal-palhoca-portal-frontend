"use client";

import { BannerContext, BannerItem } from "@/providers/banner";
import { useCallback, useContext, useEffect, useState } from "react";
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

const defaultValues = {
  name: "",
  linkDirection: "",
  bannerStyle: "",
  dateActive: "",
  dateExpiration: "",
  status: "true",
  companyId: "",
  bannerFile: null,
  previewBanner: null,
  imageDimensions: null,
  imageSizeValid: true,
  imageLoadError: false,
};

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
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [imageSizeValid, setImageSizeValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    ListCompany();
  }, []);

  useEffect(() => {
    if (bannerData?.url && !bannerFile) {
      const loadImageDimensions = async () => {
        try {
          const dimensions = await loadImageWithFallback(bannerData.url ?? "");
          setImageDimensions(dimensions);
          setImageLoadError(false);
        } catch (error) {
          console.warn(
            "Não foi possível carregar as dimensões da imagem:",
            error
          );
          setImageLoadError(true);
          setImageDimensions(null);
        }
      };

      loadImageDimensions();
    }
  }, [bannerData?.url, bannerFile]);

  const validateImageDimensions = useCallback(
    (width: number, height: number, style: string) => {
      const expected = bannerDimensions[style as BannerType];
      if (!expected) return;

      const isExactMatch =
        width === expected.width && height === expected.height;
      const isSmaller = width <= expected.width && height <= expected.height;

      if (!isExactMatch && !isSmaller) {
        setImageSizeValid(false);
        toast.warning(
          `Imagem atual é maior que o recomendado: Máximo ${expected.width}x${expected.height}, Atual ${width}x${height} - partes serão cortadas`
        );
      } else {
        setImageSizeValid(true);

        if (isSmaller && !isExactMatch) {
          toast.info(
            `Imagem atual é menor que o banner: ${width}x${height} será centralizada em ${expected.width}x${expected.height}`
          );
        }
      }
    },
    []
  ); // Sem dependências pois usa apenas parâmetros

  // useEffect para validação das dimensões quando nova imagem é selecionada
  useEffect(() => {
    if (bannerFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewBanner(result);

        const img = new Image();
        img.src = result;

        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setImageLoadError(false);
        };
      };
      reader.readAsDataURL(bannerFile);
    }
  }, [bannerFile]);

  // useEffect para revalidar quando o tipo do banner muda
  useEffect(() => {
    if (imageDimensions && bannerStyle) {
      validateImageDimensions(
        imageDimensions.width,
        imageDimensions.height,
        bannerStyle
      );
    }
  }, [imageDimensions, bannerStyle, validateImageDimensions]);

  const resetForm = useCallback(() => {
    if (bannerData) {
      setName(bannerData.name ?? defaultValues.name);
      setLinkDirection(
        bannerData.link_direction ?? defaultValues.linkDirection
      );
      setBannerStyle(bannerData.banner_style ?? defaultValues.bannerStyle);
      setDateActive(
        formatDateForInput(bannerData.date_active ?? defaultValues.dateActive)
      );
      setDateExpiration(
        formatDateForInput(
          bannerData.date_expiration ?? defaultValues.dateExpiration
        )
      );
      setStatus(bannerData.status?.toString() ?? defaultValues.status);
      setCompanyId(bannerData.company?.id ?? defaultValues.companyId);
      setPreviewBanner(bannerData.url ?? defaultValues.previewBanner);
    }

    // Estados sempre resetados
    setBannerFile(defaultValues.bannerFile);
    setImageDimensions(defaultValues.imageDimensions);
    setImageSizeValid(defaultValues.imageSizeValid);
    setImageLoadError(defaultValues.imageLoadError);
  }, [bannerData]);

  // Use o resetForm no useEffect:
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        banner: bannerFile ?? undefined,
      };

      await UpdateBanner(bannerItem, bannerData?.id || "");
    } catch (error) {
      console.error("Erro ao atualizar banner:", error);
      toast.error("Erro ao atualizar banner. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para calcular as dimensões do preview
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

    // Lógica para imagens maiores ou iguais às dimensões esperadas
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
        previewBannerWidth: previewImageWidth,
        previewBannerHeight: previewImageHeight,
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
      previewBannerWidth: previewImageWidth,
      previewBannerHeight: previewImageHeight,
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

  const loadImageWithFallback = async (
    url: string
  ): Promise<{ width: number; height: number }> => {
    const tryLoad = (
      imageUrl: string,
      useCORS: boolean = false
    ): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();

        if (useCORS) {
          img.crossOrigin = "anonymous";
        }

        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error("Falha no carregamento"));

        img.src = imageUrl;
      });
    };

    // Primeira tentativa: sem CORS
    try {
      return await tryLoad(url);
    } catch (error) {
      // Segunda tentativa: com CORS
      try {
        return await tryLoad(url, true);
      } catch (corsError) {
        // Terceira tentativa: adicionar timestamp para evitar cache
        const urlWithTimestamp = url.includes("?")
          ? `${url}&t=${Date.now()}`
          : `${url}?t=${Date.now()}`;

        return await tryLoad(urlWithTimestamp);
      }
    }
  };

  const previewDimensions = calculatePreviewDimensions();

  const getImageStatusInfo = () => {
    if (!imageDimensions || !bannerStyle) return null;

    const expected = bannerDimensions[bannerStyle as BannerType];
    if (!expected) return null;

    const { width: imageWidth, height: imageHeight } = imageDimensions;
    const { width: expectedWidth, height: expectedHeight } = expected;

    const isExactMatch =
      imageWidth === expectedWidth && imageHeight === expectedHeight;
    const isSmaller =
      imageWidth <= expectedWidth && imageHeight <= expectedHeight;
    const isLarger = imageWidth > expectedWidth || imageHeight > expectedHeight;

    if (isExactMatch) {
      return {
        type: "perfect",
        message: "Dimensões perfeitas!",
        description: "A imagem será exibida sem cortes ou redimensionamento.",
        color: "green",
      };
    } else if (isSmaller) {
      return {
        type: "smaller",
        message: "Imagem menor que o banner",
        description:
          "A imagem será centralizada dentro do banner, com espaços vazios nas bordas.",
        color: "blue",
      };
    } else if (isLarger) {
      return {
        type: "larger",
        message: "Imagem maior que o banner",
        description:
          "Partes da imagem serão cortadas para ajustar ao tamanho do banner.",
        color: "yellow",
      };
    }

    return null;
  };

  const imageStatus = getImageStatusInfo();

  return (
    <div className="w-full mx-auto">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-xl shadow overflow-hidden"
      >
        {/* Coluna 1 - Informações do Banner */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 ">
            <ReturnPageButton />

            <h2 className="text-xl font-semibold text-gray-800">
              Atualizar Banner
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
            <Label className="mb-2 block text-base text-black">
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
            <Label className="mb-2 block text-base text-black">Status</Label>
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
              <Label className="mb-2 block text-base text-black">Empresa</Label>
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
        <div className="p-6 bg-gray-50 space-y-5 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Imagem do Banner
          </h2>

          {/* Upload */}
          <div>
            <Label className="mb-2 block text-base text-black">
              {bannerData?.url
                ? "Selecione uma nova imagem (opcional)"
                : "Selecione uma imagem"}
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

          {/* Informações sobre a imagem atual */}
          {bannerData?.url && !bannerFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                <span>📷</span>
                <span>Imagem Atual</span>
              </div>
              <div className="text-blue-700 text-sm space-y-1">
                {imageDimensions && !imageLoadError ? (
                  <>
                    <div>
                      Dimensões: {imageDimensions.width}×
                      {imageDimensions.height} pixels
                    </div>
                    {imageStatus && (
                      <div className="mt-2">
                        <span className="font-medium">
                          {imageStatus.message}
                        </span>
                        <div className="text-xs mt-1">
                          {imageStatus.description}
                        </div>
                      </div>
                    )}
                  </>
                ) : imageLoadError ? (
                  <div className="text-yellow-600">
                    ⚠️ Não foi possível carregar as dimensões da imagem
                  </div>
                ) : (
                  <div>Carregando informações da imagem...</div>
                )}
              </div>
            </div>
          )}

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
                    {bannerFile ? "Nova imagem" : "Imagem atual"}:{" "}
                    {imageDimensions.width}x{imageDimensions.height} pixels
                  </span>
                )}
              </div>
            )}

            <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-white">
              {bannerStyle && previewBanner && previewDimensions ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pré-visualização{" "}
                    {bannerFile ? "(Nova imagem)" : "(Imagem atual)"}:
                  </div>

                  {/* Container do preview */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Para imagens menores */}
                    {previewDimensions.isSmaller ? (
                      <div
                        className="relative border-2 border-blue-300 rounded-md  bg-gray-100 flex items-center justify-center"
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
                          src={previewBanner}
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
                      /* Lógica para imagens maiores ou iguais */
                      <div
                        className="relative border-2 border-gray-300 rounded-md  bg-gray-50"
                        style={{
                          width: `${previewDimensions.previewImageWidth}px`,
                          height: `${previewDimensions.previewImageHeight}px`,
                          maxWidth: "100%",
                        }}
                      >
                        {/* Imagem completa */}
                        <img
                          src={previewBanner}
                          alt="Preview da imagem"
                          className="w-full h-full object-contain"
                        />

                        {previewDimensions.willCrop && (
                          <>
                            {/* Área visível (não será cortada) */}
                            <div
                              className="absolute border-4 border-green-400 bg-transparent"
                              style={{
                                left: `${previewDimensions.visibleX}px`,
                                top: `${previewDimensions.visibleY}px`,
                                width: `${previewDimensions.visibleWidth}px`,
                                height: `${previewDimensions.visibleHeight}px`,
                              }}
                            >
                              <div className="absolute z-40 -top-8 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                ✓ ÁREA VISÍVEL
                              </div>
                            </div>

                            {/* Overlays para áreas que serão cortadas */}
                            {/* Overlay superior */}
                            {previewDimensions.visibleY > 10 && (
                              <div
                                className="absolute bg-black bg-opacity-60"
                                style={{
                                  left: 0,
                                  top: 0,
                                  width: "100%",
                                  height: `${previewDimensions.visibleY}px`,
                                }}
                              >
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                  ❌ SERÁ CORTADA
                                </div>
                              </div>
                            )}

                            {/* Overlay inferior */}
                            {previewDimensions.visibleY +
                              previewDimensions.visibleHeight <
                              previewDimensions.previewImageHeight - 10 && (
                              <div
                                className="absolute bg-black bg-opacity-60"
                                style={{
                                  left: 0,
                                  top: `${
                                    previewDimensions.visibleY +
                                    previewDimensions.visibleHeight
                                  }px`,
                                  width: "100%",
                                  height: `${
                                    previewDimensions.previewImageHeight -
                                    (previewDimensions.visibleY +
                                      previewDimensions.visibleHeight)
                                  }px`,
                                }}
                              >
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                  ❌ SERÁ CORTADA
                                </div>
                              </div>
                            )}

                            {/* Overlay esquerdo */}
                            {previewDimensions.visibleX > 10 && (
                              <div
                                className="absolute bg-black bg-opacity-60"
                                style={{
                                  left: 0,
                                  top: 0,
                                  width: `${previewDimensions.visibleX}px`,
                                  height: "100%",
                                }}
                              >
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                  <span className="transform -rotate-90 block">
                                    ❌ CORTADA
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Overlay direito */}
                            {previewDimensions.visibleX +
                              previewDimensions.visibleWidth <
                              previewDimensions.previewImageWidth - 10 && (
                              <div
                                className="absolute bg-black bg-opacity-60"
                                style={{
                                  left: `${
                                    previewDimensions.visibleX +
                                    previewDimensions.visibleWidth
                                  }px`,
                                  top: 0,
                                  width: `${
                                    previewDimensions.previewImageWidth -
                                    (previewDimensions.visibleX +
                                      previewDimensions.visibleWidth)
                                  }px`,
                                  height: "100%",
                                }}
                              >
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                  <span className="transform -rotate-90 block">
                                    ❌ CORTADA
                                  </span>
                                </div>
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
                            • {bannerFile ? "Nova imagem" : "Imagem atual"}:{" "}
                            {imageDimensions?.width}×{imageDimensions?.height}px
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
                            • {bannerFile ? "Nova imagem" : "Imagem atual"}:{" "}
                            {imageDimensions?.width}×{imageDimensions?.height}px
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
                          A {bannerFile ? "nova imagem" : "imagem atual"} será
                          exibida sem cortes ou redimensionamento.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : bannerStyle && previewBanner ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Pré-visualização{" "}
                    {bannerFile ? "(Nova imagem)" : "(Imagem atual)"}:
                  </div>
                  <div className="relative max-w-full max-h-[300px] rounded-md border border-gray-200 shadow-sm">
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
                    {bannerData?.url
                      ? "Imagem atual será mantida se não selecionar uma nova"
                      : "Faça upload de uma imagem para visualizar o preview"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <Button
            type="submit"
            className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Atualizando..." : "Atualizar Banner"}
          </Button>
          <Button
            type="button"
            className="rounded-3xl text-[16px] hover:bg-red-200 hover:text-white pt-3 px-6"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              resetForm();
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

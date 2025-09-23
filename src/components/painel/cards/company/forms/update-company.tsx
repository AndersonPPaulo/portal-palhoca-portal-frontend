"use client";

import { toast } from "sonner";
import ThumbnailUploader from "@/components/thumbnail";
import CustomSelect from "@/components/select/custom-select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState, useEffect } from "react";
import CustomInput from "@/components/input/custom-input";
import { useParams, useRouter } from "next/navigation";
import { CompanyContext } from "@/providers/company";
import ReturnPageButton from "@/components/button/returnPage";
import { Button } from "@/components/ui/button";
import { PortalContext } from "@/providers/portal";
import { parseCookies } from "nookies";
import { api } from "@/service/api";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";

import { useMapAddressSync } from "@/hooks/useMapAddressSync";
import "leaflet/dist/leaflet.css";
import MapComponent from "@/components/mapCompany";

// Schema de validação atualizado
const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  openingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
  email: z.string().min(1, "Email é obrigatório"),
  description: z.string().optional(),
  linkInstagram: z.string().url("URL inválida").optional().or(z.literal("")),
  linkWhatsapp: z.string().url("URL inválida").optional().or(z.literal("")),
  linkLocationMaps: z.string().url("URL inválida").optional().or(z.literal("")),
  linkLocationWaze: z.string().url("URL inválida").optional().or(z.literal("")),
  cep: z.string().min(8, "CEP deve ter 8 dígitos").max(9, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  district: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  status: z.enum(["active", "inactive", "blocked", "new_lead", "in_process"]),
  portalIds: z.array(z.string()).min(1, "Selecione pelo menos um portal"),
  companyCategoryIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma categoria"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const statusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
  new_lead: "Novo Lead",
  in_process: "Em Processo",
};

export default function FormUpdateCompany({
  companyData,
}: {
  companyData: any;
}) {
  const parameter = useParams();
  const router = useRouter();
  const { UpdateCompany, SelfCompany } = useContext(CompanyContext);
  const { listPortals, ListPortals } = useContext(PortalContext);
  const [whatsappDisplay, setWhatsappDisplay] = useState("");
  const { listCompanyCategory, ListCompanyCategory } = useContext(
    CompanyCategoryContext
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    file: File | null;
    preview: string;
  } | null>(null);

  // Função melhorada para analisar endereço
  function parseAddress(address: string) {
    if (!address)
      return {
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        cep: "",
      };

    const parts = address.split(" - ");
    const result = {
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      cep: "",
    };

    // Rua, número, complemento
    if (parts.length > 0) {
      const streetParts = parts[0].split(",").map((part) => part.trim());
      result.street = streetParts[0] || "";
      result.number = streetParts[1] || "";
      if (streetParts.length > 2) result.complement = streetParts[2];
    }

    // Bairro
    if (parts.length > 1) result.district = parts[1];

    // Cidade/Estado
    if (parts.length > 2 && parts[2].includes("/")) {
      const [city, state] = parts[2].split("/");
      result.city = city.trim();
      result.state = state.trim();
    }

    // CEP
    if (parts.length > 3) {
      const cepMatch = parts[3].match(/\d{5}-?\d{3}/);
      if (cepMatch) result.cep = cepMatch[0];
    }

    return result;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  // Hook para sincronização do mapa
  const {
    addressData,
    handleMapLocationSelect,
    mapKey,
    isUpdatingFromMap,
    isUpdatingFromInputs,
    fetchCEPData,
  } = useMapAddressSync(setValue, watch);

  // Valores observados do formulário
  const cep = watch("cep");
  const street = watch("street");
  const number = watch("number");
  const complement = watch("complement");
  const district = watch("district");
  const city = watch("city");
  const state = watch("state");

  useEffect(() => {
    setIsLoading(true);
    reset();
    setSelectedImage(null);
    setWhatsappDisplay(""); // Reset do whatsapp display

    Promise.all([ListPortals(), ListCompanyCategory(100, 1)]);

    const loadData = async () => {
      const data = await SelfCompany(parameter.id as string);

      const imageUrl = data?.company_image?.url || data?.companyImage || "";
      if (imageUrl) {
        setSelectedImage({
          file: null,
          preview: imageUrl,
        });
      }

      const addressParts = parseAddress(data?.address || "");
      const categoryIds = data.company_category?.map((cat) => cat.id) || [];
      const portalIds =
        data?.portals?.filter((p) => p && p.id).map((p) => p.id) || [];

      // Extrair e formatar o número do WhatsApp
      const whatsappFormatted = extractPhoneFromWhatsappLink(
        data?.linkWhatsapp || ""
      );
      setWhatsappDisplay(whatsappFormatted);

      reset({
        name: data?.name || "",
        phone: data?.phone || "",
        email: data.email || "",
        openingHours: data?.openingHours || "",
        description: data?.description || "",
        linkInstagram: data?.linkInstagram || "",
        linkWhatsapp: data?.linkWhatsapp || "",
        linkLocationMaps: data?.linkLocationMaps || "",
        linkLocationWaze: data?.linkLocationWaze || "",
        street: addressParts.street,
        number: addressParts.number,
        complement: addressParts.complement,
        district: addressParts.district,
        city: addressParts.city,
        state: addressParts.state,
        cep: addressParts.cep,
        address: data?.address || "",
        status: data?.status,
        portalIds: portalIds,
        companyCategoryIds: categoryIds,
        latitude: data?.latitude || undefined,
        longitude: data?.longitude || undefined,
      });
    };

    loadData().finally(() => {
      setIsLoading(false);
    });
  }, [parameter.id]);

  // Busca de CEP otimizada
  const getCepData = async (cepValue: string) => {
    if (cepValue.length < 8) return;

    setLoadingCep(true);
    try {
      const cepData = await fetchCEPData(cepValue);

      if (cepData) {
        setValue("street", cepData.logradouro || "");
        setValue("district", cepData.bairro || "");
        setValue("city", cepData.localidade || "");
        setValue("state", cepData.uf || "");
        toast.success("CEP encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  // Verificar e buscar CEP quando parar de digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cep && cep.length >= 8) {
        getCepData(cep);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cep]);

  // Função para gerar mensagem dinâmica
  const generateWhatsappMessage = (selectedPortalIds: string[]): string => {
    if (!selectedPortalIds || selectedPortalIds.length === 0) {
      return "Olá, gostaria de informações sobre os serviços.";
    }

    // Pegar o nome do primeiro portal selecionado
    const selectedPortal = listPortals?.find((portal) =>
      selectedPortalIds.includes(portal.id)
    );

    if (selectedPortal) {
      return `Olá, vi o anúncio no ${selectedPortal.name} e gostaria de informações.`;
    }

    return "Olá, vi seu anúncio e gostaria de informações.";
  };

  // Handler para seleção de localização no mapa
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    handleMapLocationSelect(lat, lng, address);
  };

  const extractPhoneFromWhatsappLink = (link: string): string => {
    if (!link) return "";

    // Extrair número do formato: https://wa.me/5548999999999?text=...
    const match = link.match(/wa\.me\/55(\d{11})/);
    if (match && match[1]) {
      const phoneNumber = match[1];
      // Aplicar máscara: (48) 99999-9999
      return `(${phoneNumber.substring(0, 2)}) ${phoneNumber.substring(
        2,
        7
      )}-${phoneNumber.substring(7)}`;
    }

    return "";
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 11);

    let formattedDisplay = value;
    if (value.length > 2) {
      formattedDisplay =
        value.length <= 7
          ? `(${value.substring(0, 2)}) ${value.substring(2)}`
          : `(${value.substring(0, 2)}) ${value.substring(
              2,
              7
            )}-${value.substring(7)}`;
    }

    setWhatsappDisplay(formattedDisplay);

    if (value.length === 11) {
      // Usar mensagem dinâmica baseada nos portais selecionados
      const dynamicMessage = generateWhatsappMessage(watch("portalIds"));
      const message = encodeURIComponent(dynamicMessage);
      setValue("linkWhatsapp", `https://wa.me/55${value}?text=${message}`);
    } else {
      setValue("linkWhatsapp", "");
    }
  };

  useEffect(() => {
    const currentWhatsapp = whatsappDisplay.replace(/\D/g, "");
    if (currentWhatsapp.length === 11) {
      const dynamicMessage = generateWhatsappMessage(watch("portalIds"));
      const message = encodeURIComponent(dynamicMessage);
      setValue(
        "linkWhatsapp",
        `https://wa.me/55${currentWhatsapp}?text=${message}`
      );
    }
  }, [watch("portalIds"), listPortals]);

  // Upload de imagem
  const handleImageUpload = (file: File, previewUrl: string) => {
    setSelectedImage({ file, preview: previewUrl });
  };

  // Upload do logo
  const uploadCompanyLogo = async (file: File, companyId: string) => {
    try {
      const { "user:token": token } = parseCookies();

      const formData = new FormData();
      formData.append("company_image", file);

      await api.post(`/company/${companyId}/upload-company-image`, formData, {
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Logo da empresa atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload do logo");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      const companyUpdateData = {
        name: data.name,
        phone: data.phone || "",
        email: data.email || "",
        openingHours: data.openingHours,
        responsibleName: data.responsibleName || "",
        description: data.description || "",
        linkInstagram: data.linkInstagram || "",
        linkWhatsapp: data.linkWhatsapp || "",
        linkLocationMaps: data.linkLocationMaps || "",
        linkLocationWaze: data.linkLocationWaze || "",
        address: data.address,
        district: data.district,
        status: data.status,
        portalIds: data.portalIds,
        companyCategoryIds: data.companyCategoryIds,
        latitude: addressData.latitude || data.latitude,
        longitude: addressData.longitude || data.longitude,
        cep: data.cep,
        document_number: companyData?.document_number || "",
        document_type: companyData?.document_type || "",
      };

      const companyId = parameter.id as string;
      await UpdateCompany(companyUpdateData, companyId);

      if (selectedImage && selectedImage.file) {
        await uploadCompanyLogo(selectedImage.file, companyId);
      }

      toast.success("🎉 Empresa atualizada com sucesso!");
      router.back();
    } catch (error) {
      toast.error("Erro ao atualizar empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatação de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    setValue("cep", value.substring(0, 9));
  };

  // Formatação de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2)
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    if (value.length > 10)
      value = value.replace(/^(\(\d{2}\)) (\d{5})(\d)/, "$1 $2-$3");
    setValue("phone", value.substring(0, 15));
  };

  // Converter para opções de select
  const portalOptions = Array.isArray(listPortals)
    ? listPortals.map((portal) => ({ value: portal.id, label: portal.name }))
    : [];

  const categoryOptions =
    listCompanyCategory && Array.isArray(listCompanyCategory.data)
      ? listCompanyCategory.data.map((category) => ({
          value: category.id,
          label: category.name,
        }))
      : [];

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[24px]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Carregando dados da empresa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px] scroll-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <ReturnPageButton />
            </div>
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

          {/* Conteúdo do formulário */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Dados da Empresa */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Dados da Empresa
                </h3>

                <div className="space-y-4">
                  <div>
                    <CustomInput
                      id="name"
                      label="Nome da Empresa"
                      {...register("name")}
                      placeholder="Digite o nome"
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <CustomInput
                      id="phone"
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      value={watch("phone")}
                      onChange={handlePhoneChange}
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-sm">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <CustomInput
                      id="openingHours"
                      label="Horário de Funcionamento"
                      {...register("openingHours")}
                      placeholder="Seg a Sab - 09h às 18h"
                    />
                    {errors.openingHours && (
                      <span className="text-red-500 text-sm">
                        {errors.openingHours.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <CustomInput
                      id="description"
                      label="Descrição"
                      textareaInput
                      {...register("description")}
                      placeholder="Descreva a empresa, produtos ou serviços"
                    />
                    {errors.description && (
                      <span className="text-red-500 text-sm">
                        {errors.description.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <ThumbnailUploader
                      label="Logo da Empresa"
                      modalTitle="Atualizar Logo"
                      confirmButtonText="Selecionar Logo"
                      uploadAreaText="Clique para atualizar o logo"
                      uploadAreaSubtext="SVG, PNG, JPG ou GIF (max. 5MB)"
                      onImageUpload={handleImageUpload}
                      initialImage={selectedImage?.preview}
                      showDescription={false}
                    />
                    {selectedImage && (
                      <p className="text-green-600 text-sm ml-2 mt-1">
                        {selectedImage.file
                          ? "Novo logo selecionado"
                          : "Logo atual"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colunas 2 e 3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Endereço e Links */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Endereço
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="relative">
                        <CustomInput
                          id="cep"
                          label="CEP"
                          placeholder="00000-000"
                          value={watch("cep")}
                          onChange={handleCepChange}
                          className={
                            isUpdatingFromMap
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        />
                        {(loadingCep ||
                          isUpdatingFromInputs ||
                          isUpdatingFromMap) && (
                          <div className="absolute right-3 top-9">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                      {errors.cep && (
                        <span className="text-red-500 text-sm">
                          {errors.cep.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <CustomInput
                        id="street"
                        label="Rua"
                        {...register("street")}
                        placeholder="Nome da rua"
                        className={
                          isUpdatingFromMap
                            ? "bg-green-50 border-green-300"
                            : ""
                        }
                      />
                      {errors.street && (
                        <span className="text-red-500 text-sm">
                          {errors.street.message}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <CustomInput
                          id="number"
                          label="Número"
                          {...register("number")}
                          placeholder="Número"
                          className={
                            isUpdatingFromMap
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        />
                        {errors.number && (
                          <span className="text-red-500 text-sm">
                            {errors.number.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <CustomInput
                          id="complement"
                          label="Complemento (opcional)"
                          {...register("complement")}
                          placeholder="Apto, Bloco, etc."
                          className={
                            isUpdatingFromMap
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <CustomInput
                          id="city"
                          label="Cidade"
                          {...register("city")}
                          placeholder="Cidade"
                          className={
                            isUpdatingFromMap
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        />
                        {errors.city && (
                          <span className="text-red-500 text-sm">
                            {errors.city.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <CustomInput
                          id="district"
                          label="Bairro"
                          {...register("district")}
                          placeholder="Bairro"
                          className={
                            isUpdatingFromMap
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        />
                        {errors.district && (
                          <span className="text-red-500 text-sm">
                            {errors.district.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <CustomInput
                          id="state"
                          label="Estado"
                          {...register("state")}
                          placeholder="UF"
                          className={
                            isUpdatingFromMap
                              ? "bg-green-50 border-green-300"
                              : ""
                          }
                        />
                        {errors.state && (
                          <span className="text-red-500 text-sm">
                            {errors.state.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <CustomInput
                        className="cursor-not-allowed bg-gray-50"
                        id="address"
                        label="Endereço completo"
                        {...register("address")}
                        placeholder="Endereço completo (preenchido automaticamente)"
                        readOnly
                        disabled
                      />
                      {errors.address && (
                        <span className="text-red-500 text-sm">
                          {errors.address.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Links e Contato
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <CustomInput
                        id="linkLocationMaps"
                        label="Link Google Maps"
                        {...register("linkLocationMaps")}
                        placeholder="Gerado automaticamente pelo mapa"
                        className="bg-blue-50"
                        disabled
                      />
                      {errors.linkLocationMaps && (
                        <span className="text-red-500 text-sm">
                          {errors.linkLocationMaps.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <CustomInput
                        id="linkLocationWaze"
                        label="Link Waze"
                        disabled
                        {...register("linkLocationWaze")}
                        placeholder="Gerado automaticamente pelo mapa"
                        className="bg-blue-50"
                      />
                      {errors.linkLocationWaze && (
                        <span className="text-red-500 text-sm">
                          {errors.linkLocationWaze.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <CustomInput
                        id="linkInstagram"
                        label="Instagram"
                        {...register("linkInstagram")}
                        placeholder="https://instagram.com/..."
                      />
                      {errors.linkInstagram && (
                        <span className="text-red-500 text-sm">
                          {errors.linkInstagram.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <CustomInput
                        id="linkWhatsapp"
                        label="WhatsApp"
                        placeholder="(48) 99115-8345"
                        value={whatsappDisplay}
                        onChange={handleWhatsappChange}
                      />
                      {errors.linkWhatsapp && (
                        <span className="text-red-500 text-sm">
                          {errors.linkWhatsapp.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <CustomInput
                        id="email"
                        label="Endereço de Email"
                        {...register("email")}
                        placeholder="Digite o email"
                      />
                      {errors.email && (
                        <span className="text-red-500 text-sm">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Portais e Categorias */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Portais
                  </h3>
                  <div className="mb-2">
                    <CustomSelect
                      id="portalIds"
                      label="Portais Disponíveis"
                      placeholder="Selecione um ou mais portais"
                      options={portalOptions}
                      value={watch("portalIds")}
                      onChange={(value) =>
                        setValue("portalIds", value as string[], {
                          shouldValidate: true,
                        })
                      }
                      isMulti={true}
                      error={errors.portalIds?.message}
                      noOptionsMessage="Nenhum portal disponível"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Categorias
                  </h3>
                  <div className="mb-2">
                    <CustomSelect
                      id="companyCategoryIds"
                      label="Categorias Disponíveis"
                      placeholder="Selecione uma ou mais categorias"
                      options={categoryOptions}
                      value={watch("companyCategoryIds")}
                      onChange={(value) =>
                        setValue("companyCategoryIds", value as string[], {
                          shouldValidate: true,
                        })
                      }
                      isMulti={true}
                      error={errors.companyCategoryIds?.message}
                      noOptionsMessage="Nenhuma categoria disponível"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção do Mapa - NOVA */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              Atualizar Localização no Mapa
              <span className="text-sm text-blue-600 font-normal">
                (Links do Maps e Waze serão atualizados automaticamente)
              </span>
            </h4>
            <MapComponent
              key={mapKey}
              onLocationSelect={handleLocationSelect}
              initialLat={
                addressData.latitude || watch("latitude") || -27.644317
              }
              initialLng={
                addressData.longitude || watch("longitude") || -48.669188
              }
              height="600px"
              showSearch={true}
              showCurrentLocation={true}
              markerDraggable={false}
              className="w-full"
            />

            {/* Info das Coordenadas */}
            {(addressData.latitude || watch("latitude")) && (
              <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="text-sm">
                  <div className="flex items-center gap-2 font-medium text-green-700 mb-2">
                    <span>Localização Salva!</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <strong>📍 Coordenadas:</strong>
                      <br />
                      <code className="bg-white px-2 py-1 rounded text-xs">
                        {(addressData.latitude || watch("latitude"))?.toFixed(
                          6
                        )}
                        ,{" "}
                        {(addressData.longitude || watch("longitude"))?.toFixed(
                          6
                        )}
                      </code>
                    </div>
                    <div>
                      <strong>🗺️ Links:</strong>
                      <br />
                      <span className="text-blue-600 text-xs">
                        ✅ Google Maps &nbsp;&nbsp; ✅ Waze
                      </span>
                    </div>
                  </div>
                  {addressData.fullAddress && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <strong className="text-green-700">
                        📬 Endereço Completo:
                      </strong>
                      <br />
                      <span className="text-gray-700 font-medium">
                        {addressData.fullAddress}
                      </span>
                    </div>
                  )}
                  {!addressData.fullAddress && watch("address") && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <strong className="text-green-700">
                        📬 Endereço Atual:
                      </strong>
                      <br />
                      <span className="text-gray-700 font-medium">
                        {watch("address")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Indicador de Sincronização */}
            {(isUpdatingFromMap || isUpdatingFromInputs) && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  <span>
                    {isUpdatingFromMap
                      ? "Atualizando campos a partir do mapa..."
                      : "Atualizando mapa a partir dos campos..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => router.back()}
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
                  Atualizando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Atualizar Empresa</span>
                  {(addressData.latitude || watch("latitude")) && (
                    <span className="text-green-200"></span>
                  )}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

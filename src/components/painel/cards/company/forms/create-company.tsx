"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseCookies } from "nookies";
import ThumbnailUploader from "@/components/thumbnail";
import CustomSelect, { OptionType } from "@/components/select/custom-select";
import CustomInput from "@/components/input/custom-input";
import ReturnPageButton from "@/components/button/returnPage";
import { Button } from "@/components/ui/button";
import { CompanyContext } from "@/providers/company";
import { PortalContext } from "@/providers/portal";
import { useMapAddressSync } from "@/hooks/useMapAddressSync";
import { api } from "@/service/api";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";
import MapComponent from "@/components/mapCompany";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";


// Schema de validação
const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  openingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
  description: z.string().optional(),
  linkInstagram: z.string().url("URL inválida").optional().or(z.literal("")),
  linkWhatsapp: z.string().optional(),
  linkLocationMaps: z.string().url("URL inválida").optional().or(z.literal("")),
  linkLocationWaze: z.string().url("URL inválida").optional().or(z.literal("")),
  cep: z.string().min(8, "CEP deve ter 8 dígitos").max(9, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  district: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  status: z.enum(["active", "inactive", "blocked"]),
  portalIds: z.array(z.string()).min(1, "Selecione pelo menos um portal"),
  companyCategoryIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma categoria"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  document_number: z.string().min(11, "CNPJ deve ter 14 dígitos"),
  document_type: z.enum(["cnpj", "cpf"]).default("cnpj"),
});

type CompanyFormData = z.infer<typeof companySchema>;

const statusLabels: Record<CompanyFormData["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado"
};

export default function FormCreateCompany() {
  const { back } = useRouter();
  const { CreateCompany, ListCompany } = useContext(CompanyContext);
  const { listPortals, ListPortals } = useContext(PortalContext);
  const { listCompanyCategory, ListCompanyCategory } = useContext(
    CompanyCategoryContext
  );

  // Estados otimizados
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [whatsappDisplay, setWhatsappDisplay] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const formSubmittedSuccessfully = useRef(false);

  // Configuração do formulário
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
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
      cep: "",
      email: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      address: "",
      status: "active",
      portalIds: [],
      companyCategoryIds: [],
      latitude: undefined,
      longitude: undefined,
      document_number: "",
      document_type: "cnpj",
    },
  });

  // Hook para sincronização do mapa
  const {
    addressData,
    handleMapLocationSelect,
    mapKey,
    isUpdatingFromMap,
    isUpdatingFromInputs,
    updateFullAddress,
    fetchCEPData,
  } = useMapAddressSync(setValue, watch);

  // Observar campos necessários
  const cep = watch("cep");
  const [street, number, complement, district, city, state] = [
    watch("street"),
    watch("number"),
    watch("complement"),
    watch("district"),
    watch("city"),
    watch("state"),
  ];
  const [portalIds, categoryIds] = [
    watch("portalIds"),
    watch("companyCategoryIds"),
  ];

  // Função otimizada para buscar CEP
  const handleCEPLookup = async (cep: string) => {
    if (cep.length < 8) return;

    setLoadingCep(true);
    try {
      const cepData = await fetchCEPData(cep);

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
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  // Handlers otimizados
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
      const message = encodeURIComponent(
        "Olá, vi o anúncio no Portal Palhoça e gostaria de informações."
      );
      setValue("linkWhatsapp", `https://wa.me/55${value}?text=${message}`);
    } else {
      setValue("linkWhatsapp", "");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 10) {
      value = value.replace(/^(\(\d{2}\)) (\d{5})(\d)/, "$1 $2-$3");
    }

    setValue("phone", value.substring(0, 15));
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})\.(\d{3})(\d)/, ".$1.$2/$3")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue("document_number", formatted);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    setValue("cep", value.substring(0, 9));
  };

  // Handler para seleção de localização no mapa
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    handleMapLocationSelect(lat, lng, address);
  };

  // Handlers para upload de imagem
  const handleImageUpload = (file: File, previewUrl: string) => {
    setSelectedImage({ file, preview: previewUrl });
  };

  const uploadCompanyLogo = async (file: File, companyName: string) => {
    try {
      const { "user:token": token } = parseCookies();
      const response = await ListCompany(1, 1, {
        name: companyName,
        order: "DESC",
        orderBy: "created_at",
      });

      if (response?.data?.length > 0) {
        const formData = new FormData();
        formData.append("company_image", file);

        await api.post(
          `/company/${response.data[0].id}/upload-company-image`,
          formData,
          {
            headers: {
              Authorization: `bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Logo enviado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro no upload do logo:", error);
      toast.error("Erro ao fazer upload do logo");
    }
  };

  // Submit otimizado do formulário
  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true);
      formSubmittedSuccessfully.current = false;

      // Preparar dados da empresa com coordenadas exatas
      const companyData = {
        name: data.name,
        phone: data.phone || "",
        openingHours: data.openingHours,
        description: data.description || "",
        linkInstagram: data.linkInstagram || "",
        responsibleName: data.name,
        email: data.email || "",
        linkWhatsapp: data.linkWhatsapp || "",
        linkLocationMaps: data.linkLocationMaps || "",
        linkLocationWaze: data.linkLocationWaze || "",
        address: data.address,
        district: data.district,
        status: data.status,
        portalIds: data.portalIds,
        companyCategoryIds: data.companyCategoryIds,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        document_number: data.document_number || "",
        document_type: data.document_type || "cnpj",
      };

      // Criar empresa
      await CreateCompany(companyData);
      formSubmittedSuccessfully.current = true;

      // Upload da imagem se houver (async)
      if (selectedImage?.file) {
        setTimeout(() => uploadCompanyLogo(selectedImage.file, data.name), 500);
      }

      // Reset completo
      reset();
      setSelectedImage(null);
      setWhatsappDisplay("");

      toast.success("Empresa criada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error);
      toast.error(error.message || "Erro ao criar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Efeitos otimizados
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cep && cep.length >= 8) handleCEPLookup(cep);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [cep]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await ListPortals();
        setIsLoadingCategories(true);
        await ListCompanyCategory(100, 1);
        setIsLoadingCategories(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
        setIsLoadingCategories(false);
      }
    };
    loadData();
  }, []);

  // Opções para selects
  const portalOptions: OptionType[] = Array.isArray(listPortals)
    ? listPortals.map((portal) => ({ value: portal.id, label: portal.name }))
    : [];

  const categoryOptions: OptionType[] = listCompanyCategory?.data
    ? listCompanyCategory.data.map((category) => ({
        value: category.id,
        label: category.name,
      }))
    : [];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px] scroll-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
          {/* Header */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Dados da Empresa */}
            <div className="space-y-6">
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
                    id="document_number"
                    label="CNPJ"
                    placeholder="00.000.000/0000-00"
                    value={watch("document_number")}
                    onChange={handleCnpjChange}
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
                    placeholder="Descreva a empresa"
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
                    modalTitle="Adicionar Logo"
                    confirmButtonText="Selecionar Logo"
                    uploadAreaText="Clique para adicionar o logo"
                    uploadAreaSubtext="SVG, PNG, JPG ou GIF (max. 5MB)"
                    onImageUpload={handleImageUpload}
                    showDescription={false}
                  />
                  {selectedImage && (
                    <p className="text-green-600 text-sm ml-2 mt-1">
                      Logo selecionado
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Colunas 2 e 3: Endereço e Links */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Endereço
                  </h3>

                  <div className="space-y-4">
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
                        id="address"
                        label="Endereço completo"
                        {...register("address")}
                        placeholder="Preenchido automaticamente"
                        readOnly
                        disabled
                        className="cursor-not-allowed bg-gray-50"
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
                        disabled
                        placeholder="Gerado automaticamente pelo mapa"
                        className="bg-blue-50 cursor-not-allowed"
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
                        {...register("linkLocationWaze")}
                        disabled
                        placeholder="Gerado automaticamente pelo mapa"
                        className="bg-blue-50 cursor-not-allowed"
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
                      {watch("linkWhatsapp") &&
                        whatsappDisplay.length >= 14 && (
                          <p className="text-green-600 text-xs mt-1">
                            Link do WhatsApp gerado automaticamente
                          </p>
                        )}
                    </div>
                    <div>
                      <CustomInput
                        id="email"
                        label="Endereço de Email"
                        placeholder="nome@gmail.com"
                        {...register("email")}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Portais
                  </h3>
                  <CustomSelect
                    id="portalIds"
                    label="Portais Disponíveis"
                    placeholder="Selecione portais"
                    options={portalOptions}
                    value={portalIds}
                    onChange={(value) =>
                      setValue("portalIds", value as string[], {
                        shouldValidate: true,
                      })
                    }
                    isMulti={true}
                    error={errors.portalIds?.message}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Categorias
                  </h3>
                  <CustomSelect
                    id="companyCategoryIds"
                    label="Categorias Disponíveis"
                    placeholder="Selecione categorias"
                    options={categoryOptions}
                    value={categoryIds}
                    onChange={(value) =>
                      setValue("companyCategoryIds", value as string[], {
                        shouldValidate: true,
                      })
                    }
                    isMulti={true}
                    error={errors.companyCategoryIds?.message}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção do Mapa - */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              Localização no Mapa
              <span className="text-sm text-blue-600 font-normal">
                (Links do Maps e Waze serão gerados automaticamente)
              </span>
            </h4>
            <MapComponent
              key={mapKey}
              onLocationSelect={handleLocationSelect}
              initialLat={addressData.latitude || -27.644317}
              initialLng={addressData.longitude || -48.669188}
              height="600px"
              showSearch={true}
              showCurrentLocation={true}
              markerDraggable={true}
              className="w-full"
            />

            {/* Info das Coordenadas */}
            {addressData.latitude && (
              <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="text-sm">
                  <div className="flex items-center gap-2 font-medium text-green-700 mb-2">
                    <span>Localização Exata Salva!</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <strong>Coordenadas:</strong>
                      <br />
                      <code className="bg-white px-2 py-1 rounded text-xs">
                        {addressData.latitude.toFixed(6)},{" "}
                        {addressData.longitude?.toFixed(6)}
                      </code>
                    </div>
                    <div>
                      <strong>🗺️ Links Gerados:</strong>
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
                  {!addressData.fullAddress && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <strong className="text-blue-700">
                        📝 Complete o endereço:
                      </strong>
                      <br />
                      <span className="text-gray-600 text-sm">
                        Preencha os campos acima para gerar o endereço completo
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

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={back}
              disabled={isSubmitting}
              className="bg-red-light text-[#611A1A] hover:bg-red-light/80 rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingCategories ||
                categoryOptions.length === 0 ||
                !addressData.latitude
              }
              className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Criando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Criar Empresa</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

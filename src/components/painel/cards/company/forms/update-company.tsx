"use client";

import axios from "axios";
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

// Schema de validação
const companySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  openingHours: z.string().min(1, "Horário de funcionamento é obrigatório"),
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
  status: z.enum(["active", "inactive", "blocked"]),
  portalIds: z.array(z.string()).min(1, "Selecione pelo menos um portal"),
  companyCategoryIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma categoria"),
});

type CompanyFormData = z.infer<typeof companySchema>;

const statusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export default function FormUpdateCompany({
  companyData,
}: {
  companyData: any;
}) {
  const parameter = useParams();

  const router = useRouter();
  const { UpdateCompany, SelfCompany, company } = useContext(CompanyContext);
  const { listPortals, ListPortals } = useContext(PortalContext);
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

  // Função simplificada para analisar endereço
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

  // Valores observados do formulário
  const cep = watch("cep");
  const street = watch("street");
  const number = watch("number");
  const complement = watch("complement");
  const district = watch("district");
  const city = watch("city");
  const state = watch("state");

  useEffect(() => {}, [companyData]);

  useEffect(() => {
    setIsLoading(true);

    reset();
    setSelectedImage(null);

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

      const categoryIds =
        data?.companyCategories?.map((cat) => cat.id) ||
        data?.companyCategoryIds?.map((cat) => cat.id) ||
        [];

      const portalIds =
        data?.portals?.filter((p) => p && p.id).map((p) => p.id) || [];

      reset({
        name: data?.name || "",
        phone: data?.phone || "",
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
      });
    };

    loadData().finally(() => {
      setIsLoading(false);
    });
  }, [parameter.id]);

  // Busca de CEP
  const getCepData = async (cepValue: string) => {
    if (cepValue.length < 8) return;

    const cepFormatted = cepValue.replace(/\D/g, "");
    if (cepFormatted.length !== 8) return;

    setLoadingCep(true);

    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${cepFormatted}/json`
      );
      const data = response.data;

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setValue("street", data.logradouro || "");
      setValue("district", data.bairro || "");
      setValue("city", data.localidade || "");
      setValue("state", data.uf || "");
    } catch (error) {
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };

  // Atualizar endereço completo
  useEffect(() => {
    if (street && number) {
      let fullAddress = `${street}, ${number}`;
      if (complement) fullAddress += `, ${complement}`;
      if (district) fullAddress += ` - ${district}`;
      if (city && state) fullAddress += ` - ${city}/${state}`;
      if (cep) fullAddress += ` - ${cep}`;
      setValue("address", fullAddress);
    }
  }, [street, number, complement, district, city, state, cep, setValue]);

  // Verificar e buscar CEP quando parar de digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cep && cep.length >= 8) {
        getCepData(cep);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cep]);

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
        openingHours: data.openingHours,
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
      };

      // USAR parameter.id EM VEZ DE companyData.id
      const companyId = parameter.id as string;
      await UpdateCompany(companyUpdateData, companyId);

      if (selectedImage && selectedImage.file) {
        await uploadCompanyLogo(selectedImage.file, companyId);
      }

      toast.success("Empresa atualizada com sucesso!");
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
                        />
                        {loadingCep && (
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
                        className="cursor-not-allowed"
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
                        placeholder="https://maps.google.com/..."
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
                        placeholder="https://waze.com/..."
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
                        {...register("linkWhatsapp")}
                        placeholder="https://wa.me/..."
                      />
                      {errors.linkWhatsapp && (
                        <span className="text-red-500 text-sm">
                          {errors.linkWhatsapp.message}
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
                "Atualizar Empresa"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import axios from "axios";
import { toast } from "sonner";
import ThumbnailUploader from "@/components/thumbnail";
import CustomSelect, { OptionType } from "@/components/select/custom-select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState, useEffect, useRef } from "react";
import CustomInput from "@/components/input/custom-input";
import { useRouter } from "next/navigation";
import { CompanyContext } from "@/providers/company";
import ReturnPageButton from "@/components/button/returnPage";
import { Button } from "@/components/ui/button";
import { PortalContext } from "@/providers/portal";
import { parseCookies } from "nookies";
import { api } from "@/service/api";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";

// Interface para os dados retornados pela API de CEP
interface GetCEPProps {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Schema com validação adicional para CEP
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
  companyCategoryIds: z.array(z.string()).min(1, "Selecione pelo menos uma categoria"),
});

type CompanyFormData = z.infer<typeof companySchema>;

const statusLabels: Record<CompanyFormData["status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

const api_cep = axios.create({
  baseURL: "https://viacep.com.br/ws",
});

export default function FormCreateCompany() {
  const { back } = useRouter();
  const { CreateCompany, ListCompany } = useContext(CompanyContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [apiCep, setApiCep] = useState<GetCEPProps | null>(null);
  const { listPortals, ListPortals } = useContext(PortalContext);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const { 
    listCompanyCategory, 
    ListCompanyCategory 
  } = useContext(CompanyCategoryContext);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Ref para determinar se o formulário foi enviado com sucesso
  const formSubmittedSuccessfully = useRef(false);

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
    },
  });

  // Observar o CEP para buscar dados quando alterado
  const cep = watch("cep");

  // Observar os campos de endereço para atualizar o endereço completo
  const street = watch("street");
  const number = watch("number");
  const complement = watch("complement");
  const district = watch("district");
  const city = watch("city");
  const state = watch("state");
  const portalIds = watch("portalIds");
  const categoryIds = watch("companyCategoryIds");

  // Função para buscar dados do CEP
  const GetByZipcode = async (cep: string) => {
    if (cep.length < 8) return;

    // Formatando o CEP removendo caracteres especiais
    const cepFormatted = cep.replace(/\D/g, "");

    if (cepFormatted.length !== 8) return;

    setLoadingCep(true);

    try {
      const response = await api_cep.get(`/${cepFormatted}/json`);
      const data = response.data;

      if (data.erro) {
        toast.error("CEP não encontrado");
        setApiCep(null);
        return;
      }

      setApiCep(data);

      // Atualizar os campos com os dados do CEP
      setValue("street", data.logradouro || "");
      setValue("district", data.bairro || "");
      setValue("city", data.localidade || "");
      setValue("state", data.uf || "");

      // Focar no campo número após preencher os dados
      const numberInput = document.getElementById("number");
      if (numberInput) {
        numberInput.focus();
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };

  // Atualizar o campo de endereço completo quando os campos individuais mudarem
  useEffect(() => {
    if (street && number) {
      let fullAddress = `${street}, ${number}`;

      if (complement) {
        fullAddress += `, ${complement}`;
      }

      if (district) {
        fullAddress += ` - ${district}`;
      }

      if (city && state) {
        fullAddress += ` - ${city}/${state}`;
      }
      if (apiCep) {
        fullAddress += ` - ${apiCep.cep}`;
      }
      setValue("address", fullAddress);
    }
  }, [street, number, complement, district, city, state, apiCep, setValue]);

  // Efeito para buscar CEP quando o usuário parar de digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cep && cep.length >= 8) {
        GetByZipcode(cep);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cep]);

  // Listar portais disponíveis ao carregar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar portais
        await ListPortals();
        
        // Carregar categorias
        setIsLoadingCategories(true);
        await ListCompanyCategory(100, 1); // Carregar até 100 categorias na página 1
        setIsLoadingCategories(false);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast.error("Erro ao carregar dados. Por favor, recarregue a página.");
        setIsLoadingCategories(false);
      }
    };

    loadData();
  }, []);

  // Função para lidar com o upload da imagem
  const handleImageUpload = (file: File, previewUrl: string) => {
    setSelectedImage({ file, preview: previewUrl });
  };

  const uploadCompanyLogo = async (file: File, companyName: string) => {
    try {
      const { "user:token": token } = parseCookies();
      const config = {
        headers: { Authorization: `bearer ${token}` },
      };

      try {
        const response = await ListCompany(1, 1, {
          name: companyName,
          order: "DESC", 
          orderBy: "created_at",
        });

        // Verificar se encontrou a empresa
        if (response?.data?.length > 0) {
          const companyId = response.data[0].id;

          // Criar FormData para enviar o arquivo
          const formData = new FormData();
          formData.append("company_image", file);

          // Fazer o upload do logo
          await api.post(
            `/company/${companyId}/upload-company-image`,
            formData,
            {
              headers: {
                ...config.headers,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          toast.success("Logo da empresa enviado com sucesso!");
        } else {
          throw new Error(
            "Empresa criada, mas não foi possível encontrá-la para adicionar o logo"
          );
        }
      } catch (error: any) {
        console.error("Erro ao buscar empresa:", error);
        toast.error(
          "Empresa criada, mas não foi possível encontrar seu ID para adicionar o logo"
        );
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload do logo:", error);
      toast.error(error.message || "Erro ao fazer upload do logo");
    }
  };

  // Converter portais para opções de select
  const portalOptions: OptionType[] = Array.isArray(listPortals)
    ? listPortals.map((portal) => ({ value: portal.id, label: portal.name }))
    : [];

  // Converter categorias para opções de select
  const categoryOptions: OptionType[] = 
    listCompanyCategory && Array.isArray(listCompanyCategory.data)
      ? listCompanyCategory.data.map((category) => ({
          value: category.id,
          label: category.name,
        }))
      : [];

  // Modificar o onSubmit para usar a abordagem de envio separado da imagem
  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true);
      formSubmittedSuccessfully.current = false;

      // Preparar os dados para envio
      const companyData = {
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
      
      console.log('data.companyCategoryIds', data.companyCategoryIds)
      console.log("Dados enviados:", companyData);

      const hasImage = selectedImage && selectedImage.file;

      if (hasImage) {
        const imageFile = selectedImage.file;
        const companyName = data.name;

        // Criar a empresa
        await CreateCompany(companyData);
        formSubmittedSuccessfully.current = true;

        try {
          setTimeout(async () => {
            try {
              await uploadCompanyLogo(imageFile, companyName);
            } catch (error) {
              console.error("Erro no upload do logo no setTimeout:", error);
            }
          }, 0);
        } catch (error) {
          console.error("Erro ao fazer upload do logo:", error);
        }
      } else {
        await CreateCompany(companyData);
        formSubmittedSuccessfully.current = true;
      }

      reset();
      setSelectedImage(null);
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error);
      toast.error(error.message || "Erro ao criar empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remover caracteres não numéricos
    value = value.replace(/\D/g, "");

    // Formatar como 00000-000
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    }

    // Limitar a 9 caracteres (00000-000)
    value = value.substring(0, 9);

    setValue("cep", value);
  };

  // Formatar número de telefone enquanto o usuário digita
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remover caracteres não numéricos
    value = value.replace(/\D/g, "");

    // Formatar como (00) 00000-0000
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }

    if (value.length > 10) {
      value = value.replace(/^(\(\d{2}\)) (\d{5})(\d)/, "$1 $2-$3");
    }

    // Limitar a 15 caracteres ((00) 00000-0000)
    value = value.substring(0, 15);

    setValue("phone", value);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px] scroll-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
          {/* Header com botão de voltar e status */}
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

          {/* Grid de 3 colunas */}
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
                      modalTitle="Adicionar Logo"
                      confirmButtonText="Selecionar Logo"
                      uploadAreaText="Clique para adicionar o logo"
                      uploadAreaSubtext="SVG, PNG, JPG ou GIF (max. 5MB)"
                      onImageUpload={handleImageUpload}
                      selectedImage={selectedImage}
                      setSelectedImage={setSelectedImage}
                      showDescription={false}
                    />
                    {selectedImage && (
                      <p className="text-green-600 text-sm ml-2 mt-1">
                        Logo selecionado com sucesso
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2 e 3: Container para endereço, links e categorias */}
            <div className="lg:col-span-2 space-y-6">
              {/* Container de Endereço e Links de Contato */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna de Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Endereço
                  </h3>

                  <div className="space-y-4">
                    {/* Campo CEP com busca automática */}
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

                    {/* Cidade, Bairro e Estado na mesma linha */}
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

                    {/* Campo de endereço completo (preenchido automaticamente) */}
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

                {/* Coluna de Links e Contato */}
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

              {/* Portais e Categorias  */}
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
                      value={portalIds}
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
                      value={categoryIds}
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

          {/* Footer com botões de ação */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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
              disabled={isSubmitting || isLoadingCategories || categoryOptions.length === 0}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Criando...
                </div>
              ) : (
                "Criar Empresa"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
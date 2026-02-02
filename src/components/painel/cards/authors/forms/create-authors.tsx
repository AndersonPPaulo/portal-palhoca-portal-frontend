"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState, useRef } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { ResponsePromise, UserContext } from "@/providers/user";
import { parseCookies } from "nookies";
import { api } from "@/service/api";
import { toast } from "sonner";
import CustomSelect from "@/components/select/custom-select";
import { Pencil, User } from "lucide-react";
import Image from "next/image";

interface OptionType {
  value: string;
  label: string;
}

const authorsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email().min(1, "Email obrigatório"),
  phone: z.string().min(1, "Telefone/celular obrigatório"),
  roleId: z.string().min(1, "Função obrigatório"),
  password: z.string().min(1, "Senha obrigatório"),
  chiefEditorId: z
    .string()
    .min(1, "Responsável necessita ser indicado")
    .optional(),
  topic: z.string(),
});

type AuthorsFormData = z.infer<typeof authorsSchema>;

export default function FormCreateAuthors() {
  const { CreateUser, ListRoles, ListUser, roles } = useContext(UserContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesOptions, setRolesOptions] = useState<OptionType[]>([]);
  const [usersOptions, setUsersOptions] = useState<OptionType[]>([]);
  const formSubmittedSuccessfully = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AuthorsFormData>({
    resolver: zodResolver(authorsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleId: "",
      password: "",
      chiefEditorId: "",
      topic: "",
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          ListRoles(),
          ListUser({
            role: "chefe de redação|gerente comercial|administrador",
          }),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (roles && Array.isArray(roles)) {
      const roleOptions: OptionType[] = roles.map((role) => ({
        value: role.id,
        label: role.name || `Role ${role.id}`,
      }));
      setRolesOptions(roleOptions);
    }
  }, [roles]);

  const selectedRoleId = watch("roleId");

  useEffect(() => {
    const fetchChiefEditorsByRole = async () => {
      const selectedRole = roles?.find((role) => role.id === selectedRoleId);

      if (!selectedRole?.name) {
        setUsersOptions([]);
        return;
      }

      const roleName = selectedRole.name.toLowerCase();

      let roleFilter = "";

      if (["jornalista", "colunista", "chefe de redação"].includes(roleName)) {
        roleFilter = "chefe de redação";
      } else if (["vendedor", "gerente comercial"].includes(roleName)) {
        roleFilter = "gerente comercial";
      } else if (roleName === "administrador") {
        roleFilter = "chefe de redação|gerente comercial|administrador";
      } else {
        setUsersOptions([]);
        return;
      }

      try {
        const result = await ListUser({ role: roleFilter });

        if (result?.data?.length) {
          const mappedOptions = result.data.map((user: ResponsePromise) => ({
            value: user.id,
            label: `${user.name} - ${user.role?.name}`,
          }));
          setUsersOptions(mappedOptions);
        } else {
          setUsersOptions([]);
        }
      } catch (error) {
        console.error("Erro ao buscar responsáveis:", error);
        setUsersOptions([]);
      }
    };

    fetchChiefEditorsByRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId, roles]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.",
        );
        return;
      }

      // Validar tamanho (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Máximo permitido: 5MB.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedImage({ file, preview: previewUrl });
    }
  };

  const getProfileImageUrl = () => {
    if (selectedImage) {
      return selectedImage.preview;
    }
    return null;
  };

  useEffect(() => {}, [selectedImage]);

  const uploadUserImage = async (
    file: File,
    user_id: string,
    userName: string,
  ) => {
    try {
      const { "user:token": token } = parseCookies();

      if (user_id) {
        if (!file || file.size === 0) {
          throw new Error("Arquivo inválido ou vazio");
        }

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `Tipo de arquivo não suportado: ${file.type}. Use JPEG, PNG, GIF ou WebP.`,
          );
        }

        // Verificar tamanho (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(
            `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(
              2,
            )}MB. Máximo permitido: 5MB.`,
          );
        }

        // Criar FormData para enviar o arquivo
        const formData = new FormData();

        // Gerar nome único: nome do usuário + timestamp
        const timestamp = Date.now();
        const originalName = file.name;
        const extension = originalName.substring(originalName.lastIndexOf("."));

        // Formatar nome do usuário (remover espaços e caracteres especiais)
        const formattedUserName = userName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Remove acentos
          .replace(/[^a-z0-9]/g, "_") // Substitui caracteres especiais por underscore
          .replace(/_+/g, "_"); // Remove underscores duplicados

        const uniqueName = `${formattedUserName}_${timestamp}${extension}`;

        formData.append("user_image", file, uniqueName);

        // Fazer o upload da foto
        const uploadResponse = await api.post(
          `/user/${user_id}/upload-user-image`,
          formData,
          {
            headers: {
              Authorization: `bearer ${token}`,
            },
            timeout: 60000, // 60 segundos timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          },
        );

        // Verificar se a resposta contém user_image
        if (uploadResponse.data?.user_image) {
          toast.success("Foto de perfil enviada com sucesso!");
        } else {
          toast.success(
            "Upload realizado, mas verifique se a foto foi salva corretamente",
          );
        }
      } else {
        throw new Error(
          "Usuário criado, mas não foi possível encontrá-lo para adicionar a foto",
        );
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        request?: unknown;
        message?: string;
      };
      if (err.response) {
      } else if (err.request) {
        console.error("Request feito mas sem resposta:", err.request);
      }

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro ao fazer upload da foto";
      toast.error(errorMessage);
      throw error;
    }
  };

  const onSubmit = async (data: AuthorsFormData) => {
    try {
      setIsSubmitting(true);
      formSubmittedSuccessfully.current = false;

      // Verificar se o cargo selecionado é "vendedor"
      const selectedRole = roles?.find((role) => role.id === data.roleId);
      const isVendedor = selectedRole?.name.toLowerCase() === "vendedor";

      // Criar payload ajustado
      const payload = { ...data };

      // Remover campos vazios para evitar erro 400
      // if (!payload.topic || payload.topic.trim() === "") {
      //   delete payload.topic;
      // }

      // Se for vendedor, remover o chiefEditorId
      if (isVendedor) {
        delete payload.chiefEditorId;
      }

      // Log para debug - remover depois
      console.log("📤 Payload sendo enviado:", payload);
      console.log("🔍 É vendedor?", isVendedor);

      const hasImage = selectedImage && selectedImage.file;

      // console.log(payload);
      // return;

      // Enviar o payload ajustado (sem chiefEditorId se for vendedor)
      const response = await CreateUser(payload);

      formSubmittedSuccessfully.current = true;

      // Se há imagem selecionada, fazer upload após criação bem-sucedida
      if (hasImage) {
        const imageFile = selectedImage.file;

        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          await uploadUserImage(imageFile, response.response.id, data.name);

          setTimeout(async () => {
            try {
              await ListUser();
            } catch (reloadError) {
              console.error("Erro ao recarregar lista:", reloadError);
            }
          }, 1000);
        } catch (uploadError) {
          console.error("Erro ao fazer upload da foto:", uploadError);
          toast.error("Usuário criado, mas houve erro no upload da foto");
        }
      }

      // Limpar formulário e imagem
      reset();
      setSelectedImage(null);

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (error: unknown) {
      setIsSubmitting(false);
      const err = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            errors?: unknown;
            details?: string;
          };
          status?: number;
        };
        message?: string;
      };
      console.error("❌ Erro completo:", error);
      console.error("❌ Resposta do backend:", err?.response?.data);

      // Extrair todas as possíveis mensagens de erro do backend
      let errorMessage = "Erro ao criar usuário";
      let errorDetails: string[] = [];

      if (err?.response?.data) {
        const responseData = err.response.data;

        // Verificar se há mensagem principal
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }

        // Verificar se há array de erros (validações do backend)
        if (Array.isArray(responseData.errors)) {
          errorDetails = responseData.errors.map((errItem: unknown) => {
            const errDetail = errItem as { message?: string; msg?: string };
            if (typeof errDetail === "string") return errDetail;
            if (errDetail.message) return errDetail.message;
            if (errDetail.msg) return errDetail.msg;
            return JSON.stringify(errDetail);
          });
        } else if (
          responseData.errors &&
          typeof responseData.errors === "object"
        ) {
          // Se errors é um objeto com campos específicos
          errorDetails = Object.entries(responseData.errors).map(
            ([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(", ")}`;
              }
              return `${field}: ${messages}`;
            },
          );
        }

        // Verificar outros campos comuns de erro
        if (responseData.details) {
          errorDetails.push(responseData.details);
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Montar descrição com detalhes
      let description = "";
      if (err?.response?.status) {
        description = `Código: ${err.response.status}`;
      }
      if (errorDetails.length > 0) {
        description += description ? "\n" : "";
        description += errorDetails.join("\n");
      }

      // Exibir toast com todos os detalhes
      toast.error(errorMessage, {
        duration: 7000,
        description: description || undefined,
      });
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
        </div>

        {/* Layout com foto à esquerda e inputs em duas linhas à direita */}
        <div className="flex gap-6 items-start">
          {/* Foto de Perfil Circular */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={handleImageClick}
              className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group border-4 border-gray-200 hover:border-blue-500 transition-all"
            >
              {getProfileImageUrl() ? (
                <Image
                  src={getProfileImageUrl()!}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  width={128}
                  height={128}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Overlay com ícone de editar no hover */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Container dos inputs organizados em duas linhas */}
          <div className="flex-1 space-y-4">
            {/* Primeira linha de inputs */}
            <div className="grid grid-cols-3 gap-4">
              {/* Nome */}
              <div className="space-y-1">
                <CustomInput
                  id="name"
                  label="Nome"
                  {...register("name")}
                  placeholder="Nome completo"
                />
                {errors.name && (
                  <span className="text-xs text-red-500 block">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <CustomInput
                  id="email"
                  label="Email"
                  type="email"
                  {...register("email")}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <span className="text-xs text-red-500 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <CustomInput
                  id="phone"
                  label="Telefone"
                  {...register("phone")}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <span className="text-xs text-red-500 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>
            </div>

            {/* Segunda linha de inputs */}
            <div className="grid grid-cols-3 gap-4">
              {/* Senha */}
              <div className="space-y-1">
                <CustomInput
                  id="password"
                  label="Senha"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <span className="text-xs text-red-500 block">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Cargo - Usando CustomSelect */}
              <div className="space-y-1">
                <CustomSelect
                  id="roleId"
                  label="Cargo"
                  options={rolesOptions}
                  value={watch("roleId")}
                  onChange={(value) =>
                    setValue(
                      "roleId",
                      Array.isArray(value) ? (value[0] ?? "") : value,
                    )
                  }
                  placeholder="Selecione a função"
                />
                {errors.roleId && (
                  <span className="text-xs text-red-500 block">
                    {errors.roleId.message}
                  </span>
                )}
              </div>

              {/* Responsável Técnico - Usando CustomSelect */}
              <div className="space-y-1">
                <CustomSelect
                  id="chiefEditorId"
                  label="Responsável Técnico"
                  options={usersOptions}
                  value={watch("chiefEditorId") || ""}
                  onChange={(value) =>
                    setValue(
                      "chiefEditorId",
                      Array.isArray(value) ? (value[0] ?? "") : value,
                    )
                  }
                  placeholder="Selecione o responsável"
                />
                {errors.chiefEditorId && (
                  <span className="text-xs text-red-500 block">
                    {errors.chiefEditorId.message}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <CustomInput
                  id="topic"
                  label="Titulo da coluna"
                  {...register("topic")}
                  placeholder="Insira o titulo da coluna do colunista"
                />
                {errors.password && (
                  <span className="text-xs text-red-500 block">
                    {errors.topic?.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex w-full justify-end items-center pt-4">
          <div className="space-x-4">
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
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  {selectedImage
                    ? "Criando usuário e enviando foto..."
                    : "Criando..."}
                </div>
              ) : (
                <div className="flex items-center">Criar Usuário</div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

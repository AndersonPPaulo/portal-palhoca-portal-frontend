"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState, useRef } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { UserContext } from "@/providers/user";
import ThumbnailUploader from "@/components/thumbnail";
import { parseCookies } from "nookies";
import { api } from "@/service/api";
import { toast } from "sonner";
import CustomSelect from "@/components/select/custom-select";

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
  chiefEditorId: z.string().min(1, "Responsável necessita ser indicado"),
  topic: z.string(),
});

type AuthorsFormData = z.infer<typeof authorsSchema>;

export default function FormCreateAuthors() {
  const { CreateUser, ListRoles, ListUser, listUser, roles } =
    useContext(UserContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesOptions, setRolesOptions] = useState<OptionType[]>([]);
  const [usersOptions, setUsersOptions] = useState<OptionType[]>([]);
  const formSubmittedSuccessfully = useRef(false);
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

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([ListRoles(), ListUser()]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
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

  useEffect(() => {
    if (listUser && Array.isArray(listUser)) {
      const userOptions: OptionType[] = listUser.map((user) => ({
        value: user.id,
        label: user.name || user.email || `Usuário ${user.id}`,
      }));
      setUsersOptions(userOptions);
    }
  }, [listUser]);

  const handleImageUpload = (file: File, previewUrl: string) => {
    setSelectedImage({ file, preview: previewUrl });
  };

  useEffect(() => {}, [selectedImage]);

  const uploadUserImage = async (file: File, userEmail: string) => {
    try {
      const { "user:token": token } = parseCookies();

      const users = await ListUser();

      const createdUser = users?.find(
        (user) => user.email.toLowerCase() === userEmail.toLowerCase()
      );

      if (createdUser) {
        const userId = createdUser.id;

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
            `Tipo de arquivo não suportado: ${file.type}. Use JPEG, PNG, GIF ou WebP.`
          );
        }

        // Verificar tamanho (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(
            `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(
              2
            )}MB. Máximo permitido: 5MB.`
          );
        }

        // Criar FormData para enviar o arquivo
        const formData = new FormData();

        formData.append("user_image", file, file.name);

        // Fazer o upload da foto
        const uploadResponse = await api.post(
          `/user/${userId}/upload-user-image`,
          formData,
          {
            headers: {
              Authorization: `bearer ${token}`,
            },
            timeout: 60000, // 60 segundos timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        // Verificar se a resposta contém user_image
        if (uploadResponse.data?.user_image) {
          toast.success("Foto de perfil enviada com sucesso!");
        } else {
          toast.success(
            "Upload realizado, mas verifique se a foto foi salva corretamente"
          );
        }
      } else {
        throw new Error(
          "Usuário criado, mas não foi possível encontrá-lo para adicionar a foto"
        );
      }
    } catch (error: any) {
      if (error.response) {
      } else if (error.request) {
        console.error("Request feito mas sem resposta:", error.request);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erro ao fazer upload da foto";
      toast.error(errorMessage);
      throw error;
    }
  };

  const onSubmit = async (data: AuthorsFormData) => {
    try {
      setIsSubmitting(true);
      formSubmittedSuccessfully.current = false;

      const hasImage = selectedImage && selectedImage.file;

      await CreateUser(data);
      formSubmittedSuccessfully.current = true;

      // Se há imagem selecionada, fazer upload após criação bem-sucedida
      if (hasImage) {
        const imageFile = selectedImage.file;
        const userEmail = data.email;

        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          await uploadUserImage(imageFile, userEmail);

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
    } catch (error) {
      setIsSubmitting(false);
      console.error("Erro ao criar usuário:", error);
      toast.error("Erro ao criar usuário: " + (error as Error).message);
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
          {/* Thumbnail Uploader - mantém posição e tamanho */}
          <div className="flex-shrink-0 w-32">
            <ThumbnailUploader
              showDescription={false}
              width="w-full"
              height="h-28"
              borderRadius="rounded-xl"
              label="Foto"
              modalWidth="max-w-sm"
              previewHeight="h-32"
              onImageUpload={handleImageUpload}
              modalTitle="Adicionar Foto de Perfil"
              confirmButtonText="Selecionar Foto"
              uploadAreaText="Clique para adicionar foto"
              uploadAreaSubtext="JPG, PNG ou GIF (max. 5MB)"
            />
            {selectedImage && (
              <p className="text-green-600 text-xs mt-1">Foto selecionada</p>
            )}
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
                      Array.isArray(value) ? value[0] ?? "" : value
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
                  value={watch("chiefEditorId")}
                  onChange={(value) =>
                    setValue(
                      "chiefEditorId",
                      Array.isArray(value) ? value[0] ?? "" : value
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

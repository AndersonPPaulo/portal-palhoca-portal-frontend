"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/input/custom-input";
import CustomSelect from "@/components/select/custom-select";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/providers/user";
import { parseCookies } from "nookies";
import { toast } from "sonner";
import { api } from "@/service/api";
import { Pencil, User } from "lucide-react";

interface OptionType {
  value: string;
  label: string;
}

const authorsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(), // Email apenas para exibição
  phone: z.string().optional(),
  roleId: z.string().min(1, "Função obrigatória"),
  password: z.string().optional(), // Senha opcional na edição
  chiefEditorId: z.string().optional(),
  topic: z.string().optional(),
});

type AuthorsFormData = z.infer<typeof authorsSchema>;

type FormUpdateAuthorsProps = {
  profileData: {
    id: string;
    name: string;
    email: string;
    phone: string;
    roleId: string;
    topic?: string;
    chiefEditorId?: string;
  };
};

export default function FormUpdateAuthors({
  profileData,
}: FormUpdateAuthorsProps) {
  const { UpdateProfile, ListUser, profile } = useContext(UserContext);

  const { back, push } = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesOptions, setRolesOptions] = useState<OptionType[]>([]);
  const [usersOptions, setUsersOptions] = useState<OptionType[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AuthorsFormData>({
    resolver: zodResolver(authorsSchema),
    defaultValues: {
      ...profileData,
    },
  });

  // Usar o cargo do profile ao invés de buscar todas as roles
  // O campo está desabilitado, então só precisa mostrar o cargo atual
  useEffect(() => {
    if (profile?.role) {
      setRolesOptions([{ value: profile.role.id, label: profile.role.name }]);
    }
  }, [profile]);

  useEffect(() => {
    const roleName = profile?.role?.name?.toLowerCase();

    // Vendedores não têm permissão para listar usuários
    // Então usamos apenas o chiefEditor que já vem no profile
    if (roleName === "vendedor") {
      if (profile?.chiefEditor) {
        setUsersOptions([
          {
            value: profile.chiefEditor.id,
            label: profile.chiefEditor.name,
          },
        ]);
      } else {
        setUsersOptions([]);
      }
      return; // Não tenta buscar lista de usuários
    }

    // Para outros cargos, busca a lista de responsáveis
    if (roleName) {
      let roleFilter = "";
      if (["jornalista", "colunista", "chefe de redação"].includes(roleName)) {
        roleFilter = "chefe de redação";
      } else if (roleName === "gerente comercial") {
        roleFilter = "gerente comercial";
      } else if (roleName === "administrador") {
        roleFilter = "chefe de redação|gerente comercial|administrador";
      }

      if (roleFilter) {
        ListUser({ role: roleFilter }).then((res) => {
          if (res?.data?.length) {
            setUsersOptions(
              res.data.map((user) => ({
                value: user.id,
                label: `${user.name} - ${user.role?.name}`,
              })),
            );
          }
        });
      }
    }
  }, [profile]);

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
    return profile?.user_image?.url || null;
  };

  const uploadUserImage = async (file: File, user_id: string) => {
    const { "user:token": token } = parseCookies();

    // Gerar nome único: timestamp + nome original
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf("."));
    const nameWithoutExtension = originalName.substring(
      0,
      originalName.lastIndexOf("."),
    );
    const uniqueName = `${nameWithoutExtension}_${timestamp}${extension}`;

    const formData = new FormData();
    formData.append("user_image", file, uniqueName);

    await api.post(`/user/${user_id}/upload-user-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Foto atualizada com sucesso!");
  };

  const onSubmit = async (data: AuthorsFormData) => {
    setIsSubmitting(true);

    try {
      const formattedData = {
        ...data,
        phone: data.phone?.trim() || undefined,
      };

      // Remover email do payload (não pode ser alterado)
      delete formattedData.email;

      // Se for vendedor, remover chiefEditorId do payload (não pode alterar)
      const isVendedor = profile?.role?.name?.toLowerCase() === "vendedor";
      if (isVendedor) {
        delete formattedData.chiefEditorId;
      }

      await UpdateProfile(formattedData, profileData.id);

      // Se há nova foto selecionada, faz upload
      if (selectedImage?.file) {
        await uploadUserImage(selectedImage.file, profileData.id);
      }

      toast.success("Perfil atualizado com sucesso!");

      setTimeout(() => {
        push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar usuário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <img
                  src={getProfileImageUrl()!}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <CustomInput
                  id="name"
                  label="Nome"
                  {...register("name")}
                  placeholder="Nome completo"
                />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <CustomInput
                  id="email"
                  label="Email"
                  {...register("email")}
                  placeholder="email@exemplo.com"
                  disabled={true}
                />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <CustomInput
                  id="phone"
                  label="Telefone"
                  {...register("phone")}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <span className="text-xs text-red-500">
                    {errors.phone.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <CustomSelect
                  id="roleId"
                  label="Cargo"
                  options={rolesOptions}
                  value={watch("roleId")}
                  onChange={(value) =>
                    setValue("roleId", Array.isArray(value) ? value[0] : value)
                  }
                  placeholder="Selecione a função"
                  disable={true}
                />
                {errors.roleId && (
                  <span className="text-xs text-red-500">
                    {errors.roleId.message}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <CustomSelect
                  id="chiefEditorId"
                  label="Responsável Técnico"
                  options={usersOptions}
                  value={watch("chiefEditorId") ?? ""}
                  onChange={(value) =>
                    setValue(
                      "chiefEditorId",
                      Array.isArray(value) ? value[0] : value,
                    )
                  }
                  placeholder="Selecione o responsável"
                  disable={profile?.role?.name?.toLowerCase() === "vendedor"}
                />
                {errors.chiefEditorId && (
                  <span className="text-xs text-red-500">
                    {errors.chiefEditorId.message}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <CustomInput
                  id="topic"
                  label="Título da Coluna"
                  {...register("topic")}
                  placeholder="Insira o título da coluna"
                />
              </div>
            </div>
          </div>
        </div>

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
              {isSubmitting ? "Atualizando..." : "Atualizar conta"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

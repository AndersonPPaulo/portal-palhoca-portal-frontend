"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/input/custom-input";
import CustomSelect from "@/components/select/custom-select";
import ThumbnailUploader from "@/components/thumbnail";
import { Button } from "@/components/ui/button";
import ReturnPageButton from "@/components/button/returnPage";
import { UserContext } from "@/providers/user";
import { parseCookies } from "nookies";
import { toast } from "sonner";
import { api } from "@/service/api";

interface OptionType {
  value: string;
  label: string;
}

const authorsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  roleId: z.string().min(1, "Função obrigatória"),
  password: z.string().optional(), // Senha opcional na edição
  chiefEditorId: z.string().min(1, "Responsável obrigatório"),
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
  const { UpdateUser, ListRoles, ListUser, roles, profile } =
    useContext(UserContext);
  const { back } = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesOptions, setRolesOptions] = useState<OptionType[]>([]);
  const [usersOptions, setUsersOptions] = useState<OptionType[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);

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

  useEffect(() => {
    ListRoles();
  }, []);

  useEffect(() => {
    if (roles) {
      setRolesOptions(
        roles.map((role) => ({ value: role.id, label: role.name }))
      );
    }
  }, [roles]);

  useEffect(() => {
    const roleId = watch("roleId");
    const roleName = roles
      ?.find((role) => role.id === roleId)
      ?.name?.toLowerCase();

    if (roleName) {
      let roleFilter = "";
      if (["jornalista", "colunista", "chefe de redação"].includes(roleName)) {
        roleFilter = "chefe de redação";
      } else if (["vendedor", "gerente comercial"].includes(roleName)) {
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
              }))
            );
          }
        });
      }
    }
  }, [watch("roleId")]);

  const handleImageUpload = (file: File, previewUrl: string) => {
    setSelectedImage({ file, preview: previewUrl });
  };

  const uploadUserImage = async (file: File, user_id: string) => {
    const { "user:token": token } = parseCookies();

    const formData = new FormData();
    formData.append("user_image", file, file.name);

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
      await UpdateUser(data, profileData.id);

      if (selectedImage?.file) {
        await uploadUserImage(selectedImage.file, profileData.id);
      }

      toast.success("Usuário atualizado com sucesso!");
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
              modalTitle="Alterar Foto de Perfil"
              confirmButtonText="Selecionar Foto"
              uploadAreaText="Clique para adicionar foto"
              uploadAreaSubtext="JPG, PNG ou GIF (max. 5MB)"
            />
            {selectedImage && (
              <p className="text-green-600 text-xs mt-1">Foto selecionada</p>
            )}
          </div>

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
                  value={watch("chiefEditorId")}
                  onChange={(value) =>
                    setValue(
                      "chiefEditorId",
                      Array.isArray(value) ? value[0] : value
                    )
                  }
                  placeholder="Selecione o responsável"
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

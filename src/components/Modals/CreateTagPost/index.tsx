"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { api } from "@/service/api";
import { parseCookies } from "nookies";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import Switch from "@/components/switch";
import { X } from "lucide-react";
import { TagContext } from "@/providers/tags";

const tagSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  status: z.boolean().default(true),
});

type TagFormData = z.infer<typeof tagSchema>;

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newTag: {
    name: string;
    description: string;
    status: boolean;
  }) => void;
}

export default function CreateTagModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTagModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { CreateTag, ListTags } = useContext(TagContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      description: "",
      status: true,
    },
  });

  const status = watch("status");

  const onSubmit = async (data: TagFormData) => {
    setIsSubmitting(true);
    try {
      // Criar tag diretamente via API
      const newTag = await CreateTag(data, false);

      await ListTags();

      // Aguardar um momento para mostrar feedback visual
      setTimeout(() => {
        setIsSubmitting(false);
        reset();

        // Chamar callback de sucesso com os dados da nova tag
        if (onSuccess && newTag) {
          onSuccess({
            status: newTag.status,
            name: newTag.name,
            description: newTag.description,
          });
        }

        onClose();
      }, 1000);
    } catch (error: any) {
      console.log("error", error);
      setIsSubmitting(false);
      toast.error(error.message || "Erro ao criar tag");
      console.error("Erro ao criar tag:", error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header do Modal */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Criar Nova Tag de Semelhança
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg p-2">
                <label htmlFor="status" className="text-gray-40 text-sm">
                  {status ? "Ativa" : "Inativada"}
                </label>
                <Switch
                  value={status}
                  onChange={(checked) => setValue("status", checked)}
                />
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Campos do Formulário */}
          <div className="space-y-4">
            <div className="space-y-2">
              <CustomInput
                id="name"
                label="Nome da Tag de Semelhança"
                {...register("name")}
                placeholder="Digite o nome da tag de semelhança"
              />
              {errors.name && (
                <span className="text-sm text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <CustomInput
                textareaInput
                label="Descrição da tag de semelhança"
                id="description"
                {...register("description")}
                placeholder="Escreva uma descrição da tag de semelhança"
              />
              {errors.description && (
                <span className="text-sm text-red-500">
                  {errors.description.message}
                </span>
              )}
            </div>
          </div>

          {/* Botões do Modal */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? "Criando..." : "Criar Tag de Semelhança"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import Switch from "@/components/switch";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { TagContext } from "@/providers/tags";

const tagSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  status: z.boolean().default(true),
});

type TagFormData = z.infer<typeof tagSchema>;

export default function FormCreateTag() {
  const { CreateTag } = useContext(TagContext);
  const { back, replace } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await CreateTag(data);
      setTimeout(() => {
        setIsSubmitting(false);
        reset();
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      alert(error);
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
          <div className="flex items-center gap-2 rounded-lg p-4">
            <label htmlFor="status" className="text-gray-40">
              {status ? "Ativa" : "Inativada"}
            </label>
            <Switch
              value={status}
              onChange={(checked) => setValue("status", checked)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
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
        </div>
        <div className="flex w-full justify-end items-center">
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
        <div className="flex w-full justify-end items-center">
          <div className="space-x-4">
            <Button
              type="button"
              onClick={back}
              className="bg-red-light text-[#611A1A] hover:bg-red-light/80  rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Criar Tag de Semelhança
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

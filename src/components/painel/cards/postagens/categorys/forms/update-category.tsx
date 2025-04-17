"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import ReturnPageButton from "@/components/button/returnPage";
import { CategorysContext } from "@/providers/categorys";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function FormUpdateCategory() {
  const { UpdateCategory, category } =
    useContext(CategorysContext);
  const { back } = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    setValue("name", category!.name);
  }, [params?.id, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    const id = params?.id as string;
    if (!id) return;
    setIsSubmitting(true);
    try {
      await UpdateCategory(data, id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
          <h2 className="text-xl font-semibold">Editar Categoria</h2>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <CustomInput
              id="name"
              label="Nome da categoria"
              {...register("name")}
              placeholder="Digite o nome da categoria"
            />
            {errors.name && (
              <span className="text-sm text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end items-center">
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
              Atualizar Categoria
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

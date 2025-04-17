"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";
import TransferList from "@/components/transferList";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function FormCreateCompanyCategory() {
  const { CreateCompanyCategory } = useContext(CompanyCategoryContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransferList, setShowTransferList] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await CreateCompanyCategory(data);
      setTimeout(() => {
        setIsSubmitting(false);
        reset();
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      alert("Erro ao criar categoria");
    }
  };

  const toggleTransferList = () => {
    setShowTransferList(!showTransferList);
  };

  return (
    <div className=" bg-white p-6 rounded-3xl h-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
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
        
        <div className="mt-4">
          <Button
            type="button"
            onClick={toggleTransferList}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
          >
            {showTransferList ? "Ocultar associação de comércios" : "Associar comércios a esta categoria"}
          </Button>
          {showTransferList && (
          <div className="h-full mt-4">
            <h3 className="text-lg font-medium mb-2">Associar comércios a esta categoria</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecione os comércios que deseja associar a esta categoria.
            </p>
            <TransferList/>
          </div>
        )}
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
              Criar Categoria
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState, useEffect } from "react";
import CustomInput from "@/components/input/custom-input";
import CustomSelect from "@/components/select/custom-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ReturnPageButton from "@/components/button/returnPage";
import { WhatsappGroupContext } from "@/providers/whatsapp-group";
import { PortalContext } from "@/providers/portal";
import { UserContext } from "@/providers/user";

const whatsappGroupSchema = z.object({
  link: z.string().min(1, "Link do WhatsApp é obrigatório").url("Link deve ser uma URL válida"),
  portal_id: z.string().min(1, "Portal é obrigatório"),
  user_id: z.string().min(1, "Usuário é obrigatório"),
});

type WhatsappGroupFormData = z.infer<typeof whatsappGroupSchema>;

export default function FormCreateWhatsappGroup() {
  const { CreateWhatsappGroup } = useContext(WhatsappGroupContext);
  const { ListPortals, listPortals } = useContext(PortalContext);
  const { profile } = useContext(UserContext);
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portalValue, setPortalValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<WhatsappGroupFormData>({
    resolver: zodResolver(whatsappGroupSchema),
    defaultValues: {
      link: "",
      portal_id: "",
      user_id: "",
    },
  });

  // Carregar portais e definir user_id
  useEffect(() => {
    const loadData = async () => {
      try {
        await ListPortals();
        if (profile?.id) {
          setValue("user_id", profile.id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();
  }, [ListPortals, profile?.id, setValue]);

  // Opções para o select de portais
  const portalOptions = listPortals?.map(portal => ({
    value: portal.id,
    label: portal.name
  })) || [];

  const handlePortalChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    setPortalValue(stringValue);
    setValue("portal_id", stringValue);
  };

  const onSubmit = async (data: WhatsappGroupFormData) => {
    try {
      setIsSubmitting(true);

      await CreateWhatsappGroup({
        link: data.link,
        portal_id: data.portal_id,
        user_id: data.user_id,
      });

      // Limpar formulário
      reset();
      setPortalValue("");
    } catch (error) {
      console.error("Erro ao criar grupo de WhatsApp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6 rounded-[24px] bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-between items-center">
          <ReturnPageButton />
        </div>

        <div className="space-y-4">
          {/* Link do WhatsApp */}
          <div className="space-y-1">
            <CustomInput
              id="link"
              label="Link do WhatsApp"
              {...register("link")}
              placeholder="https://chat.whatsapp.com/..."
            />
            {errors.link && (
              <span className="text-xs text-red-500 block px-6">
                {errors.link.message}
              </span>
            )}
          </div>

          {/* Portal */}
          <div className="space-y-1">
            <CustomSelect
              id="portal_id"
              label="Portal"
              options={portalOptions}
              value={portalValue}
              onChange={handlePortalChange}
              placeholder="Selecione um portal"
              error={errors.portal_id?.message}
            />
          </div>

          {/* Campo oculto para user_id */}
          <input type="hidden" {...register("user_id")} />
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
                  Criando...
                </div>
              ) : (
                "Criar Grupo WhatsApp"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
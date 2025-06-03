"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/service/api";
import { parseCookies } from "nookies";
import CustomInput from "@/components/input/custom-input";
import CustomSelect, { OptionType } from "@/components/select/custom-select";
import { Button } from "@/components/ui/button";
import TiptapEditor from "@/components/editor/tiptapEditor";
import ReturnPageButton from "@/components/button/returnPage";
import ThumbnailUploader from "@/components/thumbnail";
import { ArticleContext } from "@/providers/article";
import { CategorysContext } from "@/providers/categorys";
import { TagContext } from "@/providers/tags";
import { UserContext } from "@/providers/user";
import { PortalContext } from "@/providers/portal";

const ARTICLE_STATUS = { DRAFT: "DRAFT", PENDING_REVIEW: "PENDING_REVIEW" };

const articleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  reading_time: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Tempo de leitura é obrigatório")
  ),
  resume_content: z
    .string()
    .min(100, "Resumo é obrigatório minimo de 100 caracteres"),
  content: z
    .string()
    .min(300, "Conteudo é obrigatório minimo de 300 caracteres"),
  initialStatus: z.string().optional(),
  highlight: z.boolean().default(false),
  categoryId: z.string().min(1, "Adicione uma categoria"),
  tagIds: z.array(z.string()).min(1, "Pelo menos uma tag é obrigatória"),
  chiefEditorId: z.string().optional(),
  portalIds: z.array(z.string()).min(1, "Pelo menos um portal é obrigatório"),
  thumbnailDescription: z.string().optional().default(""),
});
type ArticleFormData = z.infer<typeof articleSchema>;

const generateSlug = (text: string) =>
  text
    .normalize("NFD") // separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos
    .replace(/ç/g, "c") // substitui ç por c
    .replace(/[^a-zA-Z0-9\s-]/g, "") // remove caracteres especiais (exceto espaço e hífen)
    .trim() // remove espaços do início/fim
    .toLowerCase()
    .replace(/\s+/g, "-"); // substitui espaços por hífen

const uploadThumbnailToServer = async (
  file: File,
  description: string,
  articleId: string
): Promise<string> => {
  const { "user:token": token } = parseCookies();
  const formData = new FormData();

  // Garantir que a descrição seja enviada, mesmo que vazia
  formData.append("description", description || "");
  formData.append("thumbnail", file);

  const config = {
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await api.post(
      `/upload-thumbnail/${articleId}`,
      formData,
      config
    );
    return response.data?.thumbnailUrl || "";
  } catch (err) {
    console.error("Erro ao fazer upload da thumbnail:", err);
    return "";
  }
};

export default function FormCreateArticle() {
  const { push, back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
    description: string;
  } | null>(null);
  const [thumbnailDescription, setThumbnailDescription] = useState("");

  const { CreateArticle, ListAuthorArticles } = useContext(ArticleContext);
  const { ListCategorys, listCategorys } = useContext(CategorysContext);
  const { ListTags, listTags } = useContext(TagContext);
  const { profile } = useContext(UserContext);
  const { ListPortals, listPortals } = useContext(PortalContext);

  useEffect(() => {
    Promise.all([
      ListTags(),
      ListCategorys(),
      ListAuthorArticles(),
      ListPortals(),
    ]);
  }, []);

  const tagOptions: OptionType[] = Array.isArray(listTags)
    ? listTags.map((tag) => ({ value: tag.id, label: tag.name }))
    : [];
  const portalOptions: OptionType[] = Array.isArray(listPortals)
    ? listPortals.map((portal) => ({ value: portal.id, label: portal.name }))
    : [];
  const categoryOptions: OptionType[] = Array.isArray(listCategorys)
    ? listCategorys.map((category) => ({
        value: category.id,
        label: category.name,
      }))
    : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      reading_time: 0,
      resume_content: "",
      content: "",
      initialStatus: "",
      highlight: false,
      categoryId: "",
      tagIds: [],
      chiefEditorId: profile?.chiefEditor?.id ,
      portalIds: [],
      thumbnailDescription: "",
    },
  });
  console.log("profile", profile);

  const title = watch("title");
  const categoryId = watch("categoryId");
  const tagIds = watch("tagIds");
  const portalIds = watch("portalIds");
  const watchedThumbnailDescription = watch("thumbnailDescription");

  // Sincronizar o estado local com o valor do formulário
  useEffect(() => {
    setThumbnailDescription(watchedThumbnailDescription || "");
  }, []);

  useEffect(() => {
    if (title) setValue("slug", generateSlug(title), { shouldValidate: true });
  }, [title, setValue]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue("content", content, { shouldValidate: true });
  };

  const handleImageUpload = (
    file: File,
    previewUrl: string,
    description?: string
  ) => {
    const desc = description ?? "";
    setSelectedImage({ file, preview: previewUrl, description: desc });
    setValue("thumbnailDescription", desc);
    setThumbnailDescription(desc);
  };

  const submitWithStatus = async (data: ArticleFormData, status: string) => {
    try {
      setIsSubmitting(true);
      if (!profile?.id) {
        toast.error(
          "Seu perfil não está completamente carregado. Recarregue a página."
        );
        return;
      }

      data.thumbnailDescription = thumbnailDescription;

      const formData = {
        ...data,
        thumbnail: "",
        initialStatus: status,
        chiefEditorId: profile.chiefEditor?.id || "",
        creator: profile.id,
        portals: data.portalIds,
      };

      const createdArticle = await CreateArticle(formData);
      if (selectedImage && selectedImage.file && createdArticle?.id) {
        try {
          await uploadThumbnailToServer(
            selectedImage.file,
            thumbnailDescription,
            createdArticle.id
          );
        } catch (error: any) {
          toast.error(
            `Artigo criado, mas houve um erro no upload da imagem: ${
              error.message || error
            }`
          );
        }
      }
      toast.success(
        status === ARTICLE_STATUS.DRAFT
          ? "Rascunho salvo com sucesso!"
          : "Artigo enviado para revisão com sucesso!"
      );
      reset();
      setSelectedImage(null);
      setEditorContent("");
      setThumbnailDescription("");
      setTimeout(() => push("/postagens"), 1000);
    } catch (error: any) {
      toast.error(
        `Erro ao ${
          status === ARTICLE_STATUS.DRAFT ? "salvar rascunho" : "criar artigo"
        }. Tente novamente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile?.id) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[24px] p-6">
        <p className="text-lg">Carregando informações do usuário...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <form
          onSubmit={handleSubmit((data) =>
            submitWithStatus(data, ARTICLE_STATUS.PENDING_REVIEW)
          )}
          className="space-y-6 p-6"
        >
          <div className="flex justify-between items-center -mb-4 text-4xl">
            <ReturnPageButton />
          </div>
          <div className="flex gap-6">
            <div className="w-full">
              <CustomInput
                id="title"
                label="Título"
                {...register("title")}
                placeholder="Digite o título"
              />
              {errors.title && (
                <span className="text-sm text-red-500">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="w-full">
              <CustomInput
                id="slug"
                label="Slug"
                {...register("slug")}
                disabled
              />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col w-full">
              <ThumbnailUploader
                label="Thumbnail"
                modalTitle="Adicionar Thumbnail"
                confirmButtonText="Selecionar Imagem"
                uploadAreaText="Clique para adicionar o Thumbnail"
                uploadAreaSubtext="SVG, PNG, JPG ou GIF (max. 5MB)"
                onImageUpload={handleImageUpload}
              />

              {/* Campo para a descrição da thumbnail */}
              {thumbnailDescription && (
                <span className="text-gray-700 mt-2 ml-2">
                  Descrição da Imagem: {thumbnailDescription}
                </span>
              )}
            </div>
            <div className="basis-1/2">
              <div className="mt-5">
                <CustomSelect
                  id="tagIds"
                  label="Tag(s):"
                  placeholder="Selecione uma ou mais tags"
                  options={tagOptions}
                  value={tagIds}
                  onChange={(value) =>
                    setValue("tagIds", value as string[], {
                      shouldValidate: true,
                    })
                  }
                  isMulti={true}
                  error={errors.tagIds?.message}
                  noOptionsMessage="Nenhuma tag disponível"
                />
              </div>
              <div className="mt-10">
                <CustomInput
                  id="reading_time"
                  label="Tempo de leitura"
                  type="number"
                  {...register("reading_time", {
                    setValueAs: (value: string) => Number(value) || undefined,
                  })}
                  onChange={(e) =>
                    setValue("reading_time", Number(e.target.value))
                  }
                  min={1}
                />
                {errors.reading_time && (
                  <span className="text-sm text-red-500">
                    {errors.reading_time.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col gap-1 w-full">
              <label className="px-6" htmlFor="creator">
                Criador
              </label>
              <div className="w-full rounded-[24px] px-6 py-4 mt-2 min-h-14 border-2 border-primary-light flex items-center">
                <span className="text-gray-700">
                  {profile.name || profile.email}
                </span>
              </div>
            </div>
            <CustomSelect
              id="categoryId"
              label="Categoria:"
              placeholder="Selecione uma categoria"
              options={categoryOptions}
              value={categoryId}
              onChange={(value) =>
                setValue("categoryId", value as string, {
                  shouldValidate: true,
                })
              }
              isMulti={false}
              error={errors.categoryId?.message}
              noOptionsMessage="Nenhuma categoria disponível"
            />
            <CustomSelect
              id="portalIds"
              label="Portal:"
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
          <div className="w-full">
            <CustomInput
              id="resume_content"
              label="Resumo"
              textareaInput
              className="min-h-32"
              {...register("resume_content")}
              placeholder="Digite o resumo"
            />
            {errors.resume_content && (
              <span className="text-sm text-red-500">
                {errors.resume_content.message}
              </span>
            )}
          </div>
          <div className="w-full">
            <h1 className="text-xl font-bold text-primary ml-6 pt-4">
              Adicionar conteudo de texto
            </h1>
            <div className="w-full">
              <TiptapEditor
                value={editorContent}
                onChange={handleEditorChange}
              />
              {errors.content && (
                <span className="text-sm text-red-500 ml-6">
                  {errors.content.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={handleSubmit((data) =>
                submitWithStatus(data, ARTICLE_STATUS.DRAFT)
              )}
              className="bg-yellow-200 text-[#9c6232] hover:bg-yellow-100 rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processando..." : "Rascunho"}
            </Button>
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
              {isSubmitting ? "Processando..." : "Criar Artigo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

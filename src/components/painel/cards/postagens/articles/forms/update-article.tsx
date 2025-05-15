"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useContext, useEffect, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import Switch from "@/components/switch";
import { useParams, useRouter } from "next/navigation";
import TiptapEditor from "@/components/editor/tiptapEditor";
import ReturnPageButton from "@/components/button/returnPage";
import { ArticleContext, Article } from "@/providers/article";
import { CategorysContext } from "@/providers/categorys";
import { TagContext } from "@/providers/tags";
import { toast } from "sonner";
import { UserContext } from "@/providers/user";
import CustomSelect, { OptionType } from "@/components/select/custom-select";
import { PortalContext } from "@/providers/portal";
import ThumbnailUploader from "@/components/thumbnail";

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  creator: z.string().min(1, "Criador é obrigatório"),
  reading_time: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Tempo de leitura é obrigatório")
  ),
  resume_content: z
    .string()
    .min(100, "Resumo é obrigatório mínimo de 100 caracteres"),
  content: z
    .string()
    .min(300, "Conteúdo é obrigatório mínimo de 300 caracteres"),
  highlight: z.boolean().default(false),
  thumbnail: z.string(),
  thumbnailDescription: z.string().optional().default(""),
  categoryId: z.string().min(1, "Adicione uma categoria"),
  tagIds: z.array(z.string()).min(1, "Pelo menos uma tag é obrigatória"),
  chiefEditorId: z.string().optional(),
  portalIds: z.array(z.string()).min(1, "Pelo menos um portal é obrigatório"),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

interface FormEditArticleProps {
  article: Article;
}

export default function FormEditArticle({ article }: FormEditArticleProps) {
  const parameter = useParams();
  const { back, push } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState(article.content || "");
  const [isDraft, setIsDraft] = useState(
    article.status_history?.some((status) => status.status === "DRAFT") || false
  );
  const { UpdateArticle, ListAuthorArticles, listArticles, uploadThumbnail } =
  useContext(ArticleContext);
  const { ListCategorys, listCategorys } = useContext(CategorysContext);
  const { ListTags, listTags } = useContext(TagContext);
  const { profile } = useContext(UserContext);
  const { ListPortals, listPortals } = useContext(PortalContext);
  const [changeStatus, setChangeStatus] = useState("");
  const [changeMessage, setChangeMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
    description: string;
  } | null>(null);
  
  const findArticle = listArticles?.data?.find(
    (item) => item.id === parameter.id
  );
  
  // Função simplificada para extrair os IDs dos portais
  const getArticlePortalIds = () => {
    if (!article.portals) return [];
    return Array.isArray(listPortals) && typeof article.portals[0] === 'object'
      ? article.portals.map(portal => portal.id)
      : article.portals;
  };

  useEffect(() => {
    const statusHistory = () => {
      if (
        !findArticle?.status_history ||
        findArticle.status_history.length === 1
      ) {
        return "";
      }
      const sortedHistory = [...findArticle.status_history].sort(
        (a, b) =>
          new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
      );

      setChangeStatus(sortedHistory[0].status);
      setChangeMessage(sortedHistory[0].change_request_description);
    };
    statusHistory();
  }, [findArticle?.status_history]);

  useEffect(() => {
    Promise.all([
      ListTags && ListTags(),
      ListCategorys && ListCategorys(),
      ListAuthorArticles && ListAuthorArticles(),
      ListPortals && ListPortals(),
    ]).then(() => {
      if (article.tags && article.tags.length > 0 && listTags?.length > 0) {
        const validTagIds = article.tags
          .filter((tag) => listTags.some((listTag) => listTag.id === tag.id))
          .map((tag) => tag.id);

        setValue("tagIds", validTagIds);
      }
    });
  }, []);

  // Inicializar a imagem da thumbnail se existir
  useEffect(() => {
    if (article.thumbnail) {
      let thumbnailUrl = "";
      if (typeof article.thumbnail === "string") {
        thumbnailUrl = article.thumbnail;
      } else if (article.thumbnail?.url) {
        thumbnailUrl = article.thumbnail.url;
      }

      if (thumbnailUrl) {
        setSelectedImage({
          file: null as any, // Não temos o arquivo original, só a URL
          preview: thumbnailUrl,
          description: article.thumbnail.description || "",
        });
      }
    }
  }, [article]);

  const tagOptions: OptionType[] = Array.isArray(listTags)
    ? listTags.map((tag: any) => ({ value: tag.id, label: tag.name }))
    : [];
    
  const categoryOptions: OptionType[] = Array.isArray(listCategorys)
    ? listCategorys.map((category: any) => ({
        value: category.id,
        label: category.name,
      }))
    : [];
    
  // Corrigido para acessar portals dentro de listPortals
  const portalOptions: OptionType[] = listPortals?.portals
    ? listPortals.portals.map(portal => ({ value: portal.id, label: portal.name }))
    : [];
    
  const creatorOptions: OptionType[] = listArticles?.data
    ? Array.from(
        new Map(
          listArticles.data
            .filter((article) => article.creator?.id)
            .map((article) => [
              article.creator.id,
              { value: article.creator.id, label: article.creator.name },
            ])
        ).values()
      )
    : [];

  const {
    register,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      creator: article.creator.id,
      reading_time: Number(article.reading_time),
      resume_content: article.resume_content,
      content: article.content,
      highlight: article.highlight === true,
      categoryId: article.category?.id,
      tagIds: article.tags?.map((tag) => tag.id) || [],
      portalIds: getArticlePortalIds(), 
    },
  });

  useEffect(() => {
    if (article) {
      reset({
        id: article.id,
        title: article.title,
        slug: article.slug,
        creator: article.creator?.id || "",
        reading_time: Number(article.reading_time),
        resume_content: article.resume_content,
        content: article.content,
        highlight: article.highlight === true,
        categoryId: article.category?.id,
        tagIds: article.tags?.map((tag) => tag.id) || [],
        chiefEditorId: profile?.chiefEditor?.id,
        portalIds: getArticlePortalIds(), 
      });
      setIsDraft(
        article.status_history?.some((status) => status.status === "DRAFT") ||
          false
      );
      setEditorContent(article.content || "");
    }
  }, [article, reset, profile]);

  const title = watch("title");
  const tagIds: string[] = watch("tagIds") || [];
  const categoryId: string = watch("categoryId") || "";
  const portalIds: string[] = watch("portalIds") || [];
  const creator: string = watch("creator") || "";

  useEffect(() => {
    if (title) {
      setValue("slug", generateSlug(title), { shouldValidate: true });
    }
  }, [title, setValue]);

  const validateTagSelection = (selectedTags: string[]) => {
    const validTags = selectedTags.filter((tagId) =>
      tagOptions.some((option) => option.value === tagId)
    );

    if (validTags.length !== selectedTags.length) {
      toast.error(
        "Uma ou mais tags selecionadas não foram encontradas. Por favor, selecione apenas tags válidas."
      );
      return validTags;
    }

    return selectedTags;
  };

  const handleImageUpload = (
    file: File,
    previewUrl: string,
    description: string
  ) => {
    setSelectedImage({ file, preview: previewUrl, description });
    setValue("thumbnailDescription", description, { shouldValidate: true });
  };

  const submitArticle = async (data: ArticleFormData, setToDraft: boolean) => {
    try {
      const validatedTags = validateTagSelection(data.tagIds);

      if (validatedTags.length !== data.tagIds.length) {
        setValue("tagIds", validatedTags);
        return;
      }

      setIsSubmitting(true);

      const finalData = {
        title: data.title,
        slug: data.slug,
        reading_time: data.reading_time,
        resume_content: data.resume_content,
        content: data.content,
        highlight: data.highlight,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
        portalIds: data.portalIds, // Enviando os IDs dos portais
        setToDraft: setToDraft,
        chiefEditorId: profile?.chiefEditor?.id,
      };

      await UpdateArticle(finalData, article.id);

      // Se tem imagem nova selecionada, faz o upload
      if (selectedImage && selectedImage.file) {
        try {
          await uploadThumbnail(
            selectedImage.file,
            selectedImage.description,
            article.id
          );
        } catch (error) {
          console.error("Erro no upload da thumbnail:", error);
        }
      }

      const statusMsg = setToDraft ? "Rascunho" : "Pendente de Revisão";
      toast.success(`Artigo atualizado com sucesso! Status: ${statusMsg}`);
      setTimeout(() => {
        push("/postagens");
      }, 1800);
    } catch (error) {
      console.error("Erro ao atualizar artigo:", error);
      toast.error("Erro ao atualizar artigo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    const formData = getValues();
    await submitArticle(formData, true);
  };

  const handleSendForReview = async () => {
    const formData = getValues();
    await submitArticle(formData, false);
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue("content", content, { shouldValidate: true });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <form className="space-y-6 p-6">
          <div className="flex justify-between items-center -mb-4">
            <ReturnPageButton />
          </div>
          <div className="flex gap-6">
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
            <CustomInput
              id="slug"
              label="Slug"
              {...register("slug")}
              disabled
            />
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col gap-1 w-full">
              <ThumbnailUploader
                onImageUpload={handleImageUpload}
                initialImage={selectedImage?.preview}
              />
              <input type="hidden" {...register("thumbnail")} />
              <input type="hidden" {...register("thumbnailDescription")} />
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
                onChange={(e) => {
                  setValue("reading_time", Number(e.target.value));
                }}
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
              <CustomSelect
                id="creator"
                label="Criador"
                placeholder="Selecione um criador"
                options={creatorOptions}
                value={creator}
                onChange={(value) => setValue("creator", value as string)}
                isMulti={false}
                error={errors.creator?.message}
                noOptionsMessage="Nenhum criador disponível"
              />
            </div>

            <div className="flex gap-6 w-full">
              <CustomSelect
                id="categoryId"
                label="Categoria"
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
            </div>
            <div className="flex gap-6 w-full">
              <CustomSelect
                id="portalIds"
                label="Portal"
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
              Editar conteúdo de texto
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
          {changeStatus === "CHANGES_REQUESTED" ? (
            <div className="w-full">
              <CustomInput
                id="changes_requested"
                label="Mudanças necessárias"
                textareaInput
                className="min-h-32"
                value={changeMessage}
                disabled
              />
              {errors.resume_content && (
                <span className="text-sm text-red-500">
                  {errors.resume_content.message}
                </span>
              )}
            </div>
          ) : null}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={handleSaveAsDraft}
              className="bg-yellow-200 text-[#9c6232] hover:bg-yellow-100 rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Salvar como Rascunho
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
              type="button"
              onClick={handleSendForReview}
              className="bg-blue-500 text-white hover:bg-blue-600 rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Enviar para Revisão"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
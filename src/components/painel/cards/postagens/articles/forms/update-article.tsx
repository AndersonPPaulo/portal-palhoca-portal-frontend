"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useContext, useEffect, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
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
import { generateSlug } from "@/utils/generateSlug";

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


interface FormEditArticleProps {
  article: Article;
}

export default function FormEditArticle({ article }: FormEditArticleProps) {
  const parameter = useParams();
  const { back, push } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState(article.content || "");

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
  const [thumbnailDescription, setThumbnailDescription] = useState("");

  // Estados para controlar se os dados foram carregados
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [portalsLoaded, setPortalsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const findArticle = listArticles?.data?.find(
    (item) => item.id === parameter.id
  );

  useEffect(() => {
    if (
      !findArticle?.status_history ||
      findArticle.status_history.length === 1
    ) {
      return;
    }
    const sortedHistory = [...findArticle.status_history].sort(
      (a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );

    setChangeStatus(sortedHistory[0].status);
    setChangeMessage(sortedHistory[0].change_request_description || "");
  }, []);

  // Carregar dados necessários e garantir que todos carregaram antes de definir valores
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar tags
        if (ListTags) {
          await ListTags();
          setTagsLoaded(true);
        }

        // Carregar categorias
        if (ListCategorys) {
          await ListCategorys();
          setCategoriesLoaded(true);
        }

        // Carregar artigos do autor
        if (ListAuthorArticles) {
          await ListAuthorArticles();
        }

        // Carregar portais
        if (ListPortals) {
          await ListPortals();
          setPortalsLoaded(true);
        }
      } catch (error) {
        toast.error("Erro ao carregar dados necessários");
      }
    };

    loadData();
  }, []);

  // Configurar valores iniciais após todos os dados serem carregados
  useEffect(() => {
    if (!tagsLoaded || !portalsLoaded || !categoriesLoaded) {
      return;
    }

    // Configurar tags
    if (article.tags && article.tags.length > 0 && listTags?.length > 0) {
      const validTagIds = article.tags
        .filter((tag) => listTags.some((listTag) => listTag.id === tag.id))
        .map((tag) => tag.id);

      setValue("tagIds", validTagIds);
    }

    // Configurar portais
    if (
      article.portals &&
      article.portals.length > 0 &&
      listPortals?.length > 0
    ) {
      const validPortalIds = article.portals
        .filter((portal) =>
          listPortals.some((listPortal) => listPortal.id === portal.id)
        )
        .map((portal) => portal.id);

      setValue("portalIds", validPortalIds);
    }

    // Configurar a descrição da thumbnail se existir
    if (article.thumbnail && article.thumbnail.description) {
      setThumbnailDescription(article.thumbnail.description || "");
      setValue("thumbnailDescription", article.thumbnail.description || "");
    }

    // Garantir que o formulário está completamente atualizado
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
      portalIds: article.portals?.map((portal) => portal.id) || [],
      thumbnailDescription: article.thumbnail?.description || "",
    });
  }, [
    article,
    tagsLoaded,
    portalsLoaded,
    categoriesLoaded,
    listTags,
    listPortals,
  ]);

  useEffect(() => {
    if (article.thumbnail) {
      let thumbnailUrl = "";
      let description = "";

      if (typeof article.thumbnail === "string") {
        thumbnailUrl = article.thumbnail;
      } else if (article.thumbnail?.url) {
        thumbnailUrl = article.thumbnail.url;
        description = article.thumbnail.description || "";
      }

      if (thumbnailUrl) {
        setSelectedImage({
          file: null as any,
          preview: thumbnailUrl,
          description: description,
        });

        setThumbnailDescription(description);
        setValue("thumbnailDescription", description);
      }
    }
  }, []);

  const tagOptions: OptionType[] = Array.isArray(listTags)
    ? listTags.map((tag: any) => ({ value: tag.id, label: tag.name }))
    : [];

  const categoryOptions: OptionType[] = Array.isArray(listCategorys)
    ? listCategorys.map((category: any) => ({
        value: category.id,
        label: category.name,
      }))
    : [];

  const portalOptions: OptionType[] = Array.isArray(listPortals)
    ? listPortals.map((portal: any) => ({
        value: portal.id,
        label: portal.name,
      }))
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
    handleSubmit,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  const title = watch("title");
  const tagIds: string[] = watch("tagIds") || [];
  const categoryId: string = watch("categoryId") || "";
  const portalIds: string[] = watch("portalIds") || [];
  const creator: string = watch("creator") || "";
  const watchedThumbnailDescription = watch("thumbnailDescription");

  // Sincronizar o estado local com o valor do formulário
  useEffect(() => {
    if (watchedThumbnailDescription !== undefined) {
      setThumbnailDescription(watchedThumbnailDescription);
    }
  }, []);

  useEffect(() => {
    if (title) {
      setValue("slug", generateSlug(title), { shouldValidate: true });
    }
  }, []);

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
    description?: string
  ) => {
    setSelectedImage({
      file,
      preview: previewUrl,
      description: description ?? "",
    });
    setValue("thumbnailDescription", description ?? "", {
      shouldValidate: true,
    });
    setThumbnailDescription(description ?? "");
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setThumbnailDescription(value);
    setValue("thumbnailDescription", value);

    // Também atualiza no objeto selectedImage se existir
    if (selectedImage) {
      setSelectedImage({
        ...selectedImage,
        description: value,
      });
    }
  };

  const submitArticle = async (data: ArticleFormData, setToDraft: boolean) => {
    try {
      const validatedTags = validateTagSelection(data.tagIds);

      if (validatedTags.length !== data.tagIds.length) {
        setValue("tagIds", validatedTags);
        return;
      }

      setIsSubmitting(true);

      // Garantir que a descrição da thumbnail esteja nos dados
      data.thumbnailDescription = thumbnailDescription;

      const finalData = {
        title: data.title,
        slug: data.slug,
        reading_time: data.reading_time,
        resume_content: data.resume_content,
        content: data.content,
        highlight: data.highlight,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
        portalIds: data.portalIds,
        setToDraft: setToDraft,
        chiefEditorId: profile?.chiefEditor?.id,
        thumbnailDescription: thumbnailDescription,
      };

      // Enviar dados para API
      await UpdateArticle(finalData, article.id);

      // Se tem imagem nova selecionada, faz o upload
      if (selectedImage && selectedImage.file) {
        try {
          await uploadThumbnail(
            selectedImage.file,
            thumbnailDescription,
            article.id
          );
        } catch (error) {
          toast.error("Erro no upload da thumbnail");
        }
      }

      const statusMsg = setToDraft ? "Rascunho" : "Pendente de Revisão";
      toast.success(`Artigo atualizado com sucesso! Status: ${statusMsg}`);

      // Recarregar dados do local listing após submissão
      if (ListAuthorArticles) {
        await ListAuthorArticles();
      }

      setTimeout(() => {
        push("/postagens");
      }, 1000);
    } catch (error) {
      toast.error("Erro ao atualizar artigo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    handleSubmit((data) => submitArticle(data, true))();
  };

  const handleSendForReview = async () => {
    handleSubmit((data) => submitArticle(data, false))();
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
            <div className="flex flex-col  w-full">
              <ThumbnailUploader
                onImageUpload={handleImageUpload}
                initialImage={selectedImage?.preview}
              />

              {/* Campo oculto para o valor do formulário */}
              <input type="hidden" {...register("thumbnail")} />
              <input
                type="hidden"
                {...register("thumbnailDescription")}
                value={thumbnailDescription}
              />
              {/* Campo para a descrição da thumbnail */}
              {thumbnailDescription && (
                <span className="text-gray-700 ">
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
                  onChange={(e) => {
                    setValue("reading_time", Number(e.target.value));
                  }}
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
                onChange={(value) => {
                  setValue("portalIds", value as string[], {
                    shouldValidate: true,
                  });
                }}
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

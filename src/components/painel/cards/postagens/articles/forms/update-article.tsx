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
import { api } from "@/service/api";
import { parseCookies } from "nookies";

const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  creator: z.string().min(1, "Criador é obrigatório"),
  reading_time: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Tempo de leitura é obrigatório")
  ),
  resume_content: z.string(),
  content: z
    .string()
    .min(300, "Conteúdo é obrigatório mínimo de 300 caracteres"),
  thumbnail: z.string(),
  thumbnailDescription: z.string().optional().default(""),
  categoryId: z.string().min(1, "Adicione uma categoria"),
  tagIds: z.array(z.string()).min(1, "Pelo menos uma tag é obrigatória"),
  chiefEditorId: z.string().optional(),
  portalIds: z.array(z.string()).min(1, "Pelo menos um portal é obrigatório"),
  gallery: z.array(z.string()).default([]),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const uploadGalleryImagesToServer = async (
  files: File[]
): Promise<string[]> => {
  const { "user:token": token } = parseCookies();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);

    console.log(
      "📤 Enviando imagem:",
      file.name,
      "Tamanho:",
      file.size,
      "Tipo:",
      file.type
    );

    const config = {
      headers: {
        Authorization: `bearer ${token}`,
        // NÃO definir Content-Type - o navegador define automaticamente com boundary
      },
    };

    try {
      const response = await api.post(
        `/upload/article-image`,
        formData,
        config
      );

      console.log("✅ Resposta do servidor:", response.data);

      if (response.data?.url) {
        uploadedUrls.push(response.data.url);
        console.log("✅ URL adicionada:", response.data.url);
      } else {
        console.error("❌ Resposta não contém url:", response.data);
      }
    } catch (err: unknown) {
      console.error("❌ Erro ao fazer upload da imagem da galeria:", err);
      const errorDetails =
        (err as { response?: { data?: unknown }; message?: string })?.response
          ?.data || (err as { message?: string })?.message;
      console.error("Detalhes:", errorDetails);
    }
  }

  return uploadedUrls;
};

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
  const [galleryImages, setGalleryImages] = useState<
    { file: File | null; preview: string; id: string; isExisting: boolean }[]
  >([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch {
        toast.error("Erro ao carregar dados necessários");
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      article.articlePortals &&
      article.articlePortals.length > 0 &&
      listPortals?.length > 0
    ) {
      const validPortalIds = article.articlePortals
        .filter((portal) =>
          listPortals.some((listPortal) => listPortal.id === portal.portal.id)
        )
        .map((portal) => portal.portal.id);

      setValue("portalIds", validPortalIds);
    }

    // Configurar a descrição da thumbnail se existir
    if (article.thumbnail && article.thumbnail.description) {
      setThumbnailDescription(article.thumbnail.description || "");
      setValue("thumbnailDescription", article.thumbnail.description || "");
    }

    // Configurar galeria de imagens existentes
    if (
      article.gallery &&
      Array.isArray(article.gallery) &&
      article.gallery.length > 0
    ) {
      const existingGalleryImages = article.gallery.map(
        (url: string, index: number) => ({
          file: null,
          preview: url,
          id: `existing-${index}-${Date.now()}`,
          isExisting: true,
        })
      );
      setGalleryImages(existingGalleryImages);
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
      categoryId: article.category?.id,
      tagIds: article.tags?.map((tag) => tag.id) || [],
      chiefEditorId: profile?.chiefEditor?.id,
      portalIds:
        article.articlePortals?.map((portal) => portal.portal.id) || [],
      thumbnailDescription: article.thumbnail?.description || "",
      gallery: article.gallery || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          file: null as any,
          preview: thumbnailUrl,
          description: description,
        });

        setThumbnailDescription(description);
        setValue("thumbnailDescription", description);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagOptions: OptionType[] = Array.isArray(listTags)
    ? listTags.map((tag) => ({ value: tag.id, label: tag.name }))
    : [];

  const categoryOptions: OptionType[] = Array.isArray(listCategorys)
    ? listCategorys.map((category) => ({
        value: category.id,
        label: category.name,
      }))
    : [];

  const portalOptions: OptionType[] = Array.isArray(listPortals)
    ? listPortals.map((portal) => ({
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
  }, [watchedThumbnailDescription]);

  useEffect(() => {
    if (title) {
      setValue("slug", generateSlug(title), { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const lastStatus =
    findArticle?.status_history && findArticle.status_history.length > 0
      ? findArticle.status_history.reduce((latest, item) => {
          return new Date(item.changed_at) > new Date(latest.changed_at)
            ? item
            : latest;
        }, findArticle.status_history[0])
      : undefined;

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

      // 1. PRIMEIRO: Processar galeria de imagens
      const existingUrls = galleryImages
        .filter((img) => img.isExisting)
        .map((img) => img.preview);

      const newFiles = galleryImages
        .filter((img) => !img.isExisting && img.file)
        .map((img) => img.file!);

      let galleryUrls = [...existingUrls];

      // Upload de novas imagens da galeria (se houver)
      if (newFiles.length > 0) {
        try {
          console.log(
            "📸 Iniciando upload de",
            newFiles.length,
            "novas imagens da galeria..."
          );
          const uploadedUrls = await uploadGalleryImagesToServer(newFiles);
          console.log("✅ Upload concluído! URLs:", uploadedUrls);

          if (uploadedUrls.length !== newFiles.length) {
            toast.error(
              `Apenas ${uploadedUrls.length} de ${newFiles.length} novas imagens foram enviadas. O artigo será atualizado com as imagens que foram enviadas com sucesso.`
            );
          }

          galleryUrls = [...galleryUrls, ...uploadedUrls];
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          toast.error(
            `Erro ao fazer upload das imagens da galeria: ${errorMessage}. O artigo será atualizado sem as novas imagens.`
          );
        }
      }

      // 2. AGORA SIM: Atualizar o artigo com as URLs da galeria
      const finalData = {
        title: data.title,
        slug: data.slug,
        reading_time: data.reading_time,
        resume_content: data.resume_content,
        content: data.content,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
        portalIds: data.portalIds,
        setToDraft: setToDraft,
        chiefEditorId: profile?.chiefEditor?.id,
        thumbnailDescription: thumbnailDescription,
        gallery: galleryUrls,
      };

      console.log("🔄 Atualizando artigo com dados:", finalData);

      // Enviar dados para API
      await UpdateArticle(finalData, article.id);

      console.log("✅ Artigo atualizado com sucesso!");

      // Se tem imagem nova selecionada, faz o upload
      if (selectedImage && selectedImage.file) {
        try {
          await uploadThumbnail(
            selectedImage.file,
            thumbnailDescription,
            article.id
          );
        } catch {
          toast.error("Erro no upload da thumbnail");
        }
      }

      if (
        lastStatus?.status === "DRAFT" ||
        lastStatus?.status === "PENDING_REVIEW"
      ) {
        const statusMsg = setToDraft ? "Rascunho" : "Pendente de Revisão";
        toast.success(`Artigo atualizado com sucesso! Status: ${statusMsg}`);
      }

      if (lastStatus?.status === "PUBLISHED") {
        toast.success(`Artigo atualizado com sucesso!`);
      }

      // Recarregar dados do local listing após submissão
      if (ListAuthorArticles) {
        await ListAuthorArticles();
      }

      setTimeout(() => {
        push("/postagens");
      }, 1000);
    } catch {
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

  const resumeContent = watch("resume_content");
  const resumeLength = resumeContent?.length || 0;

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const contentLength = stripHtml(editorContent).length;

  const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const preview = event.target?.result as string;
        const id = `${Date.now()}-${Math.random()}`;
        setGalleryImages((prev) => [
          ...prev,
          { file, preview, id, isExisting: false },
        ]);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveGalleryImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    setGalleryImages((prev) => {
      const draggedIndex = prev.findIndex((img) => img.id === draggedItem);
      const targetIndex = prev.findIndex((img) => img.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newImages = [...prev];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedImage);

      return newImages;
    });

    setDraggedItem(null);
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
                    https://us-east-1.console.aws.amazon.com/console/home?region=us-east-1
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
            <div className="text-sm mt-1 px-6">
              <span
                className={`${
                  resumeLength < 100 ? "text-gray-500" : "text-green-600"
                }`}
              >
                Contador de caracteres: {resumeLength}
              </span>
              {resumeLength < 100 && (
                <span className="text-red-500 ml-2">
                  Mínimo de 100 caracteres necessário
                </span>
              )}
            </div>
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
              <div className="text-sm mt-1 ml-6 text-gray-500">
                Contador de caracteres: {contentLength}
              </div>
              {errors.content && (
                <span className="text-sm text-red-500 ml-6">
                  {errors.content.message}
                </span>
              )}
            </div>
          </div>

          <div className="w-full">
            <h1 className="text-xl font-bold text-primary ml-6 pt-4 mb-4">
              Galeria de Imagens
            </h1>
            <div className="ml-6 mr-6">
              <div className="border-2 border-dashed border-primary-light rounded-[24px] p-6 text-center cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddGalleryImage}
                  className="hidden"
                  id="gallery-input"
                />
                <label htmlFor="gallery-input" className="cursor-pointer block">
                  <div className="text-gray-700 font-medium">
                    Clique para adicionar imagens à galeria
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    SVG, PNG, JPG ou GIF (max. 5MB cada)
                  </div>
                </label>
              </div>

              {galleryImages.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-4">
                    {galleryImages.length} imagem(ns) adicionada(s). Arraste
                    para reordenar.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => handleDragStart(img.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(img.id)}
                        className={`relative group cursor-move rounded-lg overflow-hidden border-2 ${
                          draggedItem === img.id
                            ? "border-blue-500 opacity-50"
                            : "border-gray-200 hover:border-blue-500"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.preview}
                          alt="Gallery"
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(img.id)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                            title="Remover imagem"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
              className={`${
                lastStatus?.status === "PUBLISHED"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } rounded-3xl min-h-[48px] text-[16px] pt-3 px-6`}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Salvando..."
                : lastStatus?.status === "PUBLISHED"
                ? "Atualizar"
                : "Enviar para Revisão"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

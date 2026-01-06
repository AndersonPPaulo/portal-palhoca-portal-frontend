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
import { Plus } from "lucide-react";
import CreateTagModal from "@/components/Modals/CreateTagPost";

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
  content: z.string(),
  initialStatus: z.string().optional(),
  highlight: z.boolean().default(false),
  categoryId: z.string().min(1, "Adicione uma categoria"),
  tagIds: z.array(z.string()).min(1, "Pelo menos uma tag é obrigatória"),
  chiefEditorId: z.string().optional(),
  portalIds: z.array(z.string()).min(1, "Pelo menos um portal é obrigatório"),
  thumbnailDescription: z.string().optional().default(""),
  gallery: z.array(z.string()).default([]),
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
    } catch (err) {
      console.error("❌ Erro ao fazer upload da imagem da galeria:", err);
      console.error("Detalhes:", err?.response?.data || err?.message);
    }
  }

  return uploadedUrls;
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<
    { file: File; preview: string; id: string }[]
  >([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      chiefEditorId: profile?.chiefEditor?.id,
      portalIds: [],
      thumbnailDescription: "",
      gallery: [],
    },
  });

  const title = watch("title");
  const categoryId = watch("categoryId");
  const tagIds = watch("tagIds");
  const portalIds = watch("portalIds");
  const watchedThumbnailDescription = watch("thumbnailDescription");

  // Sincronizar o estado local com o valor do formulário
  useEffect(() => {
    setThumbnailDescription(watchedThumbnailDescription || "");
  }, [watchedThumbnailDescription]);

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

      // 1. PRIMEIRO: Upload das imagens da galeria
      let galleryUrls: string[] = [];
      if (galleryImages.length > 0) {
        try {
          console.log(
            "📸 Iniciando upload de",
            galleryImages.length,
            "imagens da galeria..."
          );
          const galleryFiles = galleryImages.map((img) => img.file);
          galleryUrls = await uploadGalleryImagesToServer(galleryFiles);
          console.log("✅ Upload concluído! URLs:", galleryUrls);

          if (galleryUrls.length !== galleryImages.length) {
            toast.error(
              `Apenas ${galleryUrls.length} de ${galleryImages.length} imagens foram enviadas. Verifique e tente novamente.`
            );
            return;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          toast.error(
            `Erro ao fazer upload das imagens da galeria: ${errorMessage}. O artigo não foi criado.`
          );
          return;
        }
      }

      // 2. AGORA SIM: Criar o artigo com as URLs da galeria
      const formData = {
        ...data,
        thumbnail: "",
        gallery: galleryUrls,
        initialStatus: status,
        chiefEditorId: profile.chiefEditor?.id || "",
        creator: profile.id,
        portals: data.portalIds,
      };

      console.log("🚀 Criando artigo com dados:", formData);

      const createdArticle = await CreateArticle(formData);

      console.log("🔍 Artigo criado:", createdArticle);

      if (!createdArticle?.id) {
        toast.error("Erro ao criar o artigo.");
        return;
      }

      // 3. Upload thumbnail (depois do artigo criado)
      if (selectedImage && selectedImage.file) {
        try {
          await uploadThumbnailToServer(
            selectedImage.file,
            thumbnailDescription,
            createdArticle.id
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          toast.error(
            `Artigo criado, mas houve um erro no upload da imagem: ${errorMessage}`
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
      setGalleryImages([]);
      setTimeout(() => push("/postagens"), 1000);
    } catch {
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

  const resumeContent = watch("resume_content");
  const resumeLength = resumeContent?.length || 0;

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const contentLength = stripHtml(editorContent).length;

  const handleOpenModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const preview = event.target?.result as string;
        const id = `${Date.now()}-${Math.random()}`;
        setGalleryImages((prev) => [...prev, { file, preview, id }]);
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
  // Substitua a função handleTagCreated no seu FormCreateArticle por esta:

  const handleTagCreated = async (newTag: {
    name: string;
    description: string;
    status: boolean;
  }) => {
    try {
      // 1. Atualizar a lista de tags no contexto (SEM redirecionamento)
      await ListTags();

      // 2. Encontrar a nova tag pelo nome (assumindo que o backend retorna a lista atualizada)
      const updatedTags = Array.isArray(listTags) ? listTags : [];
      const createdTag = updatedTags.find((tag) => tag.name === newTag.name);

      // 3. Adicionar a nova tag às tags já selecionadas automaticamente, se encontrada
      if (createdTag) {
        const currentTagIds = watch("tagIds") || [];
        const updatedTagIds = [...currentTagIds, createdTag.id];

        setValue("tagIds", updatedTagIds, {
          shouldValidate: true,
        });

        toast.success(`Tag "${newTag.name}" criada e selecionada com sucesso!`);
      } else {
        toast.error("Não foi possível encontrar a nova tag criada.");
      }
    } catch (error) {
      console.error("Erro ao processar nova tag:", error);
      toast.error(
        "Erro ao atualizar a lista de tags. Tente recarregar a página."
      );
    }
  };
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
                <div className="flex flex-col gap-1 w-full">
                  <label className="px-6" htmlFor="tagIds">
                    Tag(s):
                  </label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <CustomSelect
                        id="tagIds"
                        label=""
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
                    <Button
                      type="button"
                      onClick={handleOpenModal}
                      className="rounded-3xl min-h-[56px] px-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white border-2 border-[#DFEAF6] hover:border-[#DFEAF695] mt-[6px] whitespace-nowrap"
                      title="Adicionar nova tag"
                    >
                      <Plus size={20} />
                      Nova Tag
                    </Button>
                  </div>
                </div>
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
              Adicionar conteudo de texto
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
        {/* Modal de criação de tag */}
        <CreateTagModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleTagCreated}
        />
      </div>
    </div>
  );
}

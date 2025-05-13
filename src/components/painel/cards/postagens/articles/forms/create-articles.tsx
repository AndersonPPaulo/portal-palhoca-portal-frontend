"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/service/api";
import { parseCookies } from "nookies";

// Componentes
import CustomInput from "@/components/input/custom-input";
import CustomSelect, { OptionType } from "@/components/select/custom-select";
import { Button } from "@/components/ui/button";
import Switch from "@/components/switch";
import TiptapEditor from "@/components/editor/tiptapEditor";
import ReturnPageButton from "@/components/button/returnPage";
import ThumbnailUploader from "@/components/thumbnail";

// Contextos
import { ArticleContext } from "@/providers/article";
import { CategorysContext } from "@/providers/categorys";
import { TagContext } from "@/providers/tags";
import { UserContext } from "@/providers/user";
import { PortalContext } from "@/providers/portal";

// Constantes
const ARTICLE_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
};

// Schema de validação
const articleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  reading_time: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Tempo de leitura é obrigatório")
  ),
  resume_content: z
    .string()
    .min(100, "Resumo é obrigatório minimo de 100 caracteres"),
  content: z
    .string()
    .min(300, "Conteudo é obrigatório minimo de 300 caracteres"),
  initialStatus: z.string().optional(),
  highlight: z.boolean().default(false),
  thumbnailDescription: z.string().optional().default(""),
  categoryId: z.string().min(1, "Adicione uma categoria"),
  tagIds: z.array(z.string()).min(1, "Pelo menos uma tag é obrigatória"),
  chiefEditorId: z.string().optional(),
  portalIds: z.array(z.string()).min(1, "Pelo menos um portal é obrigatório"),
});

type ArticleFormData = z.infer<typeof articleSchema>;

// Utilidades
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

// Função para fazer upload da thumbnail
const uploadThumbnailToServer = async (
  file: File,
  description: string,
  articleId: string
): Promise<string> => {
  const { "user:token": token } = parseCookies();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("thumbnail", file);

  try {
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    console.log(`Enviando thumbnail para o artigo ID: ${articleId}`);
    const response = await api.post(
      `/upload-thumbnail/${articleId}`,
      formData,
      config
    );
    console.log("Upload concluído com sucesso:", response.data);

    return response.data.thumbnailUrl || "";
  } catch (error: any) {
    console.error("Erro no upload de thumbnail:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao fazer upload da imagem"
    );
  }
};

export default function FormCreateArticle() {
  const { push, back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  // Contextos
  const { CreateArticle, ListAuthorArticles } = useContext(ArticleContext);
  const { ListCategorys, listCategorys } = useContext(CategorysContext);
  const { ListTags, listTags } = useContext(TagContext);
  const { profile } = useContext(UserContext);
  const { ListPortals, listPortals } = useContext(PortalContext);

  // Definição do tipo da imagem
  type SelectedImageType = {
    file: File;
    preview: string;
    description: string;
  } | null;

  const [selectedImage, setSelectedImage] = useState<SelectedImageType>(null);

  // Hooks para carregar dados
  const loadTags = useCallback(() => {
    if (typeof ListTags === "function") {
      return ListTags();
    }
    return Promise.resolve([]);
  }, []);

  const loadCategories = useCallback(() => {
    if (typeof ListCategorys === "function") {
      return ListCategorys();
    }
    return Promise.resolve([]);
  }, []);

  const loadArticles = useCallback(() => {
    if (typeof ListAuthorArticles === "function") {
      return ListAuthorArticles();
    }
    return Promise.resolve([]);
  }, []);

  const loadPortals = useCallback(() => {
    if (typeof ListPortals === "function") {
      return ListPortals();
    }
    return Promise.resolve([]);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [];

        if (typeof ListTags === "function") promises.push(loadTags());
        if (typeof ListCategorys === "function")
          promises.push(loadCategories());
        if (typeof ListAuthorArticles === "function")
          promises.push(loadArticles());
        if (typeof ListPortals === "function") promises.push(loadPortals());

        await Promise.all(promises);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados iniciais.");
      }
    };

    loadData();
  }, [loadTags, loadCategories, loadArticles, loadPortals]);

  // Preparar opções para selects
  const tagOptions: OptionType[] = Array.isArray(listTags)
    ? listTags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      }))
    : [];

  const portalOptions: OptionType[] = Array.isArray(listPortals)
    ? listPortals.map((portal) => ({
        value: portal.id,
        label: portal.name,
      }))
    : [];

  const categoryOptions: OptionType[] = Array.isArray(listCategorys)
    ? listCategorys.map((category) => ({
        value: category.id,
        label: category.name,
      }))
    : [];

  // Configuração do formulário
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
      thumbnailDescription: "",
      resume_content: "",
      content: "",
      initialStatus: "",
      highlight: false,
      categoryId: "",
      tagIds: [],
      chiefEditorId: profile?.chiefEditor?.id || "",
      portalIds: [],
    },
  });

  const title = watch("title");
  const highlight = watch("highlight");
  const categoryId = watch("categoryId");
  const tagIds = watch("tagIds");
  const portalIds = watch("portalIds");

  // Gerar slug automático baseado no título
  useEffect(() => {
    if (title) {
      setValue("slug", generateSlug(title), { shouldValidate: true });
    }
  }, [title, setValue]);

  // Atualizar o conteúdo do editor
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue("content", content, { shouldValidate: true });
  };

  // Manipular upload de imagem
  const handleImageUpload = (
    file: File,
    previewUrl: string,
    description: string
  ) => {
    // Atualiza o estado do componente com a imagem selecionada
    setSelectedImage({
      file,
      preview: previewUrl,
      description,
    });

    // Importante: Atualizar o campo thumbnailDescription no formulário
    setValue("thumbnailDescription", description, { shouldValidate: true });
  };

  // Função unificada para enviar o formulário com status específico
  const submitWithStatus = async (data: ArticleFormData, status: string) => {
    try {
      setIsSubmitting(true);

      // Verificar se o perfil está carregado
      if (!profile?.id) {
        toast.error(
          "Seu perfil não está completamente carregado. Recarregue a página."
        );
        return;
      }

      // Preparar os dados do formulário para envio
      const formData = {
        ...data,
        initialStatus: status,
        chiefEditorId: profile.chiefEditor?.id || "",
        creator: profile.id,
      };

      // Log para verificação dos dados antes de enviar
      console.log("Enviando dados do artigo:", formData);

      // Criar o artigo PRIMEIRO (sem a thumbnail)
      const createdArticle = await CreateArticle(formData);
      console.log("Artigo criado com sucesso:", createdArticle);

      // DEPOIS, se tiver imagem selecionada, fazer upload usando o ID do artigo
      if (selectedImage && selectedImage.file && createdArticle?.id) {
        try {
          console.log(
            "Iniciando upload da thumbnail para o artigo:",
            createdArticle.id
          );

          // Faz o upload da thumbnail com o ID do artigo recém-criado
          const thumbnailUrl = await uploadThumbnailToServer(
            selectedImage.file,
            selectedImage.description,
            createdArticle.id
          );

          console.log("Upload da thumbnail concluído:", thumbnailUrl);
        } catch (error: any) {
          console.error("Erro no upload da thumbnail:", error);
          // Não falha o processo se o upload da imagem falhar
          toast.error(
            `Artigo criado, mas houve um erro no upload da imagem: ${
              error.message || error
            }`
          );
        }
      }

      // Mensagem de sucesso baseada no status
      const successMessage =
        status === ARTICLE_STATUS.DRAFT
          ? "Rascunho salvo com sucesso!"
          : "Artigo enviado para revisão com sucesso!";

      toast.success(successMessage);

      // Resetar formulário e imagem
      reset();
      setSelectedImage(null);
      setEditorContent("");

      // Redirecionar após um curto delay
      setTimeout(() => {
        push("/postagens");
      }, 1800);
    } catch (error: any) {
      console.error(
        `Erro ao criar ${
          status === ARTICLE_STATUS.DRAFT ? "rascunho" : "artigo"
        }:`,
        error
      );
      toast.error(
        `Erro ao ${
          status === ARTICLE_STATUS.DRAFT ? "salvar rascunho" : "criar artigo"
        }. Tente novamente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers específicos para cada tipo de submissão
  const onSubmit = (data: ArticleFormData) =>
    submitWithStatus(data, ARTICLE_STATUS.PENDING_REVIEW);

  const handleDraftStatus = (data: ArticleFormData) =>
    submitWithStatus(data, ARTICLE_STATUS.DRAFT);

  // Loader enquanto o perfil não está carregado
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Header com botão de retorno e destaque */}
          <div className="flex justify-between items-center -mb-4">
            <ReturnPageButton />

            <div className="flex items-center justify-end gap-6 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <label htmlFor="highlight" className="text-gray-40">
                  Destaque
                </label>
                <Switch
                  value={highlight}
                  onChange={(checked) =>
                    setValue("highlight", checked, { shouldValidate: true })
                  }
                />
              </div>
            </div>
          </div>

          {/* Título e Slug */}
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

          {/* Thumbnail, Tags e Tempo de leitura */}
          <div className="flex gap-6">
            <div className="flex flex-col gap-1 w-full">
              <ThumbnailUploader
                onImageUpload={(file, previewUrl, description) =>
                  handleImageUpload(file, previewUrl, description)
                }
                initialImage={selectedImage?.preview}
              />

              {/* Campo oculto para a descrição da thumbnail */}
              <input type="hidden" {...register("thumbnailDescription")} />
            </div>

            {/* Tags - Usando o CustomSelect */}
            <div className="basis-1/2">
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

            {/* Tempo de leitura */}
            <div className="basis-1/2 gap-1 flex flex-col">
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

          {/* Criador, Categoria e Portal */}
          <div className="flex gap-6">
            {/* Criador */}
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

            {/* Categoria - Usando o CustomSelect */}
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

            {/* Portais - Usando o CustomSelect */}
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

          {/* Resumo */}
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

          {/* Editor de conteúdo */}
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

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={handleSubmit(handleDraftStatus)}
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

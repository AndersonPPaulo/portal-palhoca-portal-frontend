"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import CustomInput from "@/components/input/custom-input";
import { Button } from "@/components/ui/button";
import Switch from "@/components/switch";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/editor/tiptapEditor";
import ReturnPageButton from "@/components/button/returnPage";
import { ArticleContext, ResponsePromise } from "@/providers/article";

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
  status: z.boolean().default(true),
  highlight: z.boolean().default(false),
  thumbnail: z.string(),
  categoryId: z.string().min(1, "Adicione uma categoria"),
  tagIds: z.array(z.string()).min(1, "Pelo menos uma tag é obrigatória"),
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
  article: ResponsePromise;
}
export default function FormEditArticle({ article }: FormEditArticleProps) {
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { UpdateArticle } = useContext(ArticleContext);

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
      title: article.title,
      slug: article.slug,
      creator: article.creator,
      reading_time: Number(article.reading_time),
      thumbnail: article.thumbnail,
      resume_content: article.resume_content,
      content: article.content,
      status: article.status as boolean,
      highlight: article.highlight as boolean,
      categoryId: article.category.id,
      tagIds: article.tags.map((tag) => tag.id),
    },
  });

  useEffect(() => {
    reset({
      title: article.title,
      slug: article.slug,
      creator: article.creator,
      reading_time: Number(article.reading_time),
      thumbnail: article.thumbnail,
      resume_content: article.resume_content,
      content: article.content,
      status: article.status as boolean,
      highlight: article.highlight as boolean,
      categoryId: article.category.id,
      tagIds: article.tags.map((tag) => tag.id),
    });
  }, [article, reset]);

  const title = watch("title");
  const status = watch("status");
  const highlight = watch("highlight");

  useEffect(() => {
    if (title) {
      setValue("slug", generateSlug(title), { shouldValidate: true });
    }
  }, [title, setValue]);

  const onSubmit = async (data: ArticleFormData) => {
    try {
      setIsSubmitting(true);
      const finalData = {
        ...data,
        thumbnail: data.thumbnail || article.thumbnail,
      };

      await UpdateArticle(finalData, article.id);
    } catch (error) {
      console.error("Erro ao salvar artigo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("thumbnail", file);

      try {
        const response = await fetch("http://localhost:5555/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro no upload da imagem");
        }

        const data = await response.json();
        const imageUrl = data.url;

        setValue("thumbnail", imageUrl, { shouldValidate: true });
      } catch (error) {
        alert(`Erro no upload da imagem: ${error}`);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[24px]">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="flex justify-between items-center -mb-4">
            <ReturnPageButton />

            <div className="flex items-center justify-end gap-6 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <label htmlFor="status" className="text-gray-40">
                  {status ? "Ativo" : "Inativado"}
                </label>
                <Switch
                  value={status}
                  onChange={(checked) =>
                    setValue("status", checked, { shouldValidate: true })
                  }
                />
              </div>

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
              <label className="ml-6">Adicionar Nova Thumbnail (capa)</label>
              <div className="border h-full border-blue-500/30 rounded-[34px] flex items-center justify-center max-h-[54px]">
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  className="w-full text-gray-30 py-2 px-8 rounded-md bg-transparent"
                  onChange={handleThumbnailChange}
                />
              </div>
              {errors.thumbnail && (
                <span className="text-sm text-red-500 w-full">
                  {errors.thumbnail.message}
                </span>
              )}
            </div>

            <div className="basis-1/2">
              <CustomInput
                id="creator"
                label="Criador"
                {...register("creator")}
                placeholder="Nome do criador"
              />
              {errors.creator && (
                <span className="text-sm text-red-500 w-full">
                  {errors.creator.message}
                </span>
              )}
            </div>
            <div className="basis-1/4">
              <CustomInput
                id="reading_time"
                label="Tempo de leitura (min)"
                type="number"
                {...register("reading_time", {
                  setValueAs: (value: string) => Number(value) || undefined,
                })}
                onChange={(e) => {
                  Number(e.target.value);
                }}
              />
              {errors.reading_time && (
                <span className="text-sm text-red-500">
                  {errors.reading_time.message}
                </span>
              )}
            </div>
          </div>

          <CustomInput
            id="resume_content"
            label="Resumo"
            textareaInput
            {...register("resume_content")}
            placeholder="Digite o resumo"
          />
          <TiptapEditor
            value={watch("content") || ""}
            onChange={(content) =>
              setValue("content", content, { shouldValidate: true })
            }
          />

          <div className="flex gap-6">
            <CustomInput
              id="tagIds"
              label="Tags"
              {...register("tagIds")}
              placeholder="Separe as tags por vírgula"
            />
            <CustomInput
              id="categoryId"
              label="Categoria"
              {...register("categoryId")}
              placeholder="Digite a categoria"
            />
          </div>

          <div className="flex justify-end gap-4">
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
              className="rounded-3xl min-h-[48px]"
              disabled={isSubmitting}
            >
              {!isSubmitting ? "Salvar Alterações" : "Salvando..."}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
import { ArticleContext } from "@/providers/article";
import { CategorysContext } from "@/providers/categorys";
import {
  Select as CustomSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactSelect from "react-select";
import { MultiValue } from "react-select";

import { TagContext } from "@/providers/tags";

const articleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  creator: z.string().min(1, "Criador é obrigatório"),
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

type OptionType = { value: string; label: string };

interface TagOption {
  value: string;
  label: string;
}

export default function FormCreateArticle() {
  const { back } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { CreateArticle } = useContext(ArticleContext);
  const { ListCategorys, listCategorys } = useContext(CategorysContext);
  const { ListTags, listTags } = useContext(TagContext);

  useEffect(() => {
    Promise.all([ListTags(), ListCategorys()]);
  }, []);

  const tagOptions: OptionType[] = listTags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

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
      creator: "",
      reading_time: 0,
      thumbnail: "",
      resume_content: "",
      content: "",
      status: true,
      highlight: false,
      categoryId: "",
      tagIds: [],
    },
  });

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
      await CreateArticle(data);

      reset();
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

        setValue("thumbnail", imageUrl);
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
              <label className="ml-6">Adicionar Thumbnail (capa)</label>
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

          <div className="flex gap-6">
            <div className="flex flex-col gap-1 w-full">
              <label className="px-6" htmlFor="tagIds">
                Tag(s):
              </label>
              <ReactSelect
                id="tagIds"
                isMulti
                className="basic-multi-select w-full"
                classNamePrefix="select"
                value={tagOptions.filter((tag) =>
                  watch("tagIds").includes(tag.value)
                )}
                onChange={(selectedOptions: MultiValue<TagOption>) => {
                  setValue(
                    "tagIds",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                  );
                }}
                options={tagOptions}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "24px",
                    padding: "0rem 24px",
                    minHeight: "56px",
                    marginTop: "6px",
                    borderWidth: "2px",
                    borderColor: "#DFEAF6",
                    "&:hover": {
                      borderColor: "#DFEAF695",
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#3b82f6",
                    padding: "0.25rem 0.5rem",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "white",
                    ":hover": {
                      backgroundColor: "#2563eb",
                      color: "white",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: "24px",
                  }),
                  menuList: (base) => ({
                    ...base,
                    borderRadius: "20px",
                  }),
                }}
              />
              {errors.tagIds && (
                <p className="text-red-500">{errors.tagIds.message}</p>
              )}
            </div>

            <div className="flex gap-6 w-full ">
              <div className="w-full">
                <label
                  htmlFor="categoryId"
                  className="block px-6 font-medium text-black"
                >
                  Categoria
                </label>
                <CustomSelect
                  onValueChange={(value) => setValue("categoryId", value)}
                  defaultValue=""
                >
                  <SelectTrigger className="w-full rounded-[24px] px-6 py-4 mt-2 min-h-14 border-2 border-primary-light outline-none focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-2xl ">
                    <SelectItem value="#" disabled>
                      Selecione uma categoria
                    </SelectItem>
                    {listCategorys.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="hover:bg-blue-500 hover:text-white"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </CustomSelect>
                {errors.categoryId && (
                  <span className="text-sm text-red-500">
                    {errors.categoryId.message}
                  </span>
                )}
              </div>
            </div>
            {errors.categoryId && (
              <span className="text-sm text-red-500">
                {errors.categoryId.message}
              </span>
            )}
          </div>

          <CustomInput
            id="resume_content"
            label="Resumo"
            textareaInput
            {...register("resume_content")}
            placeholder="Digite o resumo"
          />
          {errors.resume_content && (
            <span className="text-sm text-red-500">
              {errors.resume_content.message}
            </span>
          )}

          <h1 className="text-xl font-bold text-primary ml-6 pt-4">
            Adicionar conteudo de texto
          </h1>
          <TiptapEditor
            value={watch("content") || ""}
            onChange={(content: string) =>
              setValue("content", content, { shouldValidate: true })
            }
          />
          {errors.content && (
            <span className="text-sm text-red-500">
              {errors.content.message}
            </span>
          )}

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
              className="rounded-3xl min-h-[48px] text-[16px] pt-3 px-6"
              disabled={isSubmitting}
            >
              Criar Artigo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

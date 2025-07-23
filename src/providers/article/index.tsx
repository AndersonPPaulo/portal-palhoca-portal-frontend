"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: string;
  slug?: string;
  chiefEditorId?: string;
  highlight?: boolean;
  highlightPosition?: number;
  highlightSlot?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  portalReferer?: string;
  category_name?: string;
  title?: string;
}

export interface ArticleProps {
  title: string;
  slug: string;
  creator: string;
  reading_time: number;
  resume_content: string;
  content: string;
  initialStatus: string;
  highlight: boolean;
  highlight_position?: number;
  categoryId: string;
  tagIds: string[];
  chiefEditorId: string;
  portals: string[];
}

interface UpdateArticleProps {
  title?: string;
  slug?: string;
  creator?: string;
  reading_time?: number;
  resume_content?: string;
  content?: string;
  highlight?: boolean;
  highlight_position?: number;
  categoryId?: string;
  tagIds?: string[];
  portalIds?: string[];
  setToDraft?: boolean;
  chiefEditorId?: string;
}

interface UpdateArticleHighlightProps {
  highlight: boolean;
  highlight_position?: number;
  portalIds?: string[];
  chiefEditorId?: string;
}

interface UpdateArticleStatusProps {
  newStatus: "PUBLISHED" | "REJECTED" | "CHANGES_REQUESTED" | "DRAFT";
  reason_reject?: string;
  change_request_description?: string;
  chiefEditorId?: string;
}

// Interfaces para resposta completa da API
export interface ArticleResponse {
  message: string;
  data: Article[];
  meta: Meta;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  reading_time: number;
  thumbnail: Thumbnail | null;
  resume_content: string;
  content: string;
  clicks_view: string;
  highlight: boolean;
  highlight_position?: number | null;
  created_at: string;
  updated_at: string;
  creator: User;
  chiefEditor: User | null;
  category: Category;
  tags: Tag[];
  status_history: StatusHistory[];
  status: string;
  portals: Portal[];
}

export interface Thumbnail {
  id: string;
  url: string;
  key: string;
  description: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portal {
  id: string;
  name: string;
  link_referer: string;
}

export interface StatusHistory {
  id: string;
  status:
    | "CHANGES_REQUESTED"
    | "PENDING_REVIEW"
    | "PUBLISHED"
    | "DRAFT"
    | "REJECTED";
  change_request_description: string | null;
  reason_reject: string | null;
  changed_at: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface IArticleData {
  CreateArticle(data: ArticleProps): Promise<Article>;
  SelfArticle(articleId: string): Promise<Article>;
  article: Article | null;
  ListAuthorArticles(
    creatorId?: string,
    params?: ArticleListParams
  ): Promise<ArticleResponse>;
  listArticles: ArticleResponse | null;
  UpdateArticle(data: UpdateArticleProps, articleId: string): Promise<void>;
  DeleteArticle(articleId: string): Promise<void>;
  uploadThumbnail(
    file: File,
    description: string,
    articleId: string
  ): Promise<string>;
  GetPublishedArticles(page?: number, limit?: number): Promise<ArticleResponse>;
  publishedArticles: ArticleResponse | null;
  UpdateArticleHighlight(
    data: UpdateArticleHighlightProps,
    articleId: string
  ): Promise<void>;
  UpdateArticleStatus(
    data: UpdateArticleStatusProps,
    articleId: string
  ): Promise<Article>;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const ArticleContext = createContext<IArticleData>({} as IArticleData);

export const ArticleProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [listArticles, setListArticles] = useState<ArticleResponse | null>(
    null
  );
  const [publishedArticles, setPublishedArticles] =
    useState<ArticleResponse | null>(null);

  const CreateArticle = async (data: ArticleProps): Promise<Article> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
      },
    };
    const response = await api
      .post("/article", data, config)
      .then((res) => {
        toast.success(`Artigo criado com sucesso!`);
        setTimeout(() => {
          back();
        }, 1800);
        return res.data.article;
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const SelfArticle = async (articleId: string): Promise<Article> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get(`/article/${articleId}`, config)
      .then((res) => {
        setArticle(res.data.response);
        return res.data.response;
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        throw err;
      });

    return response;
  };

  const ListAuthorArticles = async (
    creatorId?: string,
    params: ArticleListParams = {}
  ): Promise<ArticleResponse> => {
    const { "user:token": token } = parseCookies();
    // Monta os parâmetros dinâmicos com todos os filtros definidos
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        ...params,
        highlight:
          params.highlight !== undefined ? String(params.highlight) : undefined,
        startDate:
          params.startDate instanceof Date
            ? params.startDate.toISOString()
            : params.startDate,
        endDate:
          params.endDate instanceof Date
            ? params.endDate.toISOString()
            : params.endDate,
      },
    };

    let url = "/article-author";
    if (creatorId) {
      url = `${url}/${creatorId}`;
    }

    try {
      const response = await api.get(url, config);
      setListArticles(response.data);
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao listar artigos");
      throw err;
    }
  };

  const DeleteArticle = async (articleId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { articleId },
    };

    try {
      await api.delete("/article", config);
      toast.success("Artigo deletado com sucesso!");
    } catch (err: any) {
      toast.error(err.response.data.message);
      throw err;
    }
  };

  // Função geral para atualizar dados do artigo (rota /article)
  const UpdateArticle = async (
    data: UpdateArticleProps,
    articleId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { articleId },
    };

    try {
      const response = await api.patch("/article", data, config);
      toast.success("Artigo atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar artigo");
      throw err;
    }
  };

  // Função específica para atualizar APENAS highlight e highlight_position (rota /article)
  const UpdateArticleHighlight = async (
    data: UpdateArticleHighlightProps,
    articleId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { articleId },
    };

    // Preparar dados apenas para highlight
    const highlightData = {
      highlight: data.highlight,
      ...(data.highlight &&
        data.highlight_position && {
          highlight_position: data.highlight_position,
        }),
      ...(data.portalIds && { portalIds: data.portalIds }),
      ...(data.chiefEditorId && { chiefEditorId: data.chiefEditorId }),
    };

    try {
      const response = await api.patch("/article", highlightData, config);
      console.log('response', response);
      toast.success("Destaque atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao atualizar destaque");
      throw err;
    }
  };

  // Função específica para atualizar APENAS o status (rota /article-status-review/:articleId)
  const UpdateArticleStatus = async (
    data: UpdateArticleStatusProps,
    articleId: string
  ): Promise<Article> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    // Preparar dados para status
    const statusData = {
      newStatus: data.newStatus,
      ...(data.reason_reject && { reason_reject: data.reason_reject }),
      ...(data.change_request_description && {
        change_request_description: data.change_request_description,
      }),
    };

    try {
      const response = await api.patch(
        `/article-status-review/${articleId}`,
        statusData,
        config
      );

      // Extrair dados completos da resposta conforme formato do backend
      let updatedArticle: Article;

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        updatedArticle = response.data.data[0];
      } else {
        updatedArticle = response.data;
      }

      // Atualizar a lista de artigos no contexto
      if (listArticles) {
        const updatedArticles = listArticles.data.map((article) =>
          article.id === articleId ? updatedArticle : article
        );
        setListArticles({
          ...listArticles,
          data: updatedArticles,
        });
      }

      // Se o artigo individual estiver carregado, atualizá-lo também
      if (article && article.id === articleId) {
        setArticle(updatedArticle);
      }

      return updatedArticle;
    } catch (err: any) {
      const errorMessages = {
        PUBLISHED: "Erro ao publicar artigo",
        REJECTED: "Erro ao rejeitar artigo",
        CHANGES_REQUESTED: "Erro ao solicitar alterações",
        DRAFT: "Erro ao retornar artigo para rascunho",
      };

      toast.error(err.response?.data?.message || errorMessages[data.newStatus]);
      throw err;
    }
  };

  const uploadThumbnail = async (
    file: File,
    description: string,
    articleId: string
  ): Promise<string> => {
    const { "user:token": token } = parseCookies();
    const formData = new FormData();
    formData.append("thumbnail", file);
    formData.append("description", description);

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
      return response.data.url;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao fazer upload da imagem"
      );
      throw err;
    }
  };

  const GetPublishedArticles = async (
    page: number,
    limit: number
  ): Promise<ArticleResponse> => {
    try {
      const response = await api.get("/article-published", {
        params: { page, limit },
      });
      setPublishedArticles(response.data);
      return response.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erro ao listar artigos publicados"
      );
      throw err;
    }
  };

  return (
    <ArticleContext.Provider
      value={{
        CreateArticle,
        article,
        SelfArticle,
        listArticles,
        ListAuthorArticles,
        DeleteArticle,
        UpdateArticle,
        uploadThumbnail,
        GetPublishedArticles,
        publishedArticles,
        UpdateArticleHighlight,
        UpdateArticleStatus,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

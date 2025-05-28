"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

export interface ArticleProps {
  title: string;
  slug: string;
  creator: string;
  reading_time: number;
  resume_content: string;
  content: string;
  initialStatus: string;
  highlight: boolean;
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
  status?: boolean;
  highlight?: boolean;
  categoryId?: string;
  tagIds?: string[];
  portalIds: string[];
}

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
  thumbnail: { id: string; url: string; key: string; description: string };
  resume_content: string;
  content: string;
  clicks_view: string;
  highlight: boolean;
  created_at: string;
  updated_at: string;
  creator: User;
  chiefEditor: User;
  category: Category;
  tags: Tag[];
  status_history: StatusHistory[];
  status: string;
  portals: Portal[];
}

export interface User {
  id: string;
  name: string;
  email: string;
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
  change_request_description: string;
  reason_reject: string;
  changed_at: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: string;
  chiefEditorId?: string;
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
    const { page = 1, limit = 10, status, chiefEditorId } = params;
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { page, limit, status, chiefEditorId },
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
      toast.error(err.response.data.message);
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
    page = 1,
    limit = 10
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
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

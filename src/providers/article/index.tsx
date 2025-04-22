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
  status: boolean;
  highlight: boolean;
  thumbnail: string;
  categoryId: string;
  tagIds: string[];
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
  thumbnail?: string;
  categoryId?: string;
  tagIds?: string[];
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
  thumbnail: string;
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

export interface StatusHistory {
  id: string;
  status: "CHANGES_REQUESTED" | "PENDING_REVIEW" | "PUBLISHED" | "DRAFT";
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
  ListArticles(creatorId: string): Promise<ArticleResponse>;
  listArticles: ArticleResponse | null;
  UpdateArticle(data: UpdateArticleProps, articleId: string): Promise<void>;
  DeleteArticle(articleId: string): Promise<void>;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const ArticleContext = createContext<IArticleData>({} as IArticleData);

export const ArticleProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();

  const CreateArticle = async (data: ArticleProps): Promise<Article> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
      },
    };
    const response = await api
      .post("/article", data, config)
      .then(() => {
        toast.success(`Artigo criado com sucesso!`);
        setTimeout(() => {
          back();
        }, 1800);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const [article, setArticle] = useState<Article | null>(null);
  const SelfArticle = async (articleId: string): Promise<Article> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get(`/article/${articleId}`, config)
      .then((res) => {
        setArticle(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const [listArticles, setListArticles] = useState<ArticleResponse | null>(
    null
  );
  const ListArticles = async (creatorId: string): Promise<ArticleResponse> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get(`/article-author/${creatorId}`, config)
      .then((res) => {
        setListArticles(res.data);
      })
      .catch((err) => {
        toast.error(err.response);
        return err;
      });

    return response;
  };

  const DeleteArticle = async (articleId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { articleId },
    };
    const response = await api
      .delete("/article", config)
      .then(() => {
        toast.success("Artigo deletado com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
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
    const response = await api
      .patch("/article", data, config)
      .then(() => {
        toast.success("Artigo atualizado com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  return (
    <ArticleContext.Provider
      value={{
        CreateArticle,
        article,
        SelfArticle,
        listArticles,
        ListArticles,
        DeleteArticle,
        UpdateArticle,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

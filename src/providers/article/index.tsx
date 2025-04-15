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

export type ResponsePromise = {
  id: string;
  title: string;
  slug: string;
  creator: string;
  reading_time: number;
  resume_content: string;
  content: string;
  status: boolean;
  highlight: boolean;
  thumbnail: string;
  clicks_view: number;
  category: {
    id: string;
    name: string;
    description: string;
    status: boolean;
    created_at: Date;
    update_at: Date;
  };
  tags: {
    id: string;
    name: string;
    description: string;
    status: boolean;
    created_at: Date;
    update_at: Date;
  }[];
  created_at: Date;
  update_at: Date;
};

interface IArticleData {
  CreateArticle(data: ArticleProps): Promise<ResponsePromise>;
  SelfArticle(articleId: string): Promise<ResponsePromise>;
  article: ResponsePromise | null;
  ListArticles(): Promise<ResponsePromise[]>;
  listArticles: ResponsePromise[];
  UpdateArticle(data: UpdateArticleProps, articleId: string): Promise<void>;
  DeleteArticle(articleId: string): Promise<void>;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const ArticleContext = createContext<IArticleData>({} as IArticleData);

export const ArticleProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();

  const CreateArticle = async (
    data: ArticleProps
  ): Promise<ResponsePromise> => {
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

  const [article, setArticle] = useState<ResponsePromise | null>(null);
  const SelfArticle = async (articleId: string): Promise<ResponsePromise> => {
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

  const [listArticles, setListArticles] = useState<ResponsePromise[]>([]);
  const ListArticles = async (): Promise<ResponsePromise[]> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get("/article", config)
      .then((res) => {
        setListArticles(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
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

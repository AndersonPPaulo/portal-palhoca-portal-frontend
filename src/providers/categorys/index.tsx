"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

interface CategorysProps {
  name: string;
  description: string;
  status: boolean;
}

interface UpdateCategorysProps {
  name?: string;
  description?: string;
  status?: boolean;
}

type ResponsePromise = {
  name: string;
  description: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
  id: string;
};

interface ICategoryData {
  CreateCategory(data: CategorysProps): Promise<ResponsePromise>;
  ListCategorys(): Promise<ResponsePromise[]>;
  listCategorys: ResponsePromise[];
  DeleteCategory(categoryId: string): Promise<void>;
  UpdateCategory(data: UpdateCategorysProps, categoryId: string): Promise<void>;
  SelfCategory(categoryId: string): Promise<ResponsePromise>;
  category: ResponsePromise | null;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const CategorysContext = createContext<ICategoryData>(
  {} as ICategoryData
);

export const CategorysProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();

  const CreateCategory = async (
    data: CategorysProps
  ): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .post("/category", data, config)
      .then(() => {
        toast.success(`Categoria adicionada com sucesso!`);
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

  const [listCategorys, setListCategorys] = useState<ResponsePromise[]>([]);
  const ListCategorys = async (): Promise<ResponsePromise[]> => {
    const response = await api
      .get("/category")
      .then((res) => {
        setListCategorys(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const DeleteCategory = async (categoryId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { categoryId },
    };
    const response = await api
      .delete("/category", config)
      .then(() => {
        toast.success("Categoria deletada com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const UpdateCategory = async (
    data: UpdateCategorysProps,
    categoryId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { categoryId },
    };
    const response = await api
      .patch("/category", data, config)
      .then(() => {
        toast.success("Categoria atualizada com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const [category, setCategory] = useState<ResponsePromise | null>(null);
  const SelfCategory = async (categoryId: string): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .get(`/category/${categoryId}`, config)
      .then((res) => {
        setCategory(res.data.response);
        console.log("res.data.response", res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  return (
    <CategorysContext.Provider
      value={{
        CreateCategory,
        ListCategorys,
        DeleteCategory,
        UpdateCategory,
        listCategorys,
        SelfCategory,
        category,
      }}
    >
      {children}
    </CategorysContext.Provider>
  );
};

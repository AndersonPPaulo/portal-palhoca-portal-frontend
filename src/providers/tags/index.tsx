"use client";

import { api } from "@/service/api";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
import { toast } from "sonner";

interface TagProps {
  name: string;
  description: string;
  status: boolean;
}

interface UpdateTagProps {
  name?: string;
  description?: string;
  status?: boolean;
}

export type ResponsePromise = {
  name: string;
  description: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
  id: string;
};

interface ITagData {
  CreateTag(data: TagProps, back_route?: boolean): Promise<ResponsePromise>;
  ListTags(): Promise<ResponsePromise[]>;
  listTags: ResponsePromise[];
  DeleteTag(tagId: string): Promise<void>;
  UpdateTag(data: UpdateTagProps, tagId: string): Promise<void>;
  SelfTag(tagId: string): Promise<ResponsePromise>;
  tag: ResponsePromise | null;
}

interface ICihldrenReact {
  children: ReactNode;
}

export const TagContext = createContext<ITagData>({} as ITagData);

export const TagProvider = ({ children }: ICihldrenReact) => {
  const { back } = useRouter();

  const CreateTag = async (
    data: TagProps,
    back_route: boolean = true
  ): Promise<ResponsePromise> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };
    const response = await api
      .post("/tag", data, config)
      .then(() => {
        toast.success(`Tag adicionada com sucesso!`);
        setTimeout(() => {
          if (back_route) back();
        }, 1800);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const [listTags, setListTags] = useState<ResponsePromise[]>([]);
  const ListTags = async (): Promise<ResponsePromise[]> => {
    const response = await api
      .get("/tag")
      .then((res) => {
        setListTags(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const DeleteTag = async (tagId: string): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { tagId },
    };
    const response = await api
      .delete("/tag", config)
      .then(() => {
        toast.success("Tag deletada com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const UpdateTag = async (
    data: UpdateTagProps,
    tagId: string
  ): Promise<void> => {
    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
      params: { tagId },
    };
    const response = await api
      .patch("/tag", data, config)
      .then(() => {
        toast.success("Tag atualizada com sucesso!");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  const [tag, setTag] = useState<ResponsePromise | null>(null);
  const SelfTag = async (tagId: string): Promise<ResponsePromise> => {
    const response = await api
      .get(`/tag/${tagId}`)
      .then((res) => {
        setTag(res.data.response);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        return err;
      });

    return response;
  };

  return (
    <TagContext.Provider
      value={{
        CreateTag,
        ListTags,
        DeleteTag,
        UpdateTag,
        listTags,
        SelfTag,
        tag,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

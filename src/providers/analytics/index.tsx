"use client";

import { api } from "@/service/api";
import { createContext, ReactNode, useState } from "react";

// Enums
export enum EventType {
  VIEW = "view",
  VIEW_END = "view_end",
  CLICK = "click",
  WHATSAPP_CLICK = "whatsapp_click",
  MAP_CLICK = "map_click",
  PROFILE_VIEW = "profile_view",
}

// Interfaces dos dados
export interface ArticleEvent {
  event_type: EventType;
  virtual_count: number;
}

export interface TotalArticleEvent {
  event_type: EventType;
  total: number;
}

interface IEventsByArticleResponse {
  message: string;
  events: ArticleEvent[];
}

interface ITotalEventsResponse {
  message: string;
  events: TotalArticleEvent[];
}

interface IRegisterEventResponse {
  message: string;
  event: any;
}

interface IUpdateVirtualEventResponse {
  message: string;
  updated: any;
}

interface IRegisterEventProps {
  articleId: string;
  eventType: EventType;
  extra_data?: Record<string, any>;
  virtualIncrement?: number;
}

interface IUpdateVirtualEventProps {
  article_id: string;
  eventType: EventType;
  newVirtualCount?: number;
}

// Interface principal do contexto
interface IArticleAnalyticsData {
  GetEventsByArticle(articleId: string): Promise<void>;
  GetTotalEvents(): Promise<void>;
  UpdateVirtualEvent(data: IUpdateVirtualEventProps): Promise<void>;

  articleEvents: Record<string, ArticleEvent[]>;
  totalEvents: TotalArticleEvent[];
  loading: boolean;
  error: string | null;

  ClearError(): void;
}

interface IChildrenReact {
  children: ReactNode;
}

export const ArticleAnalyticsContext = createContext<IArticleAnalyticsData>(
  {} as IArticleAnalyticsData
);

export const ArticleAnalyticsProvider = ({ children }: IChildrenReact) => {
  const [articleEvents, setArticleEvents] = useState<
    Record<string, ArticleEvent[]>
  >({});
  const [totalEvents, setTotalEvents] = useState<TotalArticleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para registrar evento (pública - sem auth)
  const RegisterArticleEvent = async ({
    articleId,
    eventType,
    extra_data = {},
    virtualIncrement = 1,
  }: IRegisterEventProps): Promise<void> => {
    setLoading(true);
    setError(null);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const requestData = {
      articleId,
      eventType,
      extra_data,
      virtualIncrement,
    };

    const response = await api
      .post("/event-article", requestData, config)
      .then((res) => {
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erro ao registrar evento");
        setLoading(false);
        return err;
      });

    return response;
  };

  // Adicione estes logs na função GetEventsByArticle do seu provider

  const GetEventsByArticle = async (articleId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    // Debug do token
    const authToken = localStorage.getItem("authToken");
    console.log(
      "🔑 Auth token:",
      authToken ? "Token encontrado" : "Token não encontrado"
    );

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    };

    console.log("📡 Fazendo requisição para:", `event-article/${articleId}`);

    const response = await api
      .get(`/event-article/${articleId}/article`, config)
      .then((res) => {
        // 🔍 Logs de debug existentes
        console.log("✅ Resposta completa:", res);
        console.log("📊 Dados:", res.data);

        const responseData: IEventsByArticleResponse = res.data.response;

        console.log("🔄 responseData processado:", responseData);
        console.log("📈 Eventos:", responseData.events);

        setArticleEvents((prev) => ({
          ...prev,
          [articleId]: responseData.events || [],
        }));

        setLoading(false);
      })
      .catch((err) => {
        // 🔍 Logs de erro existentes
        console.error("❌ Erro na requisição:", err);
        console.error("📄 Dados do erro:", err.response?.data);
        console.error("📋 Status do erro:", err.response?.status);

        setError(
          err.response?.data?.message || "Erro ao buscar eventos do artigo"
        );
        setLoading(false);
        return err;
      });

    return response;
  };
  // Função para buscar totais de eventos (privada - com auth)
  const GetTotalEvents = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    };

    const response = await api
      .get("/event-article", config)
      .then((res) => {
        const responseData: ITotalEventsResponse = res.data.response;
        setTotalEvents(responseData.events || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Erro ao buscar totais de eventos"
        );
        setLoading(false);
        return err;
      });

    return response;
  };

  // Função para atualizar evento virtual (privada - com auth)
  const UpdateVirtualEvent = async ({
    article_id,
    eventType,
    newVirtualCount,
  }: IUpdateVirtualEventProps): Promise<void> => {
    setLoading(true);
    setError(null);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    };

    const requestData = {
      eventType,
      newVirtualCount,
    };

    const response = await api
      .patch(`/event-article/${article_id}/article`, requestData, config)
      .then((res) => {
        GetEventsByArticle(article_id);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Erro ao atualizar evento virtual"
        );
        setLoading(false);
        return err;
      });

    return response;
  };

  // Função para limpar erros
  const ClearError = (): void => {
    setError(null);
  };

  return (
    <ArticleAnalyticsContext.Provider
      value={{
        GetEventsByArticle,
        GetTotalEvents,
        UpdateVirtualEvent,
        articleEvents,
        totalEvents,
        loading,
        error,
        ClearError,
      }}
    >
      {children}
    </ArticleAnalyticsContext.Provider>
  );
};

"use client";

import { api } from "@/service/api";
import { parseCookies } from "nookies";
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

export interface ExtraData {
  ip?: string;
  page?: string;
  section?: string;
  gridCols?: number;
  gridRows?: number;
  gridSize?: number;
  position?: string;
  viewType?: string;
  gridIndex?: number;
  sortOrder?: string;
  timestamp?: string;
  userAgent?: string;
  deviceType?: string;
  articleTitle?: string;
  categoryName?: string;
  gridPosition?: string;
  intersectionRatio?: number;
  [key: string]: unknown; // garante que pode ter qualquer outro campo
}

export interface IEvent {
  id: string;
  event_type: EventType;
  extra_data?: ExtraData;
  timestamp: string;
  article: {
    id: string;
    title: string;
    reading_time: number;
    category: {
      id: string;
      name: string;
    };
  };
}

export interface IVirtualEventResponse {
  response: { articleEvents: IEvent[] };
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
  Get100EventsArticle(): Promise<IVirtualEventResponse>;

  last100EventsArticle: IEvent[];
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

  const [last100EventsArticle, setLast100EventsArticle] = useState<IEvent[]>(
    []
  );

  const Get100EventsArticle = async (): Promise<IVirtualEventResponse> => {
    try {
      const res = await api.get<IVirtualEventResponse>(
        "/analytics/last-100-event-article"
      );
      setLast100EventsArticle(res.data.response.articleEvents);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Função para buscar eventos por artigo (privada - com auth)
  const GetEventsByArticle = async (articleId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    const response = await api
      .get(`/analytics/event-article/${articleId}/article`, config)
      .then((res) => {
        const responseData: IEventsByArticleResponse = res.data.response;
        setArticleEvents((prev) => ({
          ...prev,
          [articleId]: responseData.events || [],
        }));
        setLoading(false);
      })
      .catch((err) => {
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
      .get("/analytics/event-article", config)
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

    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    const requestData = {
      eventType,
      newVirtualCount,
    };

    const response = await api
      .patch(
        `/analytics/event-article/${article_id}/article`,
        requestData,
        config
      )
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
        Get100EventsArticle,
        last100EventsArticle,
      }}
    >
      {children}
    </ArticleAnalyticsContext.Provider>
  );
};

"use client";

import { api } from "@/service/api";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState, useCallback } from "react";

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
export interface ArticleEventRaw {
  event_type: EventType;
  timestamp?: string;
  virtual_count?: number;
}

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
  events: ArticleEventRaw[];
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
  GetEventsByArticle(
    articleId: string,
    startDate?: string,
    endDate?: string
  ): Promise<void>;
  GetTotalEvents(): Promise<void>;
  UpdateVirtualEvent(data: IUpdateVirtualEventProps): Promise<void>;
  Get100EventsArticle(limit?: number): Promise<IVirtualEventResponse>;

  lastEventsArticle: IEvent[];
  articleEvents: Record<string, ArticleEvent[]>;
  totalEvents: TotalArticleEvent[];
  loading: boolean;
  error: string | null;
  rawArticleEvents: Record<string, ArticleEventRaw[]>;

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
  const [rawArticleEvents, setRawArticleEvents] = useState<
    Record<string, ArticleEventRaw[]>
  >({});
  const [totalEvents, setTotalEvents] = useState<TotalArticleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastEventsArticle, setLastEventsArticle] = useState<IEvent[]>([]);

  const Get100EventsArticle = async (
    limit: number = 100
  ): Promise<IVirtualEventResponse> => {
    try {
      const validLimit = Math.min(Math.max(limit, 1), 300);
      const res = await api.get<IVirtualEventResponse>(
        `/analytics/last-article-events/${validLimit}`
      );
      setLastEventsArticle(res.data.response.articleEvents);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Função para buscar eventos por artigo (privada - com auth)
  const GetEventsByArticle = useCallback(
    async (
      articleId: string,
      startDate?: string,
      endDate?: string
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      const { "user:token": token } = parseCookies();
      const config = {
        headers: { Authorization: `bearer ${token}` },
      };

      // Construir query params
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      const queryString = queryParams.toString();

      const endpoint = `/analytics/event-article/${articleId}/article${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api
        .get(endpoint, config)
        .then((res) => {
          const responseData: IEventsByArticleResponse = res.data.response;

          // Usar os eventos que já vêm agregados da API
          const rawEvents = responseData.events || [];

          // Armazenar eventos brutos (se tiverem timestamp para listagem detalhada)
          const eventsWithTimestamp = rawEvents.filter((e) => e.timestamp);
          if (eventsWithTimestamp.length > 0) {
            setRawArticleEvents((prev) => ({
              ...prev,
              [articleId]: eventsWithTimestamp,
            }));
          }

          // Converter para formato esperado (já vem com virtual_count da API)
          const processedEvents: ArticleEvent[] = rawEvents.map((event) => ({
            event_type: event.event_type,
            virtual_count: event.virtual_count || 0,
          }));

          setArticleEvents((prev) => ({
            ...prev,
            [articleId]: processedEvents,
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
    },
    []
  );

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
  const ClearError = useCallback((): void => {
    setError(null);
  }, []);

  return (
    <ArticleAnalyticsContext.Provider
      value={{
        GetEventsByArticle,
        GetTotalEvents,
        UpdateVirtualEvent,
        articleEvents,
        rawArticleEvents,
        totalEvents,
        loading,
        error,
        ClearError,
        Get100EventsArticle,
        lastEventsArticle,
      }}
    >
      {children}
    </ArticleAnalyticsContext.Provider>
  );
};

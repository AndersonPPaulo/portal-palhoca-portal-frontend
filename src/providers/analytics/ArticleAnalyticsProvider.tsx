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
  VIEW_SOURCE = "view_source",
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

export interface DetailedArticleEvent {
  id: string;
  event_type: EventType;
  timestamp?: string;
  extra_data?: Record<string, unknown>;
  article?: {
    id: string;
    title: string;
  };
}

interface IEventsByArticleResponse {
  message: string;
  total: number;
  showing: number;
  hasMore: boolean;
  data: DetailedArticleEvent[];
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
  portal?: string;
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
  detailedArticleEvents: Record<string, DetailedArticleEvent[]>;
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
  const [detailedArticleEvents, setDetailedArticleEvents] = useState<
    Record<string, DetailedArticleEvent[]>
  >({});
  const [rawArticleEvents, setRawArticleEvents] = useState<
    Record<string, ArticleEventRaw[]>
  >({});
  const [totalEvents, setTotalEvents] = useState<TotalArticleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastEventsArticle, setLastEventsArticle] = useState<IEvent[]>([]);

  const Get100EventsArticle = useCallback(
    async (limit: number = 100): Promise<IVirtualEventResponse> => {
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
    },
    []
  );

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
      if (startDate) {
        // Converter datetime-local para ISO 8601
        const isoStartDate = new Date(startDate).toISOString();
        queryParams.append("startDate", isoStartDate);
      }
      if (endDate) {
        // Converter datetime-local para ISO 8601
        const isoEndDate = new Date(endDate).toISOString();
        queryParams.append("endDate", isoEndDate);
      }
      const queryString = queryParams.toString();

      // Usar a nova URL: /article/{id}/events
      const endpoint = `/article/${articleId}/events${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api
        .get(endpoint, config)
        .then(async (res) => {
          const responseData = res.data;

          // Nova estrutura da API com aggregated e detailed_events
          const aggregated = responseData.aggregated || [];
          const detailedEvents =
            responseData.detailed_events || responseData.data || [];

          // Armazenar eventos detalhados (para logs/PDF)
          setDetailedArticleEvents((prev) => ({
            ...prev,
            [articleId]: detailedEvents,
          }));

          // Buscar os contadores virtuais (valores editados) via logs de auditoria.
          // A rota /events agrega apenas o COUNT real dos eventos, então o
          // virtual_count editado é recuperado pelo log mais recente de cada tipo.
          const virtualCountByType: Record<string, number> = {};
          try {
            const logsRes = await api.get(
              `/analytics/event-article/${articleId}/virtual-logs`,
              config
            );
            const logs: Array<{
              event_type: string;
              new_virtual_count: number;
              changed_at: string;
            }> = logsRes.data?.logs || [];

            // Mais recentes primeiro; o primeiro de cada tipo é o valor atual
            [...logs]
              .sort(
                (a, b) =>
                  new Date(b.changed_at).getTime() -
                  new Date(a.changed_at).getTime()
              )
              .forEach((log) => {
                if (!(log.event_type in virtualCountByType)) {
                  virtualCountByType[log.event_type] = log.new_virtual_count;
                }
              });
          } catch {
            // Sem logs ou erro ao buscá-los: mantém apenas o total_count agregado
          }

          // Indexar os agregados (COUNT real) por tipo
          const aggregatedByType: Record<string, number> = {};
          aggregated.forEach((item: any) => {
            aggregatedByType[item.event_type] =
              item.virtual_count ?? item.total_count ?? 0;
          });

          // União dos tipos: cobre overrides em tipos sem eventos reais
          const allEventTypes = new Set<string>([
            ...Object.keys(aggregatedByType),
            ...Object.keys(virtualCountByType),
          ]);

          // Preferir o virtual_count (valor editado) quando houver log;
          // caso contrário, usar o total_count (COUNT real do banco).
          const processedEvents: ArticleEvent[] = Array.from(
            allEventTypes
          ).map((type) => ({
            event_type: type as EventType,
            virtual_count:
              virtualCountByType[type] ?? aggregatedByType[type] ?? 0,
          }));

          setArticleEvents((prev) => ({
            ...prev,
            [articleId]: processedEvents,
          }));

          // Armazenar rawArticleEvents para manter compatibilidade
          const rawEvents: ArticleEventRaw[] = detailedEvents.map(
            (event: DetailedArticleEvent) => ({
              event_type: event.event_type,
              timestamp: event.timestamp,
              virtual_count: 1,
            })
          );

          setRawArticleEvents((prev) => ({
            ...prev,
            [articleId]: rawEvents,
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
        detailedArticleEvents,
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

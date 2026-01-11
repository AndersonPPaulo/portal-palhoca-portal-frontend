"use client";

import { api } from "@/service/api";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState, useCallback } from "react";
import { ExtraData } from "./ArticleAnalyticsProvider";

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
export interface BannerEventRaw {
  event_type: EventType;
  timestamp?: string;
  virtual_count?: number;
}

export interface BannerEvent {
  event_type: EventType;
  virtual_count: number;
}

export interface TotalBannerEvent {
  event_type: EventType;
  total: number;
}

export interface DetailedEvent {
  id: string;
  event_type: EventType;
  timestamp?: string;
  extra_data?: Record<string, unknown>;
  banner?: {
    id: string;
    name: string;
  };
}

interface IEventsByBannerResponse {
  message: string;
  total: number;
  showing: number;
  hasMore: boolean;
  data: DetailedEvent[];
}

interface ITotalEventsResponse {
  message: string;
  events: TotalBannerEvent[];
}

interface IUpdateVirtualEventProps {
  banner_id: string;
  eventType: EventType;
  newVirtualCount?: number;
}

export interface IEvent {
  id: string;
  event_type: EventType;
  extra_data?: ExtraData;
  timestamp: string;
  banner: {
    id: string;
    name: string;
  };
}

export interface IVirtualEventResponse {
  response: { bannerEvents: IEvent[] };
}

// Interface principal do contexto
interface IBannerAnalyticsData {
  GetEventsByBanner(
    bannerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<void>;
  GetTotalEvents(): Promise<void>;
  UpdateVirtualEvent(data: IUpdateVirtualEventProps): Promise<void>;
  Get100EventsBanner(limit?: number): Promise<IVirtualEventResponse>;

  lastEventsBanner: IEvent[];
  bannerEvents: Record<string, BannerEvent[]>;
  detailedBannerEvents: Record<string, DetailedEvent[]>;
  totalEvents: TotalBannerEvent[];
  loading: boolean;
  error: string | null;
  rawBannerEvents: Record<string, BannerEventRaw[]>;

  ClearError(): void;
}

interface IChildrenReact {
  children: ReactNode;
}

export const BannerAnalyticsContext = createContext<IBannerAnalyticsData>(
  {} as IBannerAnalyticsData
);

export const BannerAnalyticsProvider = ({ children }: IChildrenReact) => {
  const [bannerEvents, setBannerEvents] = useState<
    Record<string, BannerEvent[]>
  >({});
  const [detailedBannerEvents, setDetailedBannerEvents] = useState<
    Record<string, DetailedEvent[]>
  >({});
  const [rawBannerEvents, setRawBannerEvents] = useState<
    Record<string, BannerEventRaw[]>
  >({});
  const [totalEvents, setTotalEvents] = useState<TotalBannerEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastEventsBanner, setLastEventsBanner] = useState<IEvent[]>([]);

  const Get100EventsBanner = useCallback(
    async (limit: number = 100): Promise<IVirtualEventResponse> => {
      try {
        const validLimit = Math.min(Math.max(limit, 1), 300);
        const res = await api.get<IVirtualEventResponse>(
          `/analytics/last-banner-events/${validLimit}`
        );
        setLastEventsBanner(res.data.response.bannerEvents);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  // Função para buscar eventos por banner (privada - com auth)
  const GetEventsByBanner = useCallback(
    async (
      bannerId: string,
      startDate?: string,
      endDate?: string
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      const { "user:token": token } = parseCookies();

      if (!token) {
        setError("Token de autenticação não encontrado");
        setLoading(false);
        return;
      }

      const config = {
        headers: { Authorization: `bearer ${token}` },
      };

      // Construir query params
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      const queryString = queryParams.toString();

      // Usar a nova URL: /banner/{id}/events
      const endpoint = `/banner/${bannerId}/events${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api
        .get(endpoint, config)
        .then((res) => {
          const responseData = res.data;

          // Nova estrutura da API com aggregated e detailed_events
          const aggregated = responseData.aggregated || [];
          const detailedEvents =
            responseData.detailed_events || responseData.data || [];

          // Armazenar eventos detalhados (para logs/PDF)
          setDetailedBannerEvents((prev) => ({
            ...prev,
            [bannerId]: detailedEvents,
          }));

          // Usar os dados agregados da API (COUNT real do banco)
          const processedEvents: BannerEvent[] = aggregated.map(
            (item: any) => ({
              event_type: item.event_type as EventType,
              virtual_count: item.total_count || 0,
            })
          );

          setBannerEvents((prev) => ({
            ...prev,
            [bannerId]: processedEvents,
          }));

          // Armazenar rawBannerEvents para manter compatibilidade
          const rawEvents: BannerEventRaw[] = detailedEvents.map(
            (event: DetailedEvent) => ({
              event_type: event.event_type,
              timestamp: event.timestamp,
              virtual_count: 1,
            })
          );

          setRawBannerEvents((prev) => ({
            ...prev,
            [bannerId]: rawEvents,
          }));

          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Erro na API de eventos do banner:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
            endpoint,
            bannerId,
            config,
          });
          setError(
            err.response?.data?.message ||
              `Erro ao buscar eventos do banner: ${err.message}`
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
      .get("/analytics/event-banner", config)
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
    banner_id,
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
      .patch(`/analytics/event-banner/${banner_id}/banner`, requestData, config)
      .then(() => {
        GetEventsByBanner(banner_id);
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
    <BannerAnalyticsContext.Provider
      value={{
        GetEventsByBanner,
        GetTotalEvents,
        UpdateVirtualEvent,
        bannerEvents,
        detailedBannerEvents,
        rawBannerEvents,
        totalEvents,
        loading,
        error,
        ClearError,
        Get100EventsBanner,
        lastEventsBanner,
      }}
    >
      {children}
    </BannerAnalyticsContext.Provider>
  );
};

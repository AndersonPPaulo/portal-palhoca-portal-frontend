"use client";

import { api } from "@/service/api";
import { parseCookies } from "nookies";
import { createContext, ReactNode, useState } from "react";
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
export interface BannerEvent {
  event_type: EventType;
  virtual_count: number;
}

export interface TotalBannerEvent {
  event_type: EventType;
  total: number;
}

interface IEventsByBannerResponse {
  message: string;
  events: BannerEvent[];
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
  GetEventsByBanner(bannerId: string): Promise<void>;
  GetTotalEvents(): Promise<void>;
  UpdateVirtualEvent(data: IUpdateVirtualEventProps): Promise<void>;
  Get100EventsBanner(): Promise<IVirtualEventResponse>;

  last100EventsBanner: IEvent[];
  bannerEvents: Record<string, BannerEvent[]>;
  totalEvents: TotalBannerEvent[];
  loading: boolean;
  error: string | null;

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
  const [totalEvents, setTotalEvents] = useState<TotalBannerEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [last100EventsBanner, setLast100EventsBanner] = useState<IEvent[]>([]);

  const Get100EventsBanner = async (): Promise<IVirtualEventResponse> => {
    try {
      const res = await api.get<IVirtualEventResponse>(
        "/analytics/last-100-event-banner"
      );
      setLast100EventsBanner(res.data.response.bannerEvents);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Função para buscar eventos por banner (privada - com auth)
  const GetEventsByBanner = async (bannerId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    const response = await api
      .get(`/analytics/event-banner/${bannerId}/banner`, config)
      .then((res) => {
        const responseData: IEventsByBannerResponse = res.data.response;
        console.log("res.data.response", res.data.response);
        setBannerEvents((prev) => ({
          ...prev,
          [bannerId]: responseData.events || [],
        }));
        setLoading(false);
        console.log("responseData.events", responseData.events);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Erro ao buscar eventos do banner"
        );
        setLoading(false);
        return err;
      });

    console.log("response", response);
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
      .then((res) => {
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
  const ClearError = (): void => {
    setError(null);
  };

  return (
    <BannerAnalyticsContext.Provider
      value={{
        GetEventsByBanner,
        GetTotalEvents,
        UpdateVirtualEvent,
        bannerEvents,
        totalEvents,
        loading,
        error,
        ClearError,
        Get100EventsBanner,
        last100EventsBanner,
      }}
    >
      {children}
    </BannerAnalyticsContext.Provider>
  );
};

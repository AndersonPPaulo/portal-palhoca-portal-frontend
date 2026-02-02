/* eslint-disable @typescript-eslint/no-unused-vars */
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
export interface CompanyEventRaw {
  event_type: EventType;
  timestamp?: string;
  virtual_count?: number;
}

export interface CompanyEvent {
  event_type: EventType;
  virtual_count: number;
}

export interface TotalCompanyEvent {
  event_type: EventType;
  total: number;
}

export interface DetailedCompanyEvent {
  id: string;
  event_type: EventType;
  timestamp?: string;
  extra_data?: Record<string, unknown>;
  company?: {
    id: string;
    name: string;
  };
}

interface IEventsByCompanyResponse {
  message: string;
  total: number;
  showing: number;
  hasMore: boolean;
  data: DetailedCompanyEvent[];
}

interface ITotalEventsResponse {
  message: string;
  events: TotalCompanyEvent[];
}

interface IUpdateVirtualEventProps {
  company_id: string;
  eventType: EventType;
  newVirtualCount?: number;
}

export interface IEvent {
  id: string;
  event_type: EventType;
  extra_data?: ExtraData;
  timestamp: string;
  company: {
    id: string;
    name: string;
  };
}

export interface IVirtualEventResponse {
  response: { companyEvents: IEvent[] };
}

// Interface principal do contexto
interface ICompanyAnalyticsData {
  GetEventsByCompany(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<void>;
  GetTotalEvents(): Promise<void>;
  UpdateVirtualEvent(data: IUpdateVirtualEventProps): Promise<void>;
  Get100EventsCompany(
    limit?: number,
    excludeType?: string,
  ): Promise<IVirtualEventResponse>;

  lastEventsCompany: IEvent[];
  companyEvents: Record<string, CompanyEvent[]>;
  detailedCompanyEvents: Record<string, DetailedCompanyEvent[]>;
  totalEvents: TotalCompanyEvent[];
  loading: boolean;
  error: string | null;
  rawCompanyEvents: Record<string, CompanyEventRaw[]>;

  ClearError(): void;
}

interface IChildrenReact {
  children: ReactNode;
}

export const CompanyAnalyticsContext = createContext<ICompanyAnalyticsData>(
  {} as ICompanyAnalyticsData,
);

export const CompanyAnalyticsProvider = ({ children }: IChildrenReact) => {
  const [companyEvents, setCompanyEvents] = useState<
    Record<string, CompanyEvent[]>
  >({});
  const [detailedCompanyEvents, setDetailedCompanyEvents] = useState<
    Record<string, DetailedCompanyEvent[]>
  >({});
  const [rawCompanyEvents, setRawCompanyEvents] = useState<
    Record<string, CompanyEventRaw[]>
  >({});
  const [totalEvents, setTotalEvents] = useState<TotalCompanyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEventsCompany, setLastEventsCompany] = useState<IEvent[]>([]);

  const Get100EventsCompany = useCallback(
    async (
      limit: number = 100,
      excludeType?: string,
    ): Promise<IVirtualEventResponse> => {
      try {
        const validLimit = Math.min(Math.max(limit, 1), 300);
        const queryParams = excludeType ? `?excludeType=${excludeType}` : "";
        const res = await api.get<IVirtualEventResponse>(
          `/analytics/last-company-events/${validLimit}${queryParams}`,
        );
        setLastEventsCompany(res.data.response.companyEvents);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    [],
  );
  // Função para buscar eventos por comércio (privada - com auth)
  const GetEventsByCompany = useCallback(
    async (
      companyId: string,
      startDate?: string,
      endDate?: string,
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

      // Usar a nova URL: /company/{id}/events
      const endpoint = `/company/${companyId}/events${
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
          setDetailedCompanyEvents((prev) => ({
            ...prev,
            [companyId]: detailedEvents,
          }));

          // Usar os dados agregados da API (COUNT real do banco)
          const processedEvents: CompanyEvent[] = aggregated.map(
            (item: any) => ({
              event_type: item.event_type as EventType,
              virtual_count: item.total_count || 0,
            }),
          );

          setCompanyEvents((prev) => ({
            ...prev,
            [companyId]: processedEvents,
          }));

          // Armazenar rawCompanyEvents para manter compatibilidade
          const rawEvents: CompanyEventRaw[] = detailedEvents.map(
            (event: DetailedCompanyEvent) => ({
              event_type: event.event_type,
              timestamp: event.timestamp,
              virtual_count: 1,
            }),
          );

          setRawCompanyEvents((prev) => ({
            ...prev,
            [companyId]: rawEvents,
          }));

          setLoading(false);
        })
        .catch((err) => {
          setError(
            err.response?.data?.message || "Erro ao buscar eventos do comércio",
          );
          setLoading(false);
          return err;
        });

      return response;
    },
    [],
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
      .get("/analytics/event-company", config)
      .then((res) => {
        const responseData: ITotalEventsResponse = res.data.response;
        setTotalEvents(responseData.events || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Erro ao buscar totais de eventos",
        );
        setLoading(false);
        return err;
      });

    return response;
  };

  // Função para atualizar evento virtual (privada - com auth)
  const UpdateVirtualEvent = async ({
    company_id,
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
        `/analytics/event-company/${company_id}/company`,
        requestData,
        config,
      )
      .then((res) => {
        GetEventsByCompany(company_id);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Erro ao atualizar evento virtual",
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
    <CompanyAnalyticsContext.Provider
      value={{
        GetEventsByCompany,
        GetTotalEvents,
        UpdateVirtualEvent,
        companyEvents,
        detailedCompanyEvents,
        rawCompanyEvents,
        totalEvents,
        loading,
        error,
        ClearError,
        Get100EventsCompany,
        lastEventsCompany,
      }}
    >
      {children}
    </CompanyAnalyticsContext.Provider>
  );
};

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
export interface CompanyEvent {
  event_type: EventType;
  virtual_count: number;
}

export interface TotalCompanyEvent {
  event_type: EventType;
  total: number;
}

interface IEventsByCompanyResponse {
  message: string;
  events: CompanyEvent[];
}

interface ITotalEventsResponse {
  message: string;
  events: TotalCompanyEvent[];
}

interface IUpdateVirtualEventResponse {
  message: string;
  updated: any;
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
  GetEventsByCompany(companyId: string): Promise<void>;
  GetTotalEvents(): Promise<void>;
  UpdateVirtualEvent(data: IUpdateVirtualEventProps): Promise<void>;
  Get100EventsCompany(): Promise<IVirtualEventResponse>;

  last100EventsCompany: IEvent[];
  companyEvents: Record<string, CompanyEvent[]>;
  totalEvents: TotalCompanyEvent[];
  loading: boolean;
  error: string | null;

  ClearError(): void;
}

interface IChildrenReact {
  children: ReactNode;
}

export const CompanyAnalyticsContext = createContext<ICompanyAnalyticsData>(
  {} as ICompanyAnalyticsData
);

export const CompanyAnalyticsProvider = ({ children }: IChildrenReact) => {
  const [companyEvents, setCompanyEvents] = useState<
    Record<string, CompanyEvent[]>
  >({});
  const [totalEvents, setTotalEvents] = useState<TotalCompanyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [last100EventsCompany, setLast100EventsCompany] = useState<IEvent[]>(
    []
  );

  const Get100EventsCompany = async (): Promise<IVirtualEventResponse> => {
    try {
      const res = await api.get<IVirtualEventResponse>(
        "/analytics/last-100-event-company"
      );
      setLast100EventsCompany(res.data.response.companyEvents);
      return res.data;
    } catch (err) {
      throw err;
    }
  };
  // Função para buscar eventos por comércio (privada - com auth)
  const GetEventsByCompany = async (companyId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    const { "user:token": token } = parseCookies();
    const config = {
      headers: { Authorization: `bearer ${token}` },
    };

    const response = await api
      .get(`/analytics/event-company/${companyId}/company`, config)
      .then((res) => {
        const responseData: IEventsByCompanyResponse = res.data.response;
        console.log("res.data.response", res.data.response);
        setCompanyEvents((prev) => ({
          ...prev,
          [companyId]: responseData.events || [],
        }));
        setLoading(false);
        console.log("responseData.events", responseData.events);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Erro ao buscar eventos do comércio"
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
      .get("/analytics/event-company", config)
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
        config
      )
      .then((res) => {
        GetEventsByCompany(company_id);
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
    <CompanyAnalyticsContext.Provider
      value={{
        GetEventsByCompany,
        GetTotalEvents,
        UpdateVirtualEvent,
        companyEvents,
        totalEvents,
        loading,
        error,
        ClearError,
        Get100EventsCompany,
        last100EventsCompany,
      }}
    >
      {children}
    </CompanyAnalyticsContext.Provider>
  );
};

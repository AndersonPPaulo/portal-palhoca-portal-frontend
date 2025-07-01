"use client";

import React, { useContext } from "react";
import AnalyticsModal from "../AnalyticsModal/index";
import { ArticleAnalyticsContext } from "@/providers/analytics";
import {
  Eye,
  MousePointer,
  TrendingUp,
  MessageCircle,
  MapPin,
  User,
  BarChart3,
} from "lucide-react";
import type { EventTypeConfig, MetricConfig } from "./index";

// Configuração específica para artigos baseada no seu EventType
const articleEventConfigs: EventTypeConfig[] = [
  {
    type: "view",
    label: "Visualizações",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Total de visualizações do artigo",
  },
  {
    type: "view_end",
    label: "Leituras Completas",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Usuários que chegaram ao final do artigo",
  },
  {
    type: "click",
    label: "Cliques",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Total de cliques no artigo",
  },
  {
    type: "whatsapp_click",
    label: "Cliques WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Cliques no botão WhatsApp",
  },
  {
    type: "map_click",
    label: "Cliques no Mapa",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Cliques em mapas ou localização",
  },
  {
    type: "profile_view",
    label: "Visualizações de Perfil",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Visualizações de perfil relacionadas",
  },
];

// Métricas calculadas específicas para artigos
const articleMetricConfigs: MetricConfig[] = [
  {
    key: "total_views",
    label: "Total Views",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
    calculation: (events) => events.view || 0,
  },
  {
    key: "total_clicks",
    label: "Total Clicks",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    calculation: (events) => events.click || 0,
  },
  {
    key: "completion_rate",
    label: "Taxa Conclusão",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    calculation: (events) => {
      const views = events.view || 0;
      const ends = events.view_end || 0;
      return views > 0 ? `${((ends / views) * 100).toFixed(1)}%` : "0%";
    },
  },
  {
    key: "ctr",
    label: "CTR",
    icon: BarChart3,
    color: "text-orange-600",
    bgColor: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
    calculation: (events) => {
      const views = events.view || 0;
      const clicks = events.click || 0;
      return views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : "0%";
    },
  },
];

interface ArticleAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

export default function ArticleAnalyticsModal({
  isOpen,
  onClose,
  articleId,
  articleTitle,
}: ArticleAnalyticsModalProps) {
  // Usando seu provider atual
  const {
    articleEvents,
    loading,
    error,
    GetEventsByArticle,
    UpdateVirtualEvent,
    ClearError,
  } = useContext(ArticleAnalyticsContext);

  // Adaptando para a interface do modal reutilizável
  const analyticsData = {
    events: articleEvents[articleId] || [],
    loading,
    error,
  };

  const analyticsActions = {
    loadEvents: async (id: string) => {
      await GetEventsByArticle(id);
    },
    updateEvent: async (id: string, eventType: string, newValue: number) => {
      await UpdateVirtualEvent({
        article_id: id,
        eventType: eventType as any, // Seu EventType enum
        newVirtualCount: newValue,
      });
    },
    clearError: ClearError,
  };

  return (
    <AnalyticsModal
      isOpen={isOpen}
      onClose={onClose}
      entityId={articleId}
      entityTitle={articleTitle}
      entityType="article"
      analyticsData={analyticsData}
      analyticsActions={analyticsActions}
      eventTypeConfigs={articleEventConfigs}
      metricConfigs={articleMetricConfigs}
      enableEditing={true}
      enableDebug={process.env.NODE_ENV === "development"}
      customTitle="Analytics do Artigo"
      customDescription="Este artigo ainda não possui eventos registrados."
      onDataLoaded={(data) => {
        console.log(`📊 Dados do artigo ${articleTitle} carregados:`, data);
      }}
      onEventUpdated={(eventType, newValue) => {
        console.log(` Evento ${eventType} atualizado para ${newValue}`);
        // Aqui você pode adicionar lógica adicional, como:
        // - Enviar para analytics externos (Google Analytics, etc)
        // - Notificar outros componentes
        // - Atualizar cache global
      }}
    />
  );
}

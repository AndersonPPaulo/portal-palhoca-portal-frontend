"use client";

import React, { useContext } from "react";
import AnalyticsModal from "../AnalyticsModal/index";
import { ArticleAnalyticsContext } from "@/providers/analytics/ArticleAnalyticsProvider";
import {articleEventConfigs, articleMetricConfigs} from "../configs/index";


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

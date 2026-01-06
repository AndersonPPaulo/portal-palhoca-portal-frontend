"use client";

import React, { useContext, useEffect } from "react";
import AnalyticsModal from "../AnalyticsModal/index";
import {
  ArticleAnalyticsContext,
  EventType,
} from "@/providers/analytics/ArticleAnalyticsProvider";
import { articleEventConfigs, articleMetricConfigs } from "../configs/index";
import { useIsMobile } from "@/hooks/useIsMobile";

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
    detailedArticleEvents,
    rawArticleEvents,
    loading,
    error,
    GetEventsByArticle,
    UpdateVirtualEvent,
    ClearError,
  } = useContext(ArticleAnalyticsContext);

  // Carregar eventos quando o modal abrir
  useEffect(() => {
    if (isOpen && articleId) {
      ClearError();
      const timeoutId = setTimeout(() => {
        GetEventsByArticle(articleId);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, articleId]);

  // Adaptando para a interface do modal reutilizável
  const analyticsData = {
    events: articleEvents[articleId] || [],
    loading,
    error,
    rawEvents: detailedArticleEvents[articleId] || [],
  };
  const isMobile = useIsMobile();

  const analyticsActions = {
    loadEvents: async (id: string, startDate?: string, endDate?: string) => {
      await GetEventsByArticle(id, startDate, endDate);
    },
    updateEvent: async (id: string, eventType: string, newValue: number) => {
      await UpdateVirtualEvent({
        article_id: id,
        eventType: eventType as EventType,
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
      disableAutoLoad={true}
      isMobile={isMobile}
    />
  );
}

"use client";

import React, { useContext, useEffect } from "react";
import ReusableAnalyticsModal from "./index";
import { BannerAnalyticsContext } from "@/providers/analytics/BannerAnalyticsProvider";
import { bannerEventConfigs, bannerMetricConfigs } from "../configs";
import { EventType } from "@/providers/analytics/BannerAnalyticsProvider";

interface BannerAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerId: string;
  bannerTitle: string;
}

export default function BannerAnalyticsModal({
  isOpen,
  onClose,
  bannerId,
  bannerTitle,
}: BannerAnalyticsModalProps) {
  // Usando seu provider de banner
  const {
    bannerEvents,
    detailedBannerEvents,
    rawBannerEvents,
    loading,
    error,
    GetEventsByBanner,
    UpdateVirtualEvent,
    ClearError,
  } = useContext(BannerAnalyticsContext);

  // Carregar eventos quando o modal abrir
  useEffect(() => {
    if (isOpen && bannerId) {
      ClearError();
      const timeoutId = setTimeout(() => {
        GetEventsByBanner(bannerId);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, bannerId, ClearError, GetEventsByBanner]);

  // Adaptando para a interface do modal reutilizável
  const analyticsData = {
    events: bannerEvents[bannerId] || [],
    loading,
    error,
    rawEvents: detailedBannerEvents[bannerId] || [],
  };

  const analyticsActions = {
    loadEvents: async (id: string, startDate?: string, endDate?: string) => {
      try {
        await GetEventsByBanner(id, startDate, endDate);
      } catch (error) {
        console.error("Erro ao carregar eventos do banner:", error);
      }
    },
    updateEvent: async (id: string, eventType: string, newValue: number) => {
      try {
        await UpdateVirtualEvent({
          banner_id: id,
          eventType: eventType as EventType,
          newVirtualCount: newValue,
        });
      } catch (error) {
        console.error("Erro ao atualizar evento do banner:", error);
      }
    },
    clearError: ClearError || (() => {}),
  };

  return (
    <ReusableAnalyticsModal
      isOpen={isOpen}
      onClose={onClose}
      entityId={bannerId}
      entityTitle={bannerTitle}
      entityType="banner"
      analyticsData={analyticsData}
      analyticsActions={analyticsActions}
      eventTypeConfigs={bannerEventConfigs}
      metricConfigs={bannerMetricConfigs}
      enableEditing={true}
      enableDebug={process.env.NODE_ENV === "development"}
      customTitle="Analytics do Banner"
      customDescription="Este banner ainda não possui eventos registrados."
      disableAutoLoad={true}
    />
  );
}

"use client";

import React, { useContext } from "react";
import ReusableAnalyticsModal from "./index"; 
import { BannerAnalyticsContext } from "@/providers/analytics/BannerAnalyticsProvider";
import { bannerEventConfigs, bannerMetricConfigs } from "../configs";

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
    loading,
    error,
    GetEventsByBanner,
    UpdateVirtualEvent,
    ClearError,
  } = useContext(BannerAnalyticsContext);

  // Verificações de segurança
  const safeBannerEvents = bannerEvents || {};
  const bannerEventsList = safeBannerEvents[bannerId] || [];

  // Adaptando para a interface do modal reutilizável
  const analyticsData = {
    events: bannerEventsList,
    loading: loading || false,
    error: error || null,
  };

  const analyticsActions = {
    loadEvents: async (id: string) => {
      try {
        await GetEventsByBanner(id);
      } catch (error) {
        console.error("Erro ao carregar eventos do banner:", error);
      }
    },
    updateEvent: async (id: string, eventType: string, newValue: number) => {
      try {
        await UpdateVirtualEvent({
          banner_id: id,
          eventType: eventType as any, // Seu EventType enum
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
      onDataLoaded={(data) => {
        console.log(`📊 Dados do banner ${bannerTitle} carregados:`, data);
      }}
      onEventUpdated={(eventType, newValue) => {
        console.log(`🎯 Evento ${eventType} atualizado para ${newValue}`);
        // Aqui você pode adicionar lógica adicional, como:
        // - Enviar para analytics externos (Google Analytics, etc)
        // - Notificar outros componentes
        // - Atualizar cache global
        // - Atualizar rankings de banners
      }}
    />
  );
}
"use client";

import React, { useContext } from "react";
import ReusableAnalyticsModal from "./index";
import { CompanyAnalyticsContext } from "@/providers/analytics/CompanyAnalyticsProvider";
import { companyEventConfigs, companyMetricConfigs } from "../configs";

interface CompanyAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyTitle: string;
}

export default function CompanyAnalyticsModal({
  isOpen,
  onClose,
  companyId,
  companyTitle,
}: CompanyAnalyticsModalProps) {
  // Usando seu provider de comércio
  const {
    companyEvents,
    loading,
    error,
    GetEventsByCompany,
    UpdateVirtualEvent,
    ClearError,
  } = useContext(CompanyAnalyticsContext);

  // Adaptando para a interface do modal reutilizável
  const analyticsData = {
    events: companyEvents[companyId] || [],
    loading,
    error,
  };

  const analyticsActions = {
    loadEvents: async (id: string) => {
      await GetEventsByCompany(id);
    },
    updateEvent: async (id: string, eventType: string, newValue: number) => {
      await UpdateVirtualEvent({
        company_id: id,
        eventType: eventType as any, // Seu EventType enum
        newVirtualCount: newValue,
      });
    },
    clearError: ClearError,
  };

  return (
    <ReusableAnalyticsModal
      isOpen={isOpen}
      onClose={onClose}
      entityId={companyId}
      entityTitle={companyTitle}
      entityType="company"
      analyticsData={analyticsData}
      analyticsActions={analyticsActions}
      eventTypeConfigs={companyEventConfigs}
      metricConfigs={companyMetricConfigs}
      enableEditing={true}
      enableDebug={process.env.NODE_ENV === "development"}
      customTitle="Analytics do Comércio"
      customDescription="Este comércio ainda não possui eventos registrados."
      onDataLoaded={(data) => {
        console.log(`📊 Dados do comércio ${companyTitle} carregados:`, data);
      }}
      onEventUpdated={(eventType, newValue) => {
        console.log(`🏪 Evento ${eventType} atualizado para ${newValue}`);
        // Aqui você pode adicionar lógica adicional, como:
        // - Enviar para analytics externos (Google Analytics, etc)
        // - Notificar outros componentes
        // - Atualizar cache global
        // - Atualizar rankings de comércios
      }}
    />
  );
}

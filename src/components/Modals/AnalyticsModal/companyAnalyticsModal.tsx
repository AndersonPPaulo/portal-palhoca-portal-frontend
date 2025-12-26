"use client";

import React, { useContext, useEffect } from "react";
import ReusableAnalyticsModal from "./index";
import {
  CompanyAnalyticsContext,
  EventType,
} from "@/providers/analytics/CompanyAnalyticsProvider";
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
    rawCompanyEvents,
    loading,
    error,
    GetEventsByCompany,
    UpdateVirtualEvent,
    ClearError,
  } = useContext(CompanyAnalyticsContext);

  // Carregar eventos quando o modal abrir
  useEffect(() => {
    if (isOpen && companyId) {
      ClearError();
      const timeoutId = setTimeout(() => {
        GetEventsByCompany(companyId);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, companyId]);

  // Adaptando para a interface do modal reutilizável
  const analyticsData = {
    events: companyEvents[companyId] || [],
    loading,
    error,
    rawEvents: rawCompanyEvents[companyId] || [],
  };

  const analyticsActions = {
    loadEvents: async (id: string, startDate?: string, endDate?: string) => {
      await GetEventsByCompany(id, startDate, endDate);
    },
    updateEvent: async (id: string, eventType: string, newValue: number) => {
      await UpdateVirtualEvent({
        company_id: id,
        eventType: eventType as EventType,
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
      disableAutoLoad={true}
    />
  );
}

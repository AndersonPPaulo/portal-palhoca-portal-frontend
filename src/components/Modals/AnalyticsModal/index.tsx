"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/useIsMobile";
import { UserContext } from "@/providers/user";
import {
  ArrowLeft,
  Eye,
  MousePointer,
  TrendingUp,
  Save,
  RefreshCw,
  BarChart3,
  AlertCircle,
  Calendar,
  Clock,
  Infinity,
} from "lucide-react";
import { useEffect, useState, useCallback, useContext, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { Download } from "lucide-react";

export interface GenericEvent {
  event_type: string;
  virtual_count: number;
  timestamp?: string;
  extra_data?: Record<string, unknown>;
}

export interface EventTypeConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor?: string;
  description: string;
}

export interface AnalyticsData {
  events: GenericEvent[];
  loading: boolean;
  error: string | null;
  rawEvents?: Array<{
    event_type: string;
    timestamp?: string;
    extra_data?: Record<string, unknown>;
  }>;
}

export interface AnalyticsActions {
  loadEvents: (
    entityId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  updateEvent?: (
    entityId: string,
    eventType: string,
    newValue: number
  ) => Promise<void>;
  clearError: () => void;
}

export interface MetricConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  calculation: (events: Record<string, number>) => number | string;
}

// PROPS DO COMPONENTE

interface ReusableAnalyticsModalProps {
  // Estados básicos do modal
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;

  // Identificação da entidade
  entityId: string;
  entityTitle: string;
  entityType: string; // "article", "banner", "company", etc.

  // Dados e ações (provider-agnostic)
  analyticsData: AnalyticsData;
  analyticsActions: AnalyticsActions;

  // Configurações dinâmicas
  eventTypeConfigs: EventTypeConfig[];
  metricConfigs?: MetricConfig[];

  // Configurações opcionais
  enableEditing?: boolean;
  enableDebug?: boolean;
  customTitle?: string;
  customDescription?: string;
  disableAutoLoad?: boolean;

  // Callbacks opcionais
  onDataLoaded?: (data: GenericEvent[]) => void;
  onEventUpdated?: (eventType: string, newValue: number) => void;
}

export default function ReusableAnalyticsModal({
  isOpen,
  onClose,
  entityId,
  entityTitle,
  entityType,
  analyticsData,
  analyticsActions,
  eventTypeConfigs,
  metricConfigs,
  enableEditing = true,
  customTitle,
  customDescription,
  disableAutoLoad = false,
  onDataLoaded,
  onEventUpdated,
}: ReusableAnalyticsModalProps) {
  const [editableEvents, setEditableEvents] = useState<Record<string, number>>(
    {}
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalEvents, setOriginalEvents] = useState<Record<string, number>>(
    {}
  );

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(
    null
  );

  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useIsMobile();

  // Ref para controlar se acabamos de salvar (evita reprocessamento)
  const justSavedRef = useRef(false);
  // Ref para armazenar a última versão processada dos events
  const lastProcessedEventsRef = useRef<string>("");

  const processEventData = useCallback(
    (events: GenericEvent[]) => {
      const processed: Record<string, number> = {};

      // Inicializar todos os tipos com 0
      eventTypeConfigs.forEach((config) => {
        processed[config.type] = 0;
      });

      // Aplicar valores da API
      events.forEach((event) => {
        if (processed.hasOwnProperty(event.event_type)) {
          processed[event.event_type] = event.virtual_count || 0;
        }
      });

      return processed;
    },
    [eventTypeConfigs]
  );

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (isOpen && entityId && !disableAutoLoad) {
      analyticsActions.loadEvents(
        entityId,
        startDate || undefined,
        endDate || undefined
      );
      analyticsActions.clearError();
    }
  }, [isOpen, entityId, disableAutoLoad, analyticsActions, startDate, endDate]);

  // Processar dados quando chegarem
  useEffect(() => {
    // Não processar se:
    // 1. Não há eventos
    // 2. Está em modo de edição
    // 3. Acabamos de salvar (justSavedRef é true)
    if (!analyticsData.events || analyticsData.events.length === 0) {
      return;
    }

    if (isEditing || justSavedRef.current) {
      return;
    }

    // Criar uma "assinatura" dos eventos para detectar mudanças reais
    const eventsSignature = JSON.stringify(
      analyticsData.events.map((e) => `${e.event_type}:${e.virtual_count}`)
    );

    // Só processar se os dados realmente mudaram
    if (eventsSignature === lastProcessedEventsRef.current) {
      return;
    }

    const processed = processEventData(analyticsData.events);

    // Atualizar ambos os estados com os novos dados da API
    setEditableEvents(processed);
    setOriginalEvents(processed);

    // Atualizar a referência da última versão processada
    lastProcessedEventsRef.current = eventsSignature;

    // Callback opcional
    if (onDataLoaded) {
      onDataLoaded(analyticsData.events);
    }
  }, [
    analyticsData.events,
    processEventData,
    onDataLoaded,
    eventTypeConfigs,
    isEditing,
  ]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // EDIÇÃO APENAS LOCAL - NÃO ENVIA PARA API
      // Os valores editados ficam apenas em editableEvents (useState)
      // Útil para testes e visualizações sem persistir dados no backend

      // Atualizar originalEvents com os valores editados
      // para que não sejam considerados como "modificações pendentes"
      setOriginalEvents({ ...editableEvents });

      // Marcar que acabamos de salvar para evitar reprocessamento
      justSavedRef.current = true;

      setIsEditing(false);

      // Resetar a flag após 1 segundo
      setTimeout(() => {
        justSavedRef.current = false;
      }, 1000);

      // Valores editados permanecem localmente até:
      // 1. Fechar o modal
      // 2. Clicar em "Atualizar"
      // 3. Aplicar filtros de data
    } catch (error) {
      console.error(`Erro ao processar edição local:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableEvents({ ...originalEvents });
  };

  const updateEventValue = (eventType: string, value: number) => {
    setEditableEvents((prev) => ({
      ...prev,
      [eventType]: Math.max(0, value), // Não permitir valores negativos
    }));
  };

  const handleRefresh = () => {
    setActiveQuickFilter(null);
    analyticsActions.loadEvents(
      entityId,
      startDate || undefined,
      endDate || undefined
    );
  };

  const handleApplyFilter = () => {
    setActiveQuickFilter(null);
    analyticsActions.loadEvents(
      entityId,
      startDate || undefined,
      endDate || undefined
    );
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setActiveQuickFilter(null);
    analyticsActions.loadEvents(entityId);
  };

  // Filtros rápidos
  const handleQuickFilter = (hours: number, filterName: string) => {
    const now = new Date();
    const past = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Formato para datetime-local: "2026-01-11T14:30"
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hour}:${minute}`;
    };

    setStartDate(formatDateTime(past));
    setEndDate(formatDateTime(now));
    setActiveQuickFilter(filterName);

    analyticsActions.loadEvents(
      entityId,
      past.toISOString(),
      now.toISOString()
    );
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Importação dinâmica do componente PDF
      const { default: AnalyticsReportPDF } = await import(
        "@/components/pdf/AnalyticsReportPDF"
      );

      const doc = (
        <AnalyticsReportPDF
          entityId={entityId}
          entityTitle={entityTitle}
          events={editableEvents}
          eventTypeConfigs={eventTypeConfigs}
          metricConfigs={metricConfigs}
          startDate={startDate}
          endDate={endDate}
          detailedEvents={analyticsData.rawEvents || []}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${entityType}-${entityTitle
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const calculateDefaultMetrics = () => {
    const views = editableEvents.view || 0;
    const clicks = editableEvents.click || 0;
    const viewEnds = editableEvents.view_end || 0;

    return {
      totalViews: views,
      totalClicks: clicks,
      completionRate: views > 0 ? (viewEnds / views) * 100 : 0,
      clickThroughRate: views > 0 ? (clicks / views) * 100 : 0,
    };
  };

  const { profile } = useContext(UserContext);

  const defaultMetrics = calculateDefaultMetrics();

  const hasData = Object.values(editableEvents).some((value) => value > 0);
  const hasChanges =
    JSON.stringify(editableEvents) !== JSON.stringify(originalEvents);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-white flex flex-col">
        <DialogTitle className="sr-only">
          {customTitle || `Analytics ${entityType}: ${entityTitle}`}
        </DialogTitle>

        {/* Header Fixo */}
        <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {customTitle ||
                    `Analytics ${
                      entityType.charAt(0).toUpperCase() + entityType.slice(1)
                    }`}
                </h2>
                <p className="text-sm text-gray-500 mt-1 max-w-[500px] truncate">
                  {entityTitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {entityType.toUpperCase()}: {entityTitle}
                  </span>
                  {hasData && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {
                        Object.values(editableEvents).filter((v) => v > 0)
                          .length
                      }{" "}
                      eventos ativos
                    </span>
                  )}
                  {isEditing && hasChanges && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Modificações pendentes
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1 text-xs">ID: {entityId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing && (
                <>
                  {!isMobile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={analyticsData.loading}
                      className="text-gray-700 hover:bg-gray-100"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          analyticsData.loading ? "animate-spin" : ""
                        }`}
                      />
                      Atualizar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={analyticsData.loading}
                      className="text-gray-700 hover:bg-gray-100 mb-6"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          analyticsData.loading ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  )}
                </>
              )}

              {enableEditing &&
                profile?.role?.name?.toLowerCase() === "administrador" && (
                  <>
                    {!isMobile ? (
                      <>
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancel}
                              disabled={isSaving}
                              className="text-gray-700 hover:bg-gray-100"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={
                                isSaving || !analyticsActions.updateEvent
                              }
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {isSaving ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              Salvar
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            disabled={analyticsData.loading || !hasData}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Editar
                          </Button>
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </>
                )}
            </div>
          </div>

          {/* Filtros de Data - Design Melhorado */}
          <div className="mt-6">
            <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Período de Análise
            </Label>

            {/* Filtros em linha única */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtros Rápidos */}
              <Button
                variant={
                  activeQuickFilter === null && !startDate && !endDate
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={handleClearFilter}
                disabled={analyticsData.loading || isEditing || isSaving}
                className={`${
                  activeQuickFilter === null && !startDate && !endDate
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Infinity className="h-4 w-4 mr-2" />
                Todos
              </Button>
              <Button
                variant={activeQuickFilter === "24h" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(24, "24h")}
                disabled={analyticsData.loading || isEditing || isSaving}
                className={`${
                  activeQuickFilter === "24h"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                24h
              </Button>
              <Button
                variant={activeQuickFilter === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(24 * 7, "7d")}
                disabled={analyticsData.loading || isEditing || isSaving}
                className={`${
                  activeQuickFilter === "7d"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />7 dias
              </Button>
              <Button
                variant={activeQuickFilter === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(24 * 30, "30d")}
                disabled={analyticsData.loading || isEditing || isSaving}
                className={`${
                  activeQuickFilter === "30d"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                30 dias
              </Button>

              {/* Separador visual */}
              <div className="h-8 w-px bg-gray-300 mx-1"></div>

              {/* Inputs de Data Customizada - Menores e mais clicáveis */}
              <div className="flex items-center gap-2">
                <div className="w-[180px]">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() =>
                      document.getElementById("startDate")?.showPicker?.()
                    }
                  >
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setActiveQuickFilter(null);
                      }}
                      className="text-xs h-9 pl-2 pr-2 cursor-pointer hover:border-blue-400 focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-75"
                      placeholder="Data início"
                      disabled={analyticsData.loading || isEditing || isSaving}
                    />
                  </div>
                </div>

                <span className="text-gray-400 text-sm">até</span>

                <div className="w-[180px]">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() =>
                      document.getElementById("endDate")?.showPicker?.()
                    }
                  >
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setActiveQuickFilter(null);
                      }}
                      className="text-xs h-9 pl-2 pr-2 cursor-pointer hover:border-blue-400 focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-75"
                      placeholder="Data fim"
                      disabled={analyticsData.loading || isEditing || isSaving}
                    />
                  </div>
                </div>

                {(startDate || endDate) && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApplyFilter}
                    disabled={
                      analyticsData.loading ||
                      isEditing ||
                      isSaving ||
                      (!startDate && !endDate)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9"
                  >
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Aplicar
                  </Button>
                )}
              </div>

              {/* Separador visual */}
              {profile?.role?.name?.toLowerCase() === "administrador" && (
                <>
                  <div className="h-8 w-px bg-gray-300 mx-1"></div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={
                      analyticsData.loading ||
                      isExporting ||
                      !hasData ||
                      isEditing ||
                      isSaving
                    }
                    className="text-gray-700 hover:bg-gray-100 h-9"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Exportar PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content com Scroll */}
        <div className="flex-1 overflow-y-auto">
          {analyticsData.loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Carregando analytics...</p>
                <p className="text-xs text-gray-400 mt-2">
                  {entityType}: {entityId}
                </p>
              </div>
            </div>
          ) : analyticsData.error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-red-800 font-medium mb-2">
                    Erro ao carregar dados
                  </h3>
                  <p className="text-red-600 text-sm mb-4">
                    {analyticsData.error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-800 font-medium mb-2">
                    Nenhum dado encontrado
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {customDescription ||
                      `Este ${entityType} ainda não possui eventos registrados.`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar Novamente
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Métricas Principais */}
              {metricConfigs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metricConfigs.map((metric) => {
                    const Icon = metric.icon;
                    const value = metric.calculation(editableEvents);

                    return (
                      <Card
                        key={metric.key}
                        className={`${metric.bgColor} border-opacity-50`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`text-sm font-medium ${metric.color
                                  .replace("text-", "text-")
                                  .replace("-600", "-700")}`}
                              >
                                {metric.label}
                              </p>
                              <p
                                className={`text-3xl font-bold ${metric.color
                                  .replace("text-", "text-")
                                  .replace("-600", "-900")}`}
                              >
                                {typeof value === "number"
                                  ? value.toLocaleString()
                                  : value}
                              </p>
                            </div>
                            <Icon className={`h-8 w-8 ${metric.color}`} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // Métricas padrão
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Total Views
                          </p>
                          <p className="text-3xl font-bold text-blue-900">
                            {defaultMetrics.totalViews.toLocaleString()}
                          </p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">
                            Total Clicks
                          </p>
                          <p className="text-3xl font-bold text-purple-900">
                            {defaultMetrics.totalClicks.toLocaleString()}
                          </p>
                        </div>
                        <MousePointer className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            Taxa Conclusão
                          </p>
                          <p className="text-3xl font-bold text-green-900">
                            {defaultMetrics.completionRate.toFixed(1)}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-700">
                            CTR
                          </p>
                          <p className="text-3xl font-bold text-orange-900">
                            {defaultMetrics.clickThroughRate.toFixed(1)}%
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Detalhamento por Tipo de Evento */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalhamento por Tipo de Evento
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {eventTypeConfigs.map((config) => {
                    const Icon = config.icon;
                    const value = editableEvents[config.type] || 0;
                    const originalValue = originalEvents[config.type] || 0;
                    const hasChanged = isEditing && value !== originalValue;

                    return (
                      <Card
                        key={config.type}
                        className={`transition-all duration-200 ${
                          config.borderColor || "border-gray-200"
                        } ${
                          hasChanged ? "ring-2 ring-blue-400 shadow-lg" : ""
                        } hover:shadow-md`}
                      >
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${config.bgColor}`}>
                              <Icon className={`h-5 w-5 ${config.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {config.label}
                                </h4>
                                {hasChanged && (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Modificado
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-normal mt-1">
                                {config.description}
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="pt-0">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <Label
                                  htmlFor={`event-${config.type}`}
                                  className="text-xs text-gray-500"
                                >
                                  Valor original:{" "}
                                  {originalValue.toLocaleString()}
                                </Label>
                                <Input
                                  id={`event-${config.type}`}
                                  type="number"
                                  min="0"
                                  value={value}
                                  onChange={(e) =>
                                    updateEventValue(
                                      config.type,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className={`text-lg font-bold mt-1 ${
                                    hasChanged
                                      ? "border-blue-400 ring-1 ring-blue-400"
                                      : ""
                                  }`}
                                  placeholder="Digite o novo valor"
                                />
                              </div>

                              {hasChanged && (
                                <div className="text-xs text-blue-600 flex items-center justify-between">
                                  <span>Alteração:</span>
                                  <span className="font-medium">
                                    {originalValue.toLocaleString()} →{" "}
                                    {value.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div
                                className={`text-3xl font-bold ${config.color}`}
                              >
                                {value.toLocaleString()}
                              </div>

                              {/* Mostrar porcentagem em relação aos views */}
                              {config.type !== "view" &&
                                defaultMetrics.totalViews > 0 &&
                                value > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {(
                                      (value / defaultMetrics.totalViews) *
                                      100
                                    ).toFixed(1)}
                                    % do total de visualizações
                                  </div>
                                )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              {/* Informações Contextuais */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Como interpretar as métricas
                </h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="space-y-2">
                    <p>
                      <strong>Taxa de Conclusão:</strong> (Leituras Completas ÷
                      Visualizações) × 100. Mede o engajamento do usuário até o
                      fim do conteúdo.
                    </p>
                    <p>
                      <strong>CTR:</strong> (Cliques ÷ Visualizações) × 100.
                      Indica a proporção de usuários que clicaram em algum
                      elemento.
                    </p>
                    <p>
                      <strong>Atualização:</strong> Os dados são atualizados em
                      tempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

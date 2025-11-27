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
  MessageCircle,
  MapPin,
  User,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import type { LucideIcon } from "lucide-react";
import { is } from "date-fns/locale";

export interface GenericEvent {
  event_type: string;
  virtual_count: number;
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
}

export interface AnalyticsActions {
  loadEvents: (entityId: string) => Promise<void>;
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
  enableDebug = false,
  customTitle,
  customDescription,
  disableAutoLoad = false,
  isMobile: propIsMobile,
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
  const isMobile = useIsMobile();

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
      analyticsActions.loadEvents(entityId);
      analyticsActions.clearError();
    }
  }, [isOpen, entityId, disableAutoLoad, analyticsActions]);

  // Processar dados quando chegarem
  useEffect(() => {
    if (analyticsData.events && analyticsData.events.length > 0) {
      const processed = processEventData(analyticsData.events);
      setEditableEvents(processed);
      setOriginalEvents(processed);

      // Callback opcional
      if (onDataLoaded) {
        onDataLoaded(analyticsData.events);
      }
    }
  }, [analyticsData.events, processEventData, onDataLoaded, eventTypeConfigs]);

  const handleSave = async () => {
    if (!analyticsActions.updateEvent) {
      return;
    }

    setIsSaving(true);

    try {
      // Atualizar apenas eventos que mudaram
      for (const [eventType, newValue] of Object.entries(editableEvents)) {
        const originalValue = originalEvents[eventType] || 0;

        if (newValue !== originalValue) {
          await analyticsActions.updateEvent(entityId, eventType, newValue);

          // Callback opcional
          if (onEventUpdated) {
            onEventUpdated(eventType, newValue);
          }
        }
      }

      setIsEditing(false);

      // Recarregar dados
      setTimeout(() => {
        analyticsActions.loadEvents(entityId);
      }, 500);
    } catch (error) {
      console.error(` Erro ao atualizar ${entityType} analytics:`, error);
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
    analyticsActions.loadEvents(entityId);
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

  const userPermissions = useMemo(() => {
    return {
      isChiefEditor:
        profile?.role?.name?.toLowerCase() === "chefe de redação" ||
        profile?.chiefEditor !== null,
      isAdmin: profile?.role?.name?.toLowerCase() === "administrador",
      userId: profile?.id,
      userRole: profile?.role?.name,
      profile,
    };
  }, [profile]);

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

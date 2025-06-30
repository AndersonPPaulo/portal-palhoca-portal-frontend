"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Eye,
  MousePointer,
  Calendar,
  TrendingUp,
  Save,
  RefreshCw,
  MessageCircle,
  MapPin,
  User,
  BarChart3,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { ArticleAnalyticsContext } from "@/providers/analytics";
import { EventType, type ArticleEvent } from "@/providers/analytics";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

export default function AnalyticsModal({
  isOpen,
  onClose,
  articleId,
  articleTitle,
}: AnalyticsModalProps) {
  const {
    GetEventsByArticle,
    UpdateVirtualEvent,
    articleEvents,
    loading,
    error,
    ClearError,
  } = useContext(ArticleAnalyticsContext);

  // Estados para edição
  const [editableEvents, setEditableEvents] = useState<
    Record<EventType, number>
  >({
    [EventType.VIEW]: 0,
    [EventType.VIEW_END]: 0,
    [EventType.CLICK]: 0,
    [EventType.WHATSAPP_CLICK]: 0,
    [EventType.MAP_CLICK]: 0,
    [EventType.PROFILE_VIEW]: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // // Debug: Log para verificar se os dados estão chegando
  // useEffect(() => {
  //   console.log("🔍 articleEvents:", articleEvents);
  //   console.log("🔍 articleId:", articleId);
  //   console.log("🔍 articleEvents[articleId]:", articleEvents[articleId]);
  // }, [articleEvents, articleId]);

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && articleId && typeof GetEventsByArticle === "function") {
      // console.log("📊 Buscando eventos para o artigo:", articleId);
      GetEventsByArticle(articleId);
    }
    if (typeof ClearError === "function") {
      ClearError();
    }
  }, [articleId]);

  // Atualizar estados quando os dados chegarem
  useEffect(() => {
    if (articleId && articleEvents && articleEvents[articleId]) {
      const events = articleEvents[articleId];
      // console.log("📈 Eventos encontrados:", events);

      const newEditableEvents = { ...editableEvents };

      // Primeiro, resetar todos os valores para 0
      Object.keys(newEditableEvents).forEach((key) => {
        newEditableEvents[key as EventType] = 0;
      });

      // Depois, atualizar com os valores da API
      events.forEach((event: ArticleEvent) => {
        newEditableEvents[event.event_type] = event.virtual_count;
        // console.log(`📊 ${event.event_type}: ${event.virtual_count}`);
      });

      setEditableEvents(newEditableEvents);
    } else {
      // console.log("⚠️ Nenhum evento encontrado para o artigo:", articleId);
    }
  }, [articleId, articleEvents]);

  // Função para salvar alterações
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Atualizar cada tipo de evento
      for (const [eventType, count] of Object.entries(editableEvents)) {
        await UpdateVirtualEvent({
          article_id: articleId,
          eventType: eventType as EventType,
          newVirtualCount: count,
        });
      }

      // console.log("✅ Estatísticas atualizadas com sucesso!");
      setIsEditing(false);

      // Recarregar dados
      await GetEventsByArticle(articleId);
    } catch (error) {
      // console.error("❌ Erro ao atualizar estatísticas:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para cancelar edição
  const handleCancel = () => {
    setIsEditing(false);
    // Resetar para valores originais
    if (articleEvents[articleId]) {
      const events = articleEvents[articleId];
      const resetEvents = { ...editableEvents };

      // Resetar todos para 0 primeiro
      Object.keys(resetEvents).forEach((key) => {
        resetEvents[key as EventType] = 0;
      });

      // Aplicar valores originais
      events.forEach((event: ArticleEvent) => {
        resetEvents[event.event_type] = event.virtual_count;
      });

      setEditableEvents(resetEvents);
    }
  };

  // Atualizar valor específico
  const updateEventValue = (eventType: EventType, value: number) => {
    setEditableEvents((prev) => ({
      ...prev,
      [eventType]: Math.max(0, value), // Não permitir valores negativos
    }));
  };

  // Configuração dos tipos de evento para exibição
  const eventConfig = [
    {
      type: EventType.VIEW,
      label: "Visualizações",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total de visualizações do artigo",
    },
    {
      type: EventType.VIEW_END,
      label: "Leituras Completas",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Usuários que chegaram ao final do artigo",
    },
    {
      type: EventType.CLICK,
      label: "Cliques",
      icon: MousePointer,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total de cliques no artigo",
    },
    {
      type: EventType.WHATSAPP_CLICK,
      label: "Cliques WhatsApp",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Cliques no botão WhatsApp",
    },
    {
      type: EventType.MAP_CLICK,
      label: "Cliques no Mapa",
      icon: MapPin,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Cliques em mapas ou localização",
    },
    {
      type: EventType.PROFILE_VIEW,
      label: "Visualizações de Perfil",
      icon: User,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Visualizações de perfil relacionadas",
    },
  ];

  // Calcular totais e métricas
  const totalViews = editableEvents[EventType.VIEW] || 0;
  const totalClicks = editableEvents[EventType.CLICK] || 0;
  const completionRate =
    totalViews > 0
      ? ((editableEvents[EventType.VIEW_END] || 0) / totalViews) * 100
      : 0;
  const clickThroughRate =
    totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 bg-white">
        <DialogTitle className="sr-only">
          Analytics do Artigo: {articleTitle}
        </DialogTitle>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Analytics do Artigo
              </h2>
              <p className="text-sm text-gray-500 truncate max-w-[400px]">
                {articleTitle}
              </p>
              {/* Debug info */}
              <p className="text-xs text-gray-400">
                ID: {articleId} | Eventos:{" "}
                {articleEvents[articleId]?.length || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
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
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">
                Carregando estatísticas...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-600 mb-2">Erro ao carregar dados:</p>
                <p className="text-gray-500 text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => GetEventsByArticle(articleId)}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Métricas Principais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Total Views</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalViews.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MousePointer className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Total Clicks</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {totalClicks.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Taxa Conclusão
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {completionRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">CTR</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {clickThroughRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes por Tipo de Evento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Detalhamento por Evento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventConfig.map((config) => {
                    const Icon = config.icon;
                    const value = editableEvents[config.type] || 0;

                    return (
                      <Card key={config.type} className="relative">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div>
                              <div>{config.label}</div>
                              <div className="text-xs text-gray-500 font-normal">
                                {config.description}
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Label
                                htmlFor={`event-${config.type}`}
                                className="text-xs text-gray-500"
                              >
                                Valor atual: {value.toLocaleString()}
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
                                className="text-lg font-bold"
                              />
                            </div>
                          ) : (
                            <div
                              className={`text-2xl font-bold ${config.color}`}
                            >
                              {value.toLocaleString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Debug section - remover em produção */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium mb-2 text-yellow-800">
                    Debug Info
                  </h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>Article ID: {articleId}</p>
                    <p>
                      Events loaded: {articleEvents[articleId]?.length || 0}
                    </p>
                    <p>Loading: {loading ? "true" : "false"}</p>
                    <p>Error: {error || "none"}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer">
                        Raw Events Data
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(articleEvents[articleId], null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Informações</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    • <strong>Visualizações:</strong> Contabilizadas quando o
                    artigo é carregado
                  </p>
                  <p>
                    • <strong>Leituras Completas:</strong> Usuários que
                    scrollaram até o botão WhatsApp
                  </p>
                  <p>
                    • <strong>Cliques:</strong> Interações gerais com o artigo
                  </p>
                  <p>
                    • <strong>Taxa de Conclusão:</strong> (Leituras Completas /
                    Visualizações) × 100
                  </p>
                  <p>
                    • <strong>CTR:</strong> (Cliques / Visualizações) × 100
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

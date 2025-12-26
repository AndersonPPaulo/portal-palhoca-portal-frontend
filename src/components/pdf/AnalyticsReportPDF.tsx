import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  EventTypeConfig,
  MetricConfig,
} from "../Modals/AnalyticsModal/index";

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 3,
  },
  entityId: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "bold",
    marginBottom: 3,
  },
  entityTitle: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "bold",
    marginBottom: 3,
  },
  periodText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "bold",
  },
  metricsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48%",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    border: "1 solid #e2e8f0",
  },
  metricLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginTop: 20,
    marginBottom: 10,
  },
  eventContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    border: "1 solid #e2e8f0",
    borderRadius: 4,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eventLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#334155",
  },
  eventValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  eventDescription: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
  },
  emptyState: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
  infoBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    border: "1 solid #bfdbfe",
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 3,
  },
  detailedEventsSection: {
    marginTop: 20,
  },
  detailedEventCard: {
    marginBottom: 6,
    padding: 8,
    backgroundColor: "#ffffff",
    border: "1 solid #e2e8f0",
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailedEventInfo: {
    flex: 1,
  },
  detailedEventType: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  detailedEventTime: {
    fontSize: 7,
    color: "#64748b",
  },
  eventTypeHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1 solid #e2e8f0",
  },
  eventTypeCount: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 6,
  },
});

export interface DetailedEvent {
  event_type: string;
  timestamp?: string;
  extra_data?: Record<string, unknown>;
}

interface AnalyticsReportPDFProps {
  entityId: string;
  entityTitle: string;
  events: Record<string, number>;
  eventTypeConfigs: EventTypeConfig[];
  metricConfigs?: MetricConfig[];
  startDate?: string;
  endDate?: string;
  detailedEvents?: DetailedEvent[];
}

const AnalyticsReportPDF: React.FC<AnalyticsReportPDFProps> = ({
  entityId,
  entityTitle,
  events,
  eventTypeConfigs,
  metricConfigs,
  startDate,
  endDate,
  detailedEvents = [],
}) => {
  const formatPeriod = () => {
    if (!startDate && !endDate) {
      return "Todos os períodos";
    }

    try {
      const start = startDate
        ? format(new Date(startDate), "dd/MM/yyyy HH:mm", { locale: ptBR })
        : "Início";
      const end = endDate
        ? format(new Date(endDate), "dd/MM/yyyy HH:mm", { locale: ptBR })
        : "Fim";
      return `${start} até ${end}`;
    } catch {
      return startDate && endDate
        ? `${startDate} até ${endDate}`
        : "Todos os períodos";
    }
  };

  const calculateMetrics = () => {
    if (metricConfigs) {
      return metricConfigs.map((metric) => ({
        label: metric.label,
        value: metric.calculation(events),
      }));
    }

    // Métricas padrão
    const views = events.view || 0;
    const clicks = events.click || 0;
    const viewEnds = events.view_end || 0;

    return [
      { label: "Total Views", value: views.toLocaleString() },
      { label: "Total Clicks", value: clicks.toLocaleString() },
      {
        label: "Taxa Conclusão",
        value: views > 0 ? `${((viewEnds / views) * 100).toFixed(1)}%` : "0%",
      },
      {
        label: "CTR",
        value: views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : "0%",
      },
    ];
  };

  const metrics = calculateMetrics();
  const hasData = Object.values(events).some((value) => value > 0);

  // Filtrar apenas eventos que têm timestamp (eventos individuais reais)
  const eventsWithTimestamp = detailedEvents.filter((event) => event.timestamp);

  // Agrupar eventos detalhados por tipo
  const groupedDetailedEvents = eventsWithTimestamp.reduce((acc, event) => {
    if (!acc[event.event_type]) {
      acc[event.event_type] = [];
    }
    acc[event.event_type].push(event);
    return acc;
  }, {} as Record<string, DetailedEvent[]>);

  // Ordenar eventos dentro de cada grupo por timestamp (mais recente primeiro)
  Object.keys(groupedDetailedEvents).forEach((eventType) => {
    groupedDetailedEvents[eventType].sort(
      (a, b) =>
        new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    );
  });

  // Formatar timestamp para exibição
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Data indisponível";
    try {
      return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm:ss", {
        locale: ptBR,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Si3 Portais - Relatório Analítico</Text>
          <Text style={styles.entityTitle}>{entityTitle}</Text>
          <Text style={styles.periodText}>Período: {formatPeriod()}</Text>
          <Text style={styles.entityId}>ID: {entityId}</Text>
        </View>

        {hasData ? (
          <>
            {/* Métricas Principais */}
            <View style={styles.metricsContainer}>
              <Text style={styles.sectionTitle}>Métricas Principais</Text>
              <View style={styles.metricsGrid}>
                {metrics.map((metric, index) => (
                  <View key={index} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>
                      {typeof metric.value === "number"
                        ? metric.value.toLocaleString()
                        : metric.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Detalhamento por Evento */}
            <View>
              <Text style={styles.sectionTitle}>Detalhamento por Evento</Text>
              {eventTypeConfigs.map((config) => {
                const value = events[config.type] || 0;
                const totalViews = events.view || 0;
                const percentage =
                  config.type !== "view" && totalViews > 0
                    ? ((value / totalViews) * 100).toFixed(1)
                    : null;

                return (
                  <View key={config.type} style={styles.eventContainer}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventLabel}>{config.label}</Text>
                      <Text style={styles.eventValue}>
                        {value.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.eventDescription}>
                      {config.description}
                    </Text>
                    {percentage && (
                      <Text style={styles.eventDescription}>
                        {percentage}% do total de visualizações
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Informações Contextuais */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Como interpretar as métricas</Text>
              <Text style={styles.infoText}>
                • Taxa de Conclusão: (Leituras Completas ÷ Visualizações) × 100.
                Mede o engajamento até o fim do conteúdo.
              </Text>
              <Text style={styles.infoText}>
                • CTR: (Cliques ÷ Visualizações) × 100. Indica a proporção de
                usuários que clicaram.
              </Text>
              <Text style={styles.infoText}>
                • Os dados refletem o período selecionado ou todo o histórico.
              </Text>
            </View>

            {/* Listagem Detalhada de Eventos */}
            {eventsWithTimestamp.length > 0 && (
              <View style={styles.detailedEventsSection} break>
                <Text style={styles.sectionTitle}>
                  Listagem Detalhada de Todos os Eventos (
                  {eventsWithTimestamp.length} eventos)
                </Text>
                {eventTypeConfigs.map((config) => {
                  const eventsOfType = groupedDetailedEvents[config.type] || [];
                  if (eventsOfType.length === 0) return null;

                  return (
                    <View key={config.type}>
                      <Text style={styles.eventTypeHeader}>
                        {config.label} ({eventsOfType.length})
                      </Text>
                      {eventsOfType.map((event, index) => (
                        <View key={index} style={styles.detailedEventCard}>
                          <View style={styles.detailedEventInfo}>
                            <Text style={styles.detailedEventType}>
                              {config.label} #{index + 1}
                            </Text>
                            <Text style={styles.detailedEventTime}>
                              {formatTimestamp(event.timestamp)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text>Nenhum dado encontrado para o período selecionado.</Text>
          </View>
        )}

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>
            Relatório gerado em{" "}
            {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
          <Text>
            {hasData
              ? `Total de eventos registrados: ${Object.values(events).reduce(
                  (a, b) => a + b,
                  0
                )}`
              : "Nenhum evento registrado"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default AnalyticsReportPDF;

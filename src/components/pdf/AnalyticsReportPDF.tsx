import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PdfImage,
  pdf,
  type DocumentProps,
} from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  EntityDetail,
  EventTypeConfig,
  MetricConfig,
} from "../Modals/AnalyticsModal/index";

// Área útil da página A4 (595pt) descontando o padding lateral
const CONTENT_WIDTH = 535;
const IMAGE_BOX_PADDING = 12;
const IMAGE_MAX_HEIGHT = 180;

// Linhas da tabela por dia em cada página (cabe com folga na área útil do A4)
const DAILY_ROWS_PER_PAGE = 35;
// Páginas da tabela renderizadas por vez (ver generateAnalyticsReport)
const DAILY_PAGES_PER_CHUNK = 20;

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 70,
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
  bannerCard: {
    border: "1 solid #e2e8f0",
    borderRadius: 6,
  },
  bannerImageBox: {
    padding: IMAGE_BOX_PADDING,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  bannerDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  detailLabel: {
    fontSize: 7,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
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
  tableTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
  },
  tableSubtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 3,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottom: "1 solid #f1f5f9",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 9,
    color: "#334155",
  },
  tableCellMuted: {
    color: "#94a3b8",
  },
  tableCellViews: {
    fontWeight: "bold",
    color: "#1e40af",
  },
  colIndex: { width: "8%" },
  colDate: { width: "26%" },
  colWeekday: { width: "36%" },
  colViews: { width: "30%", textAlign: "right" },
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
});

export interface DetailedEvent {
  event_type: string;
  timestamp?: string;
  extra_data?: Record<string, unknown>;
}

export interface ReportImage {
  src: string;
  width: number;
  height: number;
}

// O react-pdf só aceita PNG/JPG: baixa a imagem e converte qualquer formato
// (WebP, GIF...) para JPEG via canvas, já reduzindo imagens muito grandes
export async function loadReportImage(
  url: string,
  maxSize = 1600,
): Promise<ReportImage | null> {
  try {
    // no-store evita reaproveitar a resposta sem CORS cacheada pela tag <img>
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Fundo branco para imagens com transparência (JPEG não tem alpha)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return {
      src: canvas.toDataURL("image/jpeg", 0.9),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error("Erro ao carregar imagem para o PDF:", error);
    return null;
  }
}

interface AnalyticsReportPDFProps {
  entityId: string;
  entityTitle: string;
  entityType?: string;
  entityImage?: ReportImage | null;
  entityDetails?: EntityDetail[];
  events: Record<string, number>;
  eventTypeConfigs: EventTypeConfig[];
  metricConfigs?: MetricConfig[];
  startDate?: string;
  endDate?: string;
  detailedEvents?: DetailedEvent[];
  dailyViews?: DailyViews[];
  generatedAt?: Date;
  extraPages?: number; // páginas da tabela por dia anexadas depois do resumo
}

interface DailyViews {
  day: string; // "YYYY-MM-DD", já no horário de Brasília
  views: number;
}

interface DailyRow {
  number: number;
  day: string;
  weekday: string;
  views: string;
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

// Tabela de visualizações por dia, do mais recente ao mais antigo, já
// formatada e dividida em páginas de tamanho fixo. O dia é lido como data
// local, sem conversão de fuso (new Date("YYYY-MM-DD") cairia no dia anterior)
const buildDailyPages = (dailyViews: DailyViews[] = []): DailyRow[][] => {
  const rows = dailyViews
    .filter((item) => item.views > 0 && /^\d{4}-\d{2}-\d{2}$/.test(item.day))
    .sort((a, b) => b.day.localeCompare(a.day))
    .map((item, index) => {
      const date = parse(item.day, "yyyy-MM-dd", new Date());
      return {
        number: index + 1,
        day: format(date, "dd/MM/yyyy"),
        weekday: capitalize(format(date, "EEEE", { locale: ptBR })),
        views: item.views.toLocaleString("pt-BR"),
      };
    });

  const pages: DailyRow[][] = [];
  for (let i = 0; i < rows.length; i += DAILY_ROWS_PER_PAGE) {
    pages.push(rows.slice(i, i + DAILY_ROWS_PER_PAGE));
  }
  return pages;
};

const getEventsFooterText = (events: Record<string, number>) => {
  const total = Object.values(events).reduce((a, b) => a + b, 0);
  return total > 0
    ? `Total de eventos registrados: ${total.toLocaleString("pt-BR")}`
    : "Nenhum evento registrado";
};

interface ReportFooterProps {
  generatedAt: Date;
  eventsText: string;
  // Paginação já calculada; sem ela, o react-pdf numera (+ extraPages no total)
  pageText?: string;
  extraPages?: number;
}

const ReportFooter = ({
  generatedAt,
  eventsText,
  pageText,
  extraPages = 0,
}: ReportFooterProps) => (
  <View style={styles.footer} fixed>
    <Text>
      Relatório gerado em{" "}
      {format(generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
    </Text>
    {pageText ? (
      <Text>
        {eventsText}  ·  {pageText}
      </Text>
    ) : (
      <Text
        render={({ pageNumber, totalPages }) =>
          `${eventsText}  ·  Página ${pageNumber} de ${totalPages + extraPages}`
        }
      />
    )}
  </View>
);

const AnalyticsReportPDF: React.FC<AnalyticsReportPDFProps> = ({
  entityId,
  entityTitle,
  entityType,
  entityImage,
  entityDetails = [],
  events,
  eventTypeConfigs,
  metricConfigs,
  startDate,
  endDate,
  detailedEvents = [],
  generatedAt = new Date(),
  extraPages = 0,
}) => {
  const isBanner = entityType === "banner";

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
        value: metric.calculation(events, detailedEvents),
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
  // 3 cards por linha quando a quantidade fecha linhas inteiras (ex.: banner)
  const metricCardWidth = metrics.length % 3 === 0 ? "32%" : "48%";

  const visibleDetails = entityDetails.filter((detail) => detail.value);

  // Dimensões da imagem respeitando a proporção original
  const imageSize = (() => {
    if (!entityImage) return null;
    const ratio = entityImage.width / entityImage.height;
    const maxWidth = CONTENT_WIDTH - IMAGE_BOX_PADDING * 2;
    const width = Math.min(maxWidth, IMAGE_MAX_HEIGHT * ratio);
    return { width, height: width / ratio };
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Si3 Portais - Relatório Analítico</Text>
          <Text style={styles.entityTitle}>{entityTitle}</Text>
          <Text style={styles.periodText}>Período: {formatPeriod()}</Text>
          {/* O ID do banner é dado sensível e não vai para o relatório */}
          {!isBanner && <Text style={styles.entityId}>ID: {entityId}</Text>}
        </View>

        {/* Imagem e dados do banner */}
        {isBanner && (imageSize || visibleDetails.length > 0) && (
          <View style={styles.bannerCard} wrap={false}>
            {entityImage && imageSize && (
              <View style={styles.bannerImageBox}>
                <PdfImage src={entityImage.src} style={imageSize} />
              </View>
            )}
            {visibleDetails.length > 0 && (
              <View style={styles.bannerDetails}>
                {visibleDetails.map((detail) => (
                  <View key={detail.label}>
                    <Text style={styles.detailLabel}>{detail.label}</Text>
                    <Text style={styles.detailValue}>{detail.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {hasData ? (
          <>
            {/* Métricas Principais */}
            <View style={styles.metricsContainer}>
              <Text style={styles.sectionTitle}>Métricas Principais</Text>
              <View style={styles.metricsGrid}>
                {metrics.map((metric, index) => (
                  <View
                    key={index}
                    style={[styles.metricCard, { width: metricCardWidth }]}
                  >
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
                const totalPrints = events.print || 0;
                const totalClicks = events.click || 0;

                // Lógica especial para view_source em company ou article
                if (config.type === "view_source" && (entityType === "company" || entityType === "article")) {
                  const portalViews = totalClicks;
                  const externalViews = totalViews - totalClicks;
                  const portalPercent = totalViews > 0 ? ((portalViews / totalViews) * 100).toFixed(1) : "0";
                  const externalPercent = totalViews > 0 ? ((externalViews / totalViews) * 100).toFixed(1) : "0";

                  return (
                    <View key={config.type} style={styles.eventContainer}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventLabel}>{config.label}</Text>
                        <Text style={styles.eventValue}>
                          Total: {totalViews.toLocaleString()}
                        </Text>
                      </View>
                      <Text style={styles.eventDescription}>
                        {config.description}
                      </Text>
                      <Text style={styles.eventDescription}>
                        Portal: {portalPercent}% ({portalViews}) | Externa: {externalPercent}% ({externalViews})
                      </Text>
                    </View>
                  );
                }

                // Percentagem em relação a impressões para view em company
                const viewPercentage =
                  config.type === "view" && entityType === "company" && totalPrints > 0
                    ? ((value / totalPrints) * 100).toFixed(1)
                    : null;

                // Percentagem padrão em relação a views
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
                    {viewPercentage && (
                      <Text style={styles.eventDescription}>
                        {viewPercentage}% das impressões
                      </Text>
                    )}
                    {percentage && (
                      <Text style={styles.eventDescription}>
                        {percentage}% do total de visualizações
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Informações Contextuais - não exibir para company e banner */}
            {entityType !== "company" && entityType !== "banner" && (
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
            )}

          </>
        ) : (
          <View style={styles.emptyState}>
            <Text>Nenhum dado encontrado para o período selecionado.</Text>
          </View>
        )}

        <ReportFooter
          generatedAt={generatedAt}
          eventsText={getEventsFooterText(events)}
          extraPages={extraPages}
        />
      </Page>
    </Document>
  );
};

interface DailyPagesPDFProps {
  pages: DailyRow[][];
  firstPageIndex: number; // posição da primeira página dentro da tabela
  firstPageNumber: number; // número da primeira página no relatório final
  totalPages: number;
  entityTitle: string;
  summaryText: string;
  eventsText: string;
  generatedAt: Date;
}

// Páginas da tabela de visualizações por dia, montadas manualmente
const DailyPagesPDF = ({
  pages,
  firstPageIndex,
  firstPageNumber,
  totalPages,
  entityTitle,
  summaryText,
  eventsText,
  generatedAt,
}: DailyPagesPDFProps) => (
  <Document>
    {pages.map((rows, pageIndex) => (
      <Page key={pageIndex} size="A4" style={styles.page}>
        <View>
          <Text style={styles.tableTitle}>
            Visualizações por Dia
            {firstPageIndex + pageIndex > 0 ? " (continuação)" : ""}
          </Text>
          <Text style={styles.tableSubtitle}>
            {entityTitle}  ·  {summaryText}
          </Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colIndex]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Data</Text>
            <Text style={[styles.tableHeaderCell, styles.colWeekday]}>
              Dia da semana
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colViews]}>
              Total de visualizações
            </Text>
          </View>
        </View>

        {rows.map((row) => (
          <View
            key={row.number}
            style={[
              styles.tableRow,
              row.number % 2 === 0 ? styles.tableRowAlt : {},
            ]}
          >
            <Text
              style={[styles.tableCell, styles.tableCellMuted, styles.colIndex]}
            >
              {row.number}
            </Text>
            <Text style={[styles.tableCell, styles.colDate]}>{row.day}</Text>
            <Text style={[styles.tableCell, styles.colWeekday]}>
              {row.weekday}
            </Text>
            <Text
              style={[styles.tableCell, styles.tableCellViews, styles.colViews]}
            >
              {row.views}
            </Text>
          </View>
        ))}

        <ReportFooter
          generatedAt={generatedAt}
          eventsText={eventsText}
          pageText={`Página ${firstPageNumber + pageIndex} de ${totalPages}`}
        />
      </Page>
    ))}
  </Document>
);

// Os componentes abaixo sempre retornam um <Document>
const renderToBytes = async (doc: React.ReactElement) =>
  new Uint8Array(
    await (
      await pdf(doc as React.ReactElement<DocumentProps>).toBlob()
    ).arrayBuffer(),
  );

// Gera o relatório completo. O react-pdf fica quadrático em documentos muito
// grandes (percorre a árvore inteira com Array.shift), então a tabela por dia
// é renderizada em blocos de páginas e unida com o pdf-lib. Entre um bloco e
// outro a thread é liberada, e onProgress informa as páginas prontas.
export async function generateAnalyticsReport(
  props: AnalyticsReportPDFProps,
  onProgress?: (pagesDone: number, totalPages: number) => void,
): Promise<Blob> {
  const generatedAt = new Date();
  const hasData = Object.values(props.events).some((value) => value > 0);
  const dailyPages = hasData ? buildDailyPages(props.dailyViews) : [];

  const summaryBytes = await renderToBytes(
    <AnalyticsReportPDF
      {...props}
      generatedAt={generatedAt}
      extraPages={dailyPages.length}
    />,
  );
  if (dailyPages.length === 0) {
    return new Blob([summaryBytes], { type: "application/pdf" });
  }

  const merged = await PDFDocument.load(summaryBytes);
  const summaryPages = merged.getPageCount();
  const totalPages = summaryPages + dailyPages.length;
  const daysCount = dailyPages.reduce((sum, rows) => sum + rows.length, 0);
  const summaryText = `${daysCount.toLocaleString("pt-BR")} ${
    daysCount === 1 ? "dia" : "dias"
  } com visualizações no período (horário de Brasília), do mais recente para o mais antigo`;
  const eventsText = getEventsFooterText(props.events);
  onProgress?.(summaryPages, totalPages);

  for (
    let start = 0;
    start < dailyPages.length;
    start += DAILY_PAGES_PER_CHUNK
  ) {
    const pages = dailyPages.slice(start, start + DAILY_PAGES_PER_CHUNK);
    const chunk = await PDFDocument.load(
      await renderToBytes(
        <DailyPagesPDF
          pages={pages}
          firstPageIndex={start}
          firstPageNumber={summaryPages + start + 1}
          totalPages={totalPages}
          entityTitle={props.entityTitle}
          summaryText={summaryText}
          eventsText={eventsText}
          generatedAt={generatedAt}
        />,
      ),
    );
    const copied = await merged.copyPages(chunk, chunk.getPageIndices());
    copied.forEach((page) => merged.addPage(page));

    onProgress?.(summaryPages + start + pages.length, totalPages);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const bytes = (await merged.save()) as Uint8Array<ArrayBuffer>;
  return new Blob([bytes], { type: "application/pdf" });
}

export default AnalyticsReportPDF;

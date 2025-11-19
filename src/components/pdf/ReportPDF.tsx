import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IArticleEvent,
  IBannerEvent,
  ICompanyEvent,
  ReportType,
} from "@/types/analytics";

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
  periodText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "bold",
  },
  tableContainer: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    padding: 8,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #e2e8f0",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableCell: {
    fontSize: 9,
    color: "#334155",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
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
});

interface ReportPDFProps {
  reportType: ReportType;
  data: IArticleEvent[] | IBannerEvent[] | ICompanyEvent[];
  startDate: string;
  endDate: string;
}

const ReportPDF: React.FC<ReportPDFProps> = ({
  reportType,
  data,
  startDate,
  endDate,
}) => {
  const getReportTitle = () => {
    switch (reportType) {
      case "article":
        return "Relatório de Visualizações de Notícias";
      case "banner":
        return "Relatório de Visualizações de Banners";
      case "company":
        return "Relatório de Interações com Comércios";
      default:
        return "Relatório de Analytics";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  const formatPeriod = () => {
    try {
      const start = format(new Date(startDate), "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      });
      const end = format(new Date(endDate), "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      });
      return `${start} até ${end}`;
    } catch {
      return `${startDate} até ${endDate}`;
    }
  };

  const renderTableHeaders = () => {
    let headers: { label: string; width: string }[] = [];

    switch (reportType) {
      case "article":
        headers = [
          { label: "Data/Hora", width: "25%" },
          { label: "Título da Notícia", width: "35%" },
          { label: "Categoria", width: "20%" },
          { label: "Dispositivo", width: "20%" },
        ];
        break;
      case "banner":
        headers = [
          { label: "Data/Hora", width: "25%" },
          { label: "Nome do Banner", width: "35%" },
          { label: "Estilo", width: "20%" },
          { label: "Ação", width: "20%" },
        ];
        break;
      case "company":
        headers = [
          { label: "Data/Hora", width: "30%" },
          { label: "Nome do Comércio", width: "45%" },
          { label: "Ação", width: "25%" },
        ];
        break;
    }

    return (
      <View style={styles.tableHeader}>
        {headers.map((header, index) => (
          <Text
            key={index}
            style={[styles.tableCellHeader, { width: header.width }]}
          >
            {header.label}
          </Text>
        ))}
      </View>
    );
  };

  const renderTableRow = (
    item: IArticleEvent | IBannerEvent | ICompanyEvent,
    index: number
  ) => {
    const isEven = index % 2 === 0;
    const rowStyle = [
      styles.tableRow,
      isEven ? styles.tableRowEven : styles.tableRowOdd,
    ];

    if (reportType === "article") {
      const articleEvent = item as IArticleEvent;
      return (
        <View key={item.id} style={rowStyle}>
          <Text style={[styles.tableCell, { width: "25%" }]}>
            {formatDate(articleEvent.timestamp)}
          </Text>
          <Text style={[styles.tableCell, { width: "35%" }]}>
            {articleEvent.extra_data.articleTitle}
          </Text>
          <Text style={[styles.tableCell, { width: "20%" }]}>
            {articleEvent.extra_data.categoryName}
          </Text>
          <Text style={[styles.tableCell, { width: "20%" }]}>
            {articleEvent.extra_data.deviceType}
          </Text>
        </View>
      );
    }

    if (reportType === "banner") {
      const bannerEvent = item as IBannerEvent;
      return (
        <View key={item.id} style={rowStyle}>
          <Text style={[styles.tableCell, { width: "25%" }]}>
            {formatDate(bannerEvent.timestamp)}
          </Text>
          <Text style={[styles.tableCell, { width: "35%" }]}>
            {bannerEvent.banner.name}
          </Text>
          <Text style={[styles.tableCell, { width: "20%" }]}>
            {bannerEvent.banner.banner_style}
          </Text>
          <Text style={[styles.tableCell, { width: "20%" }]}>
            {bannerEvent.event_type}
          </Text>
        </View>
      );
    }

    if (reportType === "company") {
      const companyEvent = item as ICompanyEvent;
      return (
        <View key={item.id} style={rowStyle}>
          <Text style={[styles.tableCell, { width: "30%" }]}>
            {formatDate(companyEvent.timestamp)}
          </Text>
          <Text style={[styles.tableCell, { width: "45%" }]}>
            {companyEvent.company.name}
          </Text>
          <Text style={[styles.tableCell, { width: "25%" }]}>
            {companyEvent.event_type}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>{getReportTitle()}</Text>
          <Text style={styles.subtitle}>
            Portal Palhoça - Painel Administrativo
          </Text>
          <Text style={styles.periodText}>Período: {formatPeriod()}</Text>
        </View>

        {/* Tabela */}
        {data.length > 0 ? (
          <View style={styles.tableContainer}>
            {renderTableHeaders()}
            {data.map((item, index) => renderTableRow(item, index))}
          </View>
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
          <Text>Total de registros: {data.length}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;

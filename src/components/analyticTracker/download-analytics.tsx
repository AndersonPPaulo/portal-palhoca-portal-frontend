"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Newspaper, Image as ImageIcon, Store } from "lucide-react";
import DateRangeModal from "@/components/dialog/DateRangeModal";
import { pdf } from "@react-pdf/renderer";
import ReportPDF from "@/components/pdf/ReportPDF";
import { api } from "@/service/api";
import nookies from "nookies";
import { ReportType } from "@/types/analytics";
import { toast } from "sonner";

interface ReportButton {
  type: ReportType;
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  color: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function DownloadAnalytics() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportButtons: ReportButton[] = [
    {
      type: "company",
      label: "Relatório de Comércios",
      icon: <Store className="h-4 w-4" />,
      endpoint: "/analytics/history-company",
      color: "bg-green-600 hover:bg-green-700",
    },

    {
      type: "banner",
      label: "Relatório de Banners",
      icon: <ImageIcon className="h-4 w-4" />,
      endpoint: "/analytics/history-banner",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      type: "article",
      label: "Relatório de Notícias",
      icon: <Newspaper className="h-4 w-4" />,
      endpoint: "/analytics/history-article",
      color: "bg-blue-600 hover:bg-blue-700",
    },
  ];

  const handleOpenModal = (reportType: ReportType) => {
    setSelectedReport(reportType);
    setIsModalOpen(true);
  };

  const handleGenerateReport = async (startDate: string, endDate: string) => {
    if (!selectedReport) return;

    setIsGenerating(true);
    const loadingToast = toast.loading("Gerando relatório...");

    try {
      const cookies = nookies.get(null);
      const token = cookies["user:token"];

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const currentReport = reportButtons.find(
        (r) => r.type === selectedReport
      );
      if (!currentReport) return;

      // Fazer requisição para a API
      const response = await api.get(currentReport.endpoint, {
        params: {
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Verificar se há dados
      if (!data || data.length === 0) {
        toast.warning("Nenhum dado encontrado para o período selecionado.", {
          id: loadingToast,
        });
        setIsGenerating(false);
        return;
      }

      // Gerar PDF
      const pdfDocument = (
        <ReportPDF
          reportType={selectedReport}
          data={data}
          startDate={startDate}
          endDate={endDate}
        />
      );

      const blob = await pdf(pdfDocument).toBlob();

      // Download do arquivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const reportName = currentReport.label.toLowerCase().replace(/\s+/g, "-");
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `${reportName}-${dateStr}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Relatório gerado com sucesso!", { id: loadingToast });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Erro ao gerar relatório. Tente novamente.";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const getModalTitle = () => {
    const report = reportButtons.find((r) => r.type === selectedReport);
    return report ? report.label : "Selecionar Período";
  };

  return (
    <>
      <div className="flex h-auto w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Exportar Relatórios
                </h2>
                <p className="text-sm text-gray-600">
                  Gere relatórios em PDF com base no período selecionado
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              {reportButtons.map((report) => (
                <Button
                  key={report.type}
                  onClick={() => handleOpenModal(report.type)}
                  disabled={isGenerating}
                  className={`${report.color} text-white transition-all duration-200 hover:scale-105 shadow-md`}
                >
                  {report.icon}
                  <span className="ml-2">{report.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DateRangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleGenerateReport}
        title={getModalTitle()}
      />
    </>
  );
}

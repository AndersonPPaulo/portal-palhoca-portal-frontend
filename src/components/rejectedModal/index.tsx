"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Article, ArticleContext } from "@/providers/article";

interface RejectedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
}

export function RejectedModal({
  open,
  onOpenChange,
  articleId,
}: RejectedModalProps) {
  const { ListAuthorArticles, listArticles, SelfArticle } =
    useContext(ArticleContext);
  const [rejected, setRejected] = useState<string>("");
  const [rejectionDate, setRejectionDate] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleData, setArticleData] = useState<Article | null>(null);

  // Carregar os dados do artigo quando o modal abrir
  useEffect(() => {
    const fetchArticleData = async () => {
      if (open && articleId) {
        setIsLoading(true);
        try {
          // Primeiro tenta obter do artigo da lista atual
          if (listArticles && listArticles.data) {
            const foundArticle = listArticles.data.find(
              (art) => art.id === articleId
            );
            if (foundArticle) {
              setArticleData(foundArticle);
              processArticleData(foundArticle);
              return;
            }
          }

          // Se não encontrou na lista, busca diretamente
          const fetchedArticle = await SelfArticle(articleId);
          setArticleData(fetchedArticle);
          processArticleData(fetchedArticle);
        } catch (error) {
          console.error("Erro ao buscar dados do artigo:", error);
          setRejected("Não foi possível carregar o motivo da rejeição.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchArticleData();
  }, [open, articleId, SelfArticle, listArticles]);

  // Função para obter a cor do status
  const getStatusColor = (status: string | undefined) => {
    if (!status) {
      return "bg-gray-100 text-gray-800";
    }

    switch (status.toLowerCase()) {
      case "published":
      case "publicado":
        return "bg-green-500 text-white";
      case "draft":
      case "rascunho":
        return "bg-yellow-500 text-white";
      case "pending_review":
      case "review":
      case "revisão":
        return "bg-blue-500 text-white";
      case "rejected":
      case "rejeitado":
        return "bg-red-500 text-white";
      case "changes_requested":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Processar os dados do artigo para encontrar a rejeição
  const processArticleData = (articleData: any) => {
    if (!articleData) return;

    setArticleTitle(articleData.title || "");

    if (articleData.status_history && articleData.status_history.length > 0) {
      // Ordenar o histórico de status pela data (do mais recente para o mais antigo)
      const sortedHistory = [...articleData.status_history].sort(
        (a, b) =>
          new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
      );

      // Encontrar o status de rejeição mais recente
      const recentRejection = sortedHistory.find(
        (history) => history.status === "REJECTED" && history.reason_reject
      );

      if (recentRejection) {
        setRejected(recentRejection.reason_reject || "");
        setRejectionDate(recentRejection.changed_at);
      } else {
        setRejected("");
        setRejectionDate("");
      }
    }
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[800px] h-[95vh] m-0 p-0 rounded-lg flex flex-col">
          <div className="flex flex-col h-full max-h-full">
            {/* Cabeçalho fixo */}
            <DialogHeader className="bg-[#333] text-white py-4 px-6 border-b border-gray-600 flex-shrink-0">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="mr-4 text-white hover:bg-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <DialogTitle className="text-xl font-semibold truncate">
                  Motivo de Rejeição
                </DialogTitle>
              </div>
            </DialogHeader>

            {/* Área de conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Conteúdo principal */}
                  <div className="p-6 bg-white space-y-6">
                    {/* Informações do artigo */}
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h2 className="text-xl font-bold mb-2">{articleTitle}</h2>
                      <p className="text-sm text-gray-500">
                        {rejectionDate && (
                          <span>Rejeitado em: {formatDate(rejectionDate)}</span>
                        )}
                      </p>
                    </div>

                    {/* Conteúdo da rejeição */}
                    <div className="bg-red-50 p-4 rounded-md border border-red-200">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <X className="h-5 w-5 mr-2 text-red-600" />
                        Detalhes da Rejeição
                      </h3>
                      <div className="prose break-words whitespace-pre-wrap text-gray-700 p-4 bg-white rounded border border-red-100 min-h-[100px] max-h-[250px] overflow-auto">
                        {rejected ||
                          "Nenhum motivo específico foi fornecido pelo revisor."}
                      </div>
                    </div>

                    {/* Orientação */}
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">O que fazer agora?</h3>
                      <p className="text-gray-700">
                        Este artigo foi rejeitado e não poderá ser publicado em
                        seu estado atual. Você pode criar um novo artigo,
                        levando em consideração os motivos da rejeição
                        fornecidos acima.
                      </p>
                    </div>
                  </div>

                  {/* Histórico de Status */}
                  {articleData &&
                    articleData.status_history &&
                    articleData.status_history.length > 0 && (
                      <div className="px-6 pb-1 pt-3 bg-white">
                        <h3 className="font-semibold mb-2">
                          Histórico de Status
                        </h3>
                        <div className="overflow-x-auto w-full">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-200">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/6"
                                >
                                  Status
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/5"
                                >
                                  Data
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/3"
                                >
                                  Descrição
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/4"
                                >
                                  Motivo de Rejeição
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {articleData.status_history.map(
                                (history, idx) => (
                                  <tr
                                    key={history.id || idx}
                                    className={
                                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    }
                                  >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm w-1/6">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                          history.status
                                        )}`}
                                      >
                                        {history.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-700 w-1/5">
                                      {formatDate(history.changed_at)}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-700 w-1/3 break-words">
                                      {history.change_request_description ||
                                        "-"}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-700 w-1/4 break-words">
                                      {history.reason_reject || "-"}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Rodapé fixo com ações */}
            <div className="bg-gray-200 py-4 px-6 flex justify-end space-x-4 flex-shrink-0 border-t border-gray-300 mt-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RejectedModal;

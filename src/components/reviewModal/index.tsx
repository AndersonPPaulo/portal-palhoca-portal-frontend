"use client";

import {
  ArrowLeft,
  Eye,
  Calendar,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useContext, useEffect } from "react";
import { format } from "date-fns";
import { ar, ptBR } from "date-fns/locale";
import { ArticleContext, Article } from "@/providers/article";
import { toast } from "sonner";
import { UserContext } from "@/providers/user";
import { useRouter } from "next/navigation";
import HighlightModal from "../../highlightModal";

interface ArticleViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article;
}

export function ArticleViewModal({
  open,
  onOpenChange,
  article,
}: ArticleViewModalProps) {
  const { ListAuthorArticles, UpdateArticle, UpdateArticleStatus } =
    useContext(ArticleContext);

  const { profile } = useContext(UserContext);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [changeRequest, setChangeRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortedStatusHistory, setSortedStatusHistory] = useState(
    article?.status_history || []
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowRejectForm(false);
      setShowChangesForm(false);
      setRejectReason("");
      setChangeRequest("");
      setShowApprovalModal(false);
    } else if (article?.status_history?.length > 0) {
      const sorted = [...article.status_history].sort(
        (a, b) =>
          new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
      );
      setSortedStatusHistory(sorted);
    }
  }, [open, article]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", {
        locale: ptBR,
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";

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

  const getCurrentStatus = () => {
    if (!article?.status_history?.length) {
      return article?.status || "UNKNOWN";
    }

    if (sortedStatusHistory.length > 0) {
      return sortedStatusHistory[0].status;
    }

    const mostRecent = [...article.status_history].sort(
      (a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    )[0];

    return mostRecent?.status || article?.status || "UNKNOWN";
  };

  const currentStatus = getCurrentStatus();
  const { push } = useRouter();

  const handleEditArticleButton = () => {
    if (!article?.id) {
      toast.error("Artigo não encontrado");
      return;
    }
    push(`/postagens/artigos/editar/${article.id}`);
    onOpenChange(false);
  };

  const handleApproveArticle = () => {
    setShowApprovalModal(true);
  };

  const handleApproveFromModal = async (
    isHighlight: boolean,
    highlightPosition?: number
  ) => {
    if (isHighlight && !highlightPosition) {
      toast.error("Por favor, selecione uma posição para o destaque");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isHighlight) {
        await UpdateArticle(
          {
            highlight: true,
            highlight_position: highlightPosition,
            chiefEditorId: article.chiefEditor?.id,
            portalIds: article.portals?.map((portal) => portal.id) || [],
          },
          article.id
        );
      }

      await UpdateArticleStatus(
        {
          newStatus: "PUBLISHED",
        },
        article.id
      );

      setShowApprovalModal(false);
      onOpenChange(false);

      setTimeout(() => {
        push("/postagens?tab=PUBLISHED");
      }, 500);
    } catch (error) {
      // Erro já tratado nas funções do contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (showChangesForm) {
      if (!changeRequest.trim()) {
        toast.error("Por favor, descreva as alterações necessárias");
        return;
      }

      setIsSubmitting(true);

      try {
        // Usar rota /article-status-review/:articleId apenas para status
        await UpdateArticleStatus(
          {
            newStatus: "CHANGES_REQUESTED",
            change_request_description: changeRequest,
          },
          article.id
        );

        onOpenChange(false);
        setTimeout(() => {
          push("/postagens?tab=CHANGES_REQUESTED");
        }, 500);
      } catch (error) {
        // Erro já tratado na função do contexto
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setShowChangesForm(true);
      setShowRejectForm(false);
    }
  };

  const handleRejectArticle = async () => {
    if (showRejectForm) {
      if (!rejectReason.trim()) {
        toast.error("Por favor, informe o motivo da rejeição");
        return;
      }

      setIsSubmitting(true);

      try {
        // Usar rota /article-status-review/:articleId apenas para status
        await UpdateArticleStatus(
          {
            newStatus: "REJECTED",
            reason_reject: rejectReason,
          },
          article.id
        );

        onOpenChange(false);
        setTimeout(() => {
          push("/postagens?tab=REJECTED");
        }, 500);
      } catch (error) {
        // Erro já tratado na função do contexto
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setShowRejectForm(true);
      setShowChangesForm(false);
    }
  };

  if (!article?.id) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[400px]">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600">
                Artigo não encontrado
              </p>
              <Button onClick={() => onOpenChange(false)} className="mt-4">
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] m-0 p-0 rounded-lg overflow-hidden dialog-content">
          <div className="flex flex-col h-full">
            {/* Cabeçalho fixo */}
            <DialogHeader className="article-review-modal-header bg-[#333] text-white py-4 px-6 border-b border-gray-600 flex-shrink-0">
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
                  Revisão para publicação da notícia
                </DialogTitle>
              </div>
            </DialogHeader>

            {/* Conteúdo principal com scroll */}
            <div className="article-review-modal-content flex-1 overflow-y-auto overflow-x-hidden bg-white">
              <div className="w-full max-w-4xl mx-auto p-6">
                <div className="space-y-6">
                  {/* Título principal */}
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{article.clicks_view} visualizações</span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail se disponível */}
                  {article.thumbnail && (
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full h-64">
                        <img
                          src={article.thumbnail.url}
                          alt="Thumbnail"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      {article.thumbnail.description && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Descrição da Imagem:</strong>{" "}
                          {article.thumbnail.description}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumo */}
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Resumo</h3>
                    <p className="whitespace-pre-wrap break-words">
                      {article.resume_content}
                    </p>
                  </div>

                  {/* Conteúdo */}
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Conteúdo</h3>
                    <div className="prose max-w-none overflow-y-auto overflow-x-hidden break-words">
                      <div
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </div>
                  </div>

                  {/* Grid de informações */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="overflow-hidden">
                      <h3 className="font-semibold mb-2">Criador</h3>
                      <p className="truncate">{article.creator.name}</p>
                      <h3 className="font-semibold mt-4 mb-2">Categoria</h3>
                      <p className="truncate">{article.category.name}</p>
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs truncate max-w-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold mt-4 mb-2">
                        Tempo de leitura
                      </h3>
                      <p>{article.reading_time} minutos</p>
                    </div>

                    <div className="overflow-hidden">
                      <h3 className="font-semibold mb-2">Portais</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.portals?.map((portal) => (
                          <span
                            key={portal.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs truncate max-w-full"
                          >
                            {portal.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold mt-4 mb-2">Status</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          currentStatus
                        )}`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Histórico de Status */}
                  {sortedStatusHistory.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Histórico de Status
                      </h3>
                      <div className="overflow-x-auto w-full">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/6">
                                Status
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/5">
                                Data
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/3">
                                Descrição
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-1/4">
                                Motivo de Rejeição
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedStatusHistory.map((history, idx) => (
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
                                  {history.change_request_description || "-"}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700 w-1/4 break-words">
                                  {history.reason_reject || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Formulário de solicitação de alterações */}
                  {showChangesForm && (
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Solicitação de Alterações
                      </h3>
                      <Textarea
                        placeholder="Descreva as alterações necessárias..."
                        value={changeRequest}
                        onChange={(e) => setChangeRequest(e.target.value)}
                        rows={4}
                        className="w-full mt-2"
                      />
                    </div>
                  )}

                  {/* Formulário de rejeição */}
                  {showRejectForm && (
                    <div className="bg-red-50 p-4 rounded-md border border-red-200">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        Motivo da Rejeição
                      </h3>
                      <Textarea
                        placeholder="Informe o motivo da rejeição..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        className="w-full mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé fixo com ações */}
            <div className="article-review-modal-footer bg-gray-200 py-4 px-6 flex justify-end space-x-4 flex-shrink-0 border-t border-gray-300">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                variant="outline"
                onClick={handleEditArticleButton}
                className="bg-blue-600 text-white hover:bg-blue-800 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
                disabled={isSubmitting}
              >
                Efetuar Edição
              </Button>

              {!showRejectForm && !showChangesForm && (
                <Button
                  variant="outline"
                  onClick={handleRequestChanges}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
                  disabled={isSubmitting}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Solicitar Alterações
                </Button>
              )}

              <Button
                variant={showRejectForm ? "default" : "outline"}
                onClick={handleRejectArticle}
                className={`${
                  showRejectForm ? "bg-red-600" : "bg-red-500"
                } text-white hover:bg-red-600 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm`}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                {showRejectForm ? "Confirmar Rejeição" : "Rejeitar"}
              </Button>

              {!showRejectForm && !showChangesForm && (
                <Button
                  onClick={handleApproveArticle}
                  className="bg-green-500 text-white hover:bg-green-600 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
                  disabled={isSubmitting}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Aprovar
                </Button>
              )}

              {showChangesForm && (
                <Button
                  onClick={handleRequestChanges}
                  className="bg-yellow-600 text-white hover:bg-yellow-700 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
                  disabled={isSubmitting}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Solicitação
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuração de destaque */}
      {article?.id && (
        <HighlightModal
          open={showApprovalModal}
          onOpenChange={setShowApprovalModal}
          onPublish={handleApproveFromModal}
          newsTitle={article?.title || ""}
        />
      )}
    </>
  );
}

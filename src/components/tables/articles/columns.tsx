"use client";

import { DialogDelete } from "@/components/dialog/delete";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { Article, ArticleContext } from "@/providers/article";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChartLine,
  Check,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FolderSearch2,
  Info,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import ArticleAnalyticsModal from "@/components/Modals/AnalyticsModal/articleAnalyticsModal";
import { HighlightCell } from "@/components/Modals/ArticleHighlight/highlight-cell";
import { UserContext } from "@/providers/user";
import { formatDate } from "date-fns";
import { ArticleViewModal } from "@/components/Modals/reviewModal";
import RejectedModal from "@/components/Modals/rejectedModal";

interface Props {
  article: Article;
}

interface LinkRedirectProps {
  article: Article;
  portalReferer: string;
}

const LinkRedirect = ({ article, portalReferer }: LinkRedirectProps) => {
  const url = `${portalReferer}/noticia/${generateSlug(
    article.category.name
  )}/${article.slug}`;

  return (
    <a
      href={url.startsWith("http") ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink
        size={20}
        className="text-primary cursor-pointer hover:text-primary-dark transition-colors inline-block ml-1"
      />
    </a>
  );
};

const generateSlug = (text: string) =>
  text
    .normalize("NFD") // separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos
    .replace(/ç/g, "c") // substitui ç por c
    .replace(/[^a-zA-Z0-9\s-]/g, "") // remove caracteres especiais (exceto espaço e hífen)
    .trim() // remove espaços do início/fim
    .toLowerCase()
    .replace(/\s+/g, "-"); // substitui espaços por hífen

const CellActions = ({ article }: Props) => {
  const { profile } = useContext(UserContext);
  const { UpdateArticleStatus } = useContext(ArticleContext);
  const { push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Obter o status mais recente ordenando pelo changed_at
  type ArticleStatus =
    | ""
    | "CHANGES_REQUESTED"
    | "PENDING_REVIEW"
    | "DRAFT"
    | "REJECTED"
    | "PUBLISHED"
    | "UNPUBLISHED";

  const currentStatus: ArticleStatus = React.useMemo(() => {
    if (!article.status_history || article.status_history.length === 0) {
      return "";
    }

    // Ordenar o histórico de status pela data (do mais recente para o mais antigo)
    const sortedHistory = [...article.status_history].sort(
      (a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );

    // Retornar o status do primeiro item (o mais recente)
    return sortedHistory[0].status as ArticleStatus;
  }, [article.status_history]);

  const handleToggleStatus = () => {
    setShowConfirmation(true);
  };

  const confirmToggleStatus = () => {
    const newStatus =
      currentStatus === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    UpdateArticleStatus({ newStatus }, article.id);
    setShowConfirmation(false);
  };

  const cancelToggleStatus = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="flex gap-6 items-center justify-between relative">
      {/* Botão de Toggle Publicação - apenas para PUBLISHED ou UNPUBLISHED */}
      {(currentStatus === "PUBLISHED" || currentStatus === "UNPUBLISHED") && (
        <div className="relative">
          {!showConfirmation ? (
            <TooltipProvider delayDuration={600}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {currentStatus === "PUBLISHED" ? (
                    <Eye
                      onClick={handleToggleStatus}
                      size={20}
                      className="text-green-500 cursor-pointer hover:text-green-600"
                    />
                  ) : (
                    <EyeOff
                      onClick={handleToggleStatus}
                      size={20}
                      className="text-green-500 cursor-pointer hover:text-green-600"
                    />
                  )}
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                    sideOffset={5}
                  >
                    <span>
                      {currentStatus === "PUBLISHED"
                        ? "Despublicar artigo"
                        : "Publicar artigo"}
                    </span>
                    <TooltipArrow
                      className="fill-primary-light"
                      width={11}
                      height={5}
                    />
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          ) : (
            // Botões de confirmação
            <div className="flex gap-2 items-center bg-white border rounded-xl p-1 shadow-sm ">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Check
                      onClick={confirmToggleStatus}
                      size={22}
                      className="text-green-500 cursor-pointer hover:text-green-600 p-1 hover:bg-green-50 rounded"
                    />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                      sideOffset={5}
                    >
                      <span>Confirmar</span>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <X
                      onClick={cancelToggleStatus}
                      size={22}
                      className="text-red-500 cursor-pointer hover:text-red-600 p-1 hover:bg-red-50 rounded"
                    />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                      sideOffset={5}
                    >
                      <span>Cancelar</span>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}

      <DialogDelete
        context="articles"
        item_name={article.slug}
        item_id={article.id}
      />

      {["DRAFT", "CHANGES_REQUESTED", "PUBLISHED"].includes(currentStatus) &&
      ["administrador", "chefe de redação"].includes(
        (profile?.role?.name ?? "").toLowerCase()
      ) ? (
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Edit
                onClick={() => push(`/postagens/artigos/editar/${article.id}`)}
                size={20}
                className="text-primary cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>Editar artigo</span>
                <TooltipArrow
                  className="fill-primary-light"
                  width={11}
                  height={5}
                />
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : currentStatus === "PENDING_REVIEW" ? (
        <>
          <TooltipProvider delayDuration={600}>
            <Tooltip>
              <TooltipTrigger asChild>
                <FolderSearch2
                  onClick={() => setIsModalOpen(true)}
                  size={20}
                  className="text-primary cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                  sideOffset={5}
                >
                  <span>Revisar artigo</span>
                  <TooltipArrow
                    className="fill-primary-light"
                    width={11}
                    height={5}
                  />
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          <ArticleViewModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            article={article}
          />
        </>
      ) : currentStatus === "REJECTED" ? (
        <>
          <TooltipProvider delayDuration={600}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Eye
                  onClick={() => setOpen(true)}
                  size={20}
                  className="text-primary cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                  sideOffset={5}
                >
                  <span>Motivo Rejeição</span>
                  <TooltipArrow
                    className="fill-primary-light"
                    width={11}
                    height={5}
                  />
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
          <RejectedModal
            open={open}
            onOpenChange={setOpen}
            articleId={article.id}
          />
        </>
      ) : currentStatus === "PUBLISHED" ? (
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <ExternalLink
                onClick={() =>
                  window.open(
                    `/noticia/${generateSlug(article.category.name)}/${
                      article.slug
                    }`
                  )
                }
                size={20}
                className="text-primary cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>Ver artigo publicado</span>
                <TooltipArrow
                  className="fill-primary-light"
                  width={11}
                  height={5}
                />
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
};

// Componente separado para a célula de analytics
const AnalyticsCell = ({ article }: { article: Article }) => {
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  return (
    <>
      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="text-center text-primary w-[150px] truncate flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 rounded-lg p-2 transition-colors"
              onClick={() => setIsAnalyticsModalOpen(true)}
            >
              <ChartLine size={20} />
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
              sideOffset={5}
            >
              <span>Ver estatísticas detalhadas</span>
              <TooltipArrow
                className="fill-primary-light"
                width={11}
                height={5}
              />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <ArticleAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        articleId={article.id}
        articleTitle={article.title}
      />
    </>
  );
};

export const columns: ColumnDef<Article>[] = [
  {
    id: "article",
    header: () => <div className="text-left">Artigo</div>,
    cell: ({ row }) => {
      const { title, creator } = row.original;

      return (
        <div className="flex flex-col w-[250px]">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-semibold text-base truncate cursor-help text-primary">
                  {title}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm bg-white">
                <span>{title}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm text-muted-foreground mt-1">
            Autor:{" "}
            <span className="font-medium">
              {creator?.name ?? "Desconhecido"}
            </span>
          </span>
        </div>
      );
    },
  },
  {
    id: "publicationHighlight",
    header: () => <div className="text-center">Publicação / Destaque</div>,
    cell: ({ row }) => {
      const { articlePortals, updated_at } = row.original;

      return (
        <div className="flex flex-col gap-1 text-sm items-center">
          {/* Lista de portais */}
          <div className="flex items-center justify-center py-1 gap-4">
            {articlePortals.map((ap) => (
              <div
                key={ap.portal.id}
                className="flex flex-col py-1"
              >
                {/* Nome + link */}

                <div className="flex items-center justify-center mb-1">
                  <span className="font-medium">{ap.portal.name}</span>
                  <LinkRedirect
                    article={row.original}
                    portalReferer={ap.portal.link_referer}
                  />
                </div>

                {/* Destaque como badge */}
                <HighlightCell article={row.original} portalId={ap.portal.id} />
              </div>
            ))}
          </div>

          {/* Data de atualização */}
          <div className="flex items-center gap-1 text-muted-foreground mt-1 text-xs justify-end">
            <Info size={12} />
            <span>
              Atualizado em{" "}
              <span className="font-medium">
                {updated_at ? formatDate(updated_at, "dd/MM/yyyy") : "Sem data"}
              </span>
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "clicks_view",
    header: () => <div className="text-center">Analíticos</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <AnalyticsCell article={row.original} />
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellActions article={row.original} />
      </div>
    ),
  },
];

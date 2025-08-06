"use client";

import { DialogDelete } from "@/components/dialog/delete";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { Article } from "@/providers/article";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChartLine,
  Edit,
  ExternalLink,
  Eye,
  FolderSearch2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArticleViewModal } from "@/components/Modals/reviewModal";
import { RejectedModal } from "@/components/Modals/rejectedModal";
import ArticleAnalyticsModal from "@/components/Modals/AnalyticsModal/articleAnalyticsModal";
import { HighlightCell } from "@/components/Modals/ArticleHighlight/highlight-cell";

interface Props {
  article: Article;
}

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
  const { push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // Obter o status mais recente ordenando pelo changed_at
  const currentStatus = React.useMemo(() => {
    if (!article.status_history || article.status_history.length === 0) {
      return "";
    }

    // Ordenar o histórico de status pela data (do mais recente para o mais antigo)
    const sortedHistory = [...article.status_history].sort(
      (a, b) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );

    // Retornar o status do primeiro item (o mais recente)
    return sortedHistory[0].status;
  }, [article.status_history]);

  return (
    <div className="flex gap-6">
      <DialogDelete
        context="articles"
        item_name={article.slug}
        item_id={article.id}
      />
      {["DRAFT", "CHANGES_REQUESTED"].includes(currentStatus) ? (
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
    accessorKey: "title",
    header: () => <div>Título</div>,
    cell: ({ row }) => (
      <div className="w-[200px] truncate">{row?.original?.title}</div>
    ),
  },
  {
    accessorKey: "creator",
    header: () => <div className="text-center w-[150px]">Criador</div>,
    cell: ({ row }) => (
      <div className="text-center w-[150px] truncate">
        {row?.original?.creator?.name ?? ""}
      </div>
    ),
  },
  // Atualizar a coluna highlight no array columns
  {
    accessorKey: "highlight",
    header: () => <div className="text-center w-[150px]">Destaque</div>,
    cell: ({ row }) => {
      const article = row?.original;
      return <HighlightCell article={article} />;
    },
  },
  {
    accessorKey: "category",
    header: () => <div className="text-center w-[150px]">Categorias</div>,
    cell: ({ row }) => (
      <div className="text-center w-[150px]">
        {row?.original?.category.name}
      </div>
    ),
  },
  {
    accessorKey: "portal",
    header: () => <div className="text-center w-[150px]">Portal</div>,
    cell: ({ row }) => (
      <div className="text-center w-[150px]">
        {row?.original.portals.map((portal) => portal.name).join(" - ")}
      </div>
    ),
  },

  {
    accessorKey: "clicks_view",
    header: () => <div className="text-center w-[150px]">Analíticos</div>,
    cell: ({ row }) => {
      const article = row?.original;
      return <AnalyticsCell article={article} />;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    cell: (article) => {
      const articleRow = article.row?.original;
      return (
        <div className="flex justify-center">
          <CellActions article={articleRow} />
        </div>
      );
    },
  },
];

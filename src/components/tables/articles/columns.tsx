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
  const [rejected, setRejected] = useState("");

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
              <span className="text-sm font-medium">
                {article.clicks_view || 0}
              </span>
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

// Função para obter o status atual de um artigo
const getCurrentStatus = (article: Article): string => {
  if (!article.status_history || article.status_history.length === 0) {
    return "";
  }
  const sortedHistory = [...article.status_history].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  return sortedHistory[0].status;
};

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "thumb",
    header: "",
    cell: ({ row }) => {
      const article = row?.original;

      // Verifica se existe thumbnail personalizada
      if (article?.thumbnail) {
        const thumbnailObj = article.thumbnail;
        if (thumbnailObj.url) {
          return (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={thumbnailObj.url}
                    alt={`Thumbnail para o artigo: ${article?.title}`}
                    className="rounded-full w-10 h-10 cursor-pointer mr-2 object-cover"
                  />
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    side="top"
                    align="center"
                    sideOffset={10}
                    className="bg-transparent border border-gray-300/50 backdrop-blur-lg p-2 rounded-lg shadow-2xl"
                  >
                    <img
                      src={thumbnailObj.url}
                      alt="Imagem ampliada"
                      className="w-56 h-56 object-cover rounded-lg"
                    />
                    <span className="font-semibold w-56 mt-2 text-body-g flex flex-wrap">
                      {article?.title}
                    </span>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }

      // Sem imagem, mostra um placeholder com iniciais do título
      const initials =
        article?.title
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase() || "AR";

      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
          {initials}
        </div>
      );
    },
  },
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
    accessorKey: "tags",
    header: () => <div className="text-center">Tags</div>,
    cell: ({ row }) => (
      <div className="text-center truncate">
        {row?.original?.tags.map((item) => item.name).join(" - ")}
      </div>
    ),
  },
  {
    accessorKey: "clicks_view",
    header: () => <div className="text-center w-[150px]">Analíticos</div>,
    cell: ({ row }) => {
      const article = row?.original;
      const currentStatus = getCurrentStatus(article);

      if (currentStatus === "PUBLISHED") {
        return <AnalyticsCell article={article} />;
      }

      return <div className="text-center w-[150px]"></div>;
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

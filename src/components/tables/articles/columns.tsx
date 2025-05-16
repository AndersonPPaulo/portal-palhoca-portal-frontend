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
import { Edit, Eye, FolderSearch2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArticleViewModal } from "@/components/reviewModal";
import { RejectedModal } from "@/components/rejectedModal";

interface Props {
  article: Article;
}

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

  const rejectedMessage = React.useEffect(() => {
    if (currentStatus === "REJECTED") {
      setRejected(article.status_history[0].reason_reject);
    }
  });

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
      ) : null}
    </div>
  );
};

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "thumb",
    header: "",
    cell: ({ row }) => {
      const article = row?.original;
      
      let thumbnailUrl = 'Sem foto' ;
      
      if (article?.thumbnail) {
        if (typeof article.thumbnail === 'string') {
          thumbnailUrl = article.thumbnail;
        } else if (typeof article.thumbnail === 'object') {
          const thumbnailObj = article.thumbnail as Record<string, any>;
          if (thumbnailObj.url) {
            thumbnailUrl = thumbnailObj.url;
          } else if (thumbnailObj.key) {
            thumbnailUrl = `http://localhost:5555/uploads/${thumbnailObj.key}`;
          } else if (thumbnailObj.Location) {
            thumbnailUrl = thumbnailObj.Location;
          }
        }
      }
 
      
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                src={thumbnailUrl }
                alt={"Thumbnail para o artigo:" + article?.title}
                className="rounded-full h-6 w-6 cursor-pointer mr-2 object-cover"
              
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
                  src={thumbnailUrl }
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
        {row?.original?.creator.name}
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
    header: () => (
      <div className="text-center w-[150px]">Cliques / Visualisações</div>
    ),
    cell: ({ row }) => (
      <div className="text-center w-[150px] truncate flex items-center justify-center gap-2">
        {row?.original?.clicks_view}
      </div>
    ),
  },
  // {
  //   accessorKey: "highlight",
  //   header: () => <div className="text-center w-[150px]">Destaque</div>,
  //   cell: ({ row }) => (
  //     <div className="flex justify-center w-[150px]">
  //       {row?.original?.highlight ? (
  //         <span className="bg-green text-white px-3 py-1 rounded-full text-sm">
  //           Sim
  //         </span>
  //       ) : (
  //         <span className="bg-red text-white px-3 py-1 rounded-full text-sm">
  //           Não
  //         </span>
  //       )}
  //     </div>
  //   ),
  // },
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

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
import { Edit, FolderSearch2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ArticleViewModal } from "@/components/reviewModal";

interface Props {
  article: Article;
}


const CellActions = ({ article }: Props) => {
  const { push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentStatus =
  article.status_history && article.status_history.length > 0
  ? article.status_history[article.status_history.length - 1].status
  : null;
  
  return (
    <div className="flex gap-6">
    <DialogDelete
      context="articles"
      item_name={article.slug}
      item_id={article.id}
    />
  
    {currentStatus === "DRAFT" ? (
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
              <span>Editar rascunho</span>
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
    ) : null}
  </div>
  );
};

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "thumb",
    header: "",
    cell: ({ row }) => (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <img
              src={`http://localhost:5555/${row?.original?.thumbnail}`}
              alt={"Thumbnail para o artigo:" + row?.original?.title}
              className="rounded-full h-6 w-6 cursor-pointer mr-2"
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
                src={`http://localhost:5555/${row?.original?.thumbnail}`}
                alt="Imagem ampliada"
                className="w-56 h-56 object-cover rounded-lg"
              />
              <span className="font-semibold w-56 mt-2 text-body-g flex flex-wrap">
                {row?.original?.title}
              </span>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ),
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
  {
    accessorKey: "highlight",
    header: () => <div className="text-center w-[150px]">Destaque</div>,
    cell: ({ row }) => (
      <div className="flex justify-center w-[150px]">
        {row?.original?.highlight ? (
          <span className="bg-green text-white px-3 py-1 rounded-full text-sm">
            Sim
          </span>
        ) : (
          <span className="bg-red text-white px-3 py-1 rounded-full text-sm">
            Não
          </span>
        )}
      </div>
    ),
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

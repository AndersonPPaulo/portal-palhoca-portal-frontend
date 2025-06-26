"use client";

import { DialogDelete } from "@/components/dialog/delete";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BannerItem } from "@/providers/banner";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const getBannerStyleClass = (style: string) => {
  switch (style?.toLowerCase()) {
    case "noticia":
      return "bg-blue-500";
    case "destaque":
      return "bg-yellow-500 text-black";
    case "topo":
      return "bg-red-500";
     case "sidebar":
      return "bg-orange-500";
    default:
      return "bg-zinc-200";
  }
};

interface Props {
  banner: BannerItem;
}

const CellActions = ({ banner }: Props) => {
  const { push } = useRouter();
  return (
    <div className="flex gap-6">
      <DialogDelete
        context="banners"
        item_name={banner.name}
        item_id={banner.id}
      />

      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() => push(`/banners/editar/${banner.id}`)}
              size={20}
              className="text-primary cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2  animate-fadeIn"
              sideOffset={5}
            >
              <span>Editar banner</span>
              <TooltipArrow
                className="fill-primary-light"
                width={11}
                height={5}
              />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const columns = (
  setSelectedImage: (url: string) => void
): ColumnDef<BannerItem>[] => [
  {
    accessorKey: "url",
    header: () => <div className="text-center">Imagem do Banner</div>,
    cell: ({ row }) => (
      <div className="flex justify-center py-2 relative">
        <div
          onClick={() => setSelectedImage(row.original.url)}
          className="cursor-zoom-in rounded-lg overflow-hidden border border-gray-300 shadow-sm hover:shadow-lg transition-transform duration-300 hover:scale-105"
        >
          <img
            src={row.original.url}
            alt={`Banner de ${row.original.name}`}
            className="w-[120px] h-[40px] object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left pl-2">Nome do Banner</div>,
    cell: ({ row }) => (
      <div className="pl-2 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "link_direction",
    header: () => <div className="text-left pl-2">Link de Direcionamento</div>,
    cell: ({ row }) => (
      <div className="pl-2 truncate text-sm text-blue-600 underline dark:text-blue-400 transition-colors duration-200 hover:text-blue-800">
        {row.original.link_direction}
      </div>
    ),
  },
  {
    accessorKey: "banner_style",
    header: () => <div className="text-center">Posição</div>,
    cell: ({ row }) => {
      const style = row.original.banner_style;
      const bgColor = getBannerStyleClass(style);

      return (
        <div className="flex justify-center">
          <span
            className={`text-white px-3 py-1 rounded-full text-xs font-semibold capitalize transition-transform duration-200 hover:scale-105 ${bgColor}`}
          >
            {style}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "date_active",
    header: () => <div className="text-center">Inicio / Fim</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono transition-opacity duration-200 hover:opacity-80">
          {formatDate(row.original.date_active, "dd/MM/yyyy")}{" "}
          <span className="text-gray-400"> - </span>{" "}
          {formatDate(row.original.date_expiration, "dd/MM/yyyy")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${
            row.original.status
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {row.original.status ? "Ativo" : "Inativo"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellActions banner={row.original} />
      </div>
    ),
  },
];

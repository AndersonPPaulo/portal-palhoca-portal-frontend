"use client";

import { DialogDelete } from "@/components/dialog/delete";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChartLine,
  Edit,
  ExternalLink,
  Calendar,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import BannerAnalyticsModal from "@/components/Modals/AnalyticsModal/bannerAnalitycsModal";
import { BannerItem } from "@/providers/banner";

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
              onClick={() => push(`/postagens/banners/editar/${banner.id}`)}
              size={20}
              className="text-primary cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
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

// Componente separado para a célula de analytics
const AnalyticsCell = ({ banner }: { banner: BannerItem }) => {
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

      <BannerAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        bannerId={banner.id}
        bannerTitle={banner.name}
      />
    </>
  );
};

export const columns: ColumnDef<BannerItem>[] = [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      const banner = row?.original;

      // Verifica se existe imagem do banner
      if (banner?.url) {
        return (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <img
                  src={banner.url}
                  alt={`Banner: ${banner?.name}`}
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
                    src={banner.url}
                    alt="Banner ampliado"
                    className="w-56 h-56 object-cover rounded-lg"
                  />
                  <span className="font-semibold w-56 mt-2 text-body-g flex flex-wrap">
                    {banner?.name}
                  </span>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        );
      }

      // Sem imagem, mostra um placeholder com iniciais do nome
      const initials =
        banner?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase() || "BN";

      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
          {initials}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div>Nome</div>,
    cell: ({ row }) => (
      <div className="w-[200px] truncate">{row?.original?.name}</div>
    ),
  },
  {
    accessorKey: "company",
    header: () => <div className="text-center w-[150px]">Empresa</div>,
    cell: ({ row }) => (
      <div className="text-center w-[150px] truncate flex items-center justify-center gap-1">
        <Building2 size={14} className="text-gray-500" />
        <span>{row?.original?.company?.name ?? ""}</span>
      </div>
    ),
  },
  {
    accessorKey: "banner_style",
    header: () => <div className="text-center w-[120px]">Estilo</div>,
    cell: ({ row }) => (
      <div className="text-center w-[120px]">
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
          {row?.original?.banner_style || "Padrão"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className="text-center">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row?.original?.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row?.original?.status ? "Ativo" : "Inativo"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "link_direction",
    header: () => <div className="text-center">Link</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row?.original?.link_direction ? (
          <TooltipProvider delayDuration={600}>
            <Tooltip>
              <TooltipTrigger asChild>
                <ExternalLink
                  size={16}
                  className="text-blue-600 cursor-pointer mx-auto"
                  onClick={() =>
                    window.open(row.original.link_direction, "_blank")
                  }
                />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <span>{row.original.link_direction}</span>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "date_expiration",
    header: () => <div className="text-center">Expiração</div>,
    cell: ({ row }) => {
      const expiration = row?.original?.date_expiration;
      if (!expiration) return <span className="text-gray-400">-</span>;

      const date = new Date(expiration);
      const isExpired = date < new Date();

      return (
        <div className="text-center flex items-center justify-center gap-1">
          <Calendar size={14} className="text-gray-500" />
          <span
            className={`text-xs ${
              isExpired ? "text-red-600 font-medium" : "text-gray-600"
            }`}
          >
            {date.toLocaleDateString("pt-BR")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Analíticos",
    header: () => <div className="text-center w-[150px]">Analíticos</div>,
    cell: ({ row }) => {
      const banner = row?.original;
      return <AnalyticsCell banner={banner} />;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    cell: (banner) => {
      const bannerRow = banner.row?.original;
      return (
        <div className="flex justify-center">
          <CellActions banner={bannerRow} />
        </div>
      );
    },
  },
];

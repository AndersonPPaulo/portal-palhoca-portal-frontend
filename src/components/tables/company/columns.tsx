"use client";
import CompanyAnalyticsModal from "@/components/Modals/AnalyticsModal/companyAnalyticsModal";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ICompanyProps } from "@/providers/company";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { ChartLine, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CellActions = (companyId: string) => {
  const { push } = useRouter();

  return (
    <div className="flex gap-6">
      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() => push(`/comercio/editar/${companyId}`)}
              size={20}
              className="text-primary cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn"
              sideOffset={5}
            >
              <span>Editar Comércio</span>
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
const AnalyticsCell = ({ company }: { company: ICompanyProps }) => {
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

      <CompanyAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        companyId={company.id}
        companyTitle={company.name}
      />
    </>
  );
};

export const columns: ColumnDef<ICompanyProps>[] = [
  {
    accessorKey: "name",
    header: () => <div>Comércio</div>,
  },
  {
    id: "location",
    header: () => <div className="text-start">Localização</div>,
    cell: ({ row }) => {
      const { city, district } = row.original;
      return (
        <div className="text-start leading-5">
          <div className="font-medium text-gray-800">{city || "-"}</div>
          <div className="text-sm text-gray-500">{district || "-"}</div>
        </div>
      );
    },
  },
  {
    id: "info",
    header: () => <div className="text-start">Informações</div>,
    cell: ({ row }) => {
      const { created_at, status } = row.original;
      const formattedDate = created_at
        ? formatDate(created_at, "dd/MM/yyyy")
        : "-";

      const statusTextMap: Record<string, string> = {
        active: "Ativo",
        blocked: "Bloqueado",
        new_lead: "Novo Lead",
        inactive: "Inativo",
      };

      const statusColorMap: Record<string, string> = {
        active: "bg-green",
        blocked: "bg-red",
        new_lead: "bg-primary",
        inactive: "bg-yellow-600",
      };

      const statusText = statusTextMap[status] || "Em processo";
      const statusColor = statusColorMap[status] || "bg-orange";

      return (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-800">
            <span className="font-medium">Cadastrado:</span> {formattedDate}
          </div>
          <span
            className={`text-white ${statusColor} font-bold px-3 py-1 rounded-full text-sm w-fit`}
          >
            {statusText}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Analíticos",
    header: () => <div className="text-center w-[150px]">Analíticos</div>,
    cell: ({ row }) => {
      const company = row?.original;
      return <AnalyticsCell company={company} />;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {CellActions(row.original.id)}
        </div>
      );
    },
  },
];

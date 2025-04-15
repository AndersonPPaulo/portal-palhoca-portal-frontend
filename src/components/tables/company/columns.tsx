"use client";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export interface CompanyItem {
  id: string;
  name: string;
  phone?: string;
  openingHours: string;
  description?: string;
  linkInstagram?: string;
  linkWhatsapp?: string;
  linkLocationMaps: string;
  linkLocationWaze: string;
  address: string;
  status: "active" | "inactive" | "blocked";
  created_at: Date;
  update_at: Date;
}

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

export const columns: ColumnDef<CompanyItem>[] = [
  {
    accessorKey: "name",
    header: () => <div>Comércio</div>,
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-start">Telefone</div>,
    cell: ({ row }) => (
      <div className="w-[250px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.phone || "-"}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.phone || "Sem telefone"}</span>
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
    ),
  },
  {
    accessorKey: "openingHours",
    header: () => <div className="text-start">Horário</div>,
    cell: ({ row }) => (
      <div className="w-[250px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.openingHours}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.openingHours}</span>
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
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-[150px]">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center text-center w-[150px] truncate text-white select-none">
        <span
          className={`${
            row.original.status === "active"
              ? "bg-green"
              : row.original.status === "blocked"
              ? "bg-red"
              : "bg-orange"
          } px-3 py-1 rounded-full text-sm capitalize`}
        >
          {row.original.status}
          
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: ({ row }) => {
      return <div className="flex justify-center">{CellActions(row.original.id)}</div>;
    },
  },
];
"use client";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ILeadProps } from "./page";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

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

export const columns: ColumnDef<ILeadProps>[] = [
  {
    accessorKey: "thumb",
    header: "",
    cell: ({ row }) => {
      const lead = row?.original;

      const initials = lead.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div>Comércio</div>,
  },
  {
    accessorKey: "responsibleName",
    header: () => <div className="text-start">Responsável</div>,
    cell: ({ row }) => (
      <div className="w-[250px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">
                {row.original.responsibleName || "-"}
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.responsibleName || "-"}</span>
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
    accessorKey: "email",
    header: () => <div className="text-start">Email</div>,
    cell: ({ row }) => (
      <div className="w-[250px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.email || "-"}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.email || "Sem email"}</span>
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
    accessorKey: "status",
    header: () => <div className="text-center w-[150px]">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center text-center w-[150px] truncate text-white select-none">
        <span
          className={`${
            row.original.status === "active"
              ? "bg-green font-bold"
              : row.original.status === "blocked"
              ? "bg-red font-bold"
              : row.original.status === "new_lead"
              ? "bg-primary font-bold"
              : "bg-orange font-bold"
          } px-3 py-1 rounded-full min-w-[130px] text-sm capitalize`}
        >
          {row.original.status === "active"
            ? "Ativo"
            : row.original.status === "blocked"
            ? "Bloqueado"
            : row.original.status === "new_lead"
            ? "Novo Lead"
            : "Em processo"}
        </span>
      </div>
    ),
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

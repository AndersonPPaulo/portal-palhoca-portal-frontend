"use client";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ICompanyProps } from "@/providers/company";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

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

export const columns: ColumnDef<ICompanyProps>[] = [
  {
    accessorKey: "thumb",
    header: "",
    cell: ({ row }) => {
      const company = row?.original;

      if (company?.company_image) {
        let logoUrl = "";

        const imageObj = company.company_image as Record<string, any>;
        if (imageObj.url) {
          logoUrl = imageObj.url;
        }

        if (logoUrl) {
          return (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={logoUrl}
                    alt={`Logo ${company.name}`}
                    className="rounded-full w-10 h-10 cursor-pointer object-cover"
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
                      src={logoUrl}
                      alt={`Logo ${company.name}`}
                      className="w-56 h-56 object-cover rounded-lg"
                    />
                    <span className="font-semibold w-56 mt-2 text-body-g flex flex-wrap">
                      {company.name}
                    </span>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }

      // Sem imagem, mostra um placeholder com iniciais
      const initials = company.name
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
          {row.original.status === "active"
            ? "Ativo"
            : row.original.status === "blocked"
            ? "Bloqueado"
            : "Inativo"}
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

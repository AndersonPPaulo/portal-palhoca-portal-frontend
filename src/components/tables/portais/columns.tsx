import { DialogDelete } from "@/components/dialog/delete";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";

import React from "react";
import Link from "next/link";

interface PortalProps {
  id: string;
  name: string;
  link_referer: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  portal: PortalProps;
}

const CellActions = ({ portal }: Props) => {
  return (
    <div className="flex gap-6">
      <DialogDelete context="portals" item_name={portal.name} item_id={portal.id} />
    </div>
  );
};

export const columns: ColumnDef<PortalProps>[] = [
  {
    accessorKey: "name",
    header: () => <div>Nome do portal</div>,
    cell: ({ row }) => (
      <div className="text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.name}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.name}</span>
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
    accessorKey: "link_direction",
    header: () => <div className="text-left pl-2">Link de Direcionamento</div>,
    cell: ({ row }) => (
      <div className="pl-2 truncate text-sm text-blue-600 underline dark:text-blue-400 transition-colors duration-200 hover:text-blue-800">
        {row.original.link_referer}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-[150px]">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center text-center w-[150px] truncate text-white select-none">
        <span className={`px-2 py-1 rounded-full text-xs min-w-[130px] ${
          row.original.status 
            ? 'bg-green font-bold' 
            : 'bg-red font-bold'
        }`}>
          {row.original.status ? 'Ativo' : 'Inativo'}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: (portal) => {
      const portalRow = portal.row.original;
      return (
        <div className="flex justify-center">
          <CellActions portal={portalRow} />
        </div>
      );
    },
  },
];
import { DialogDelete } from "@/components/dialog/delete";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";

import React from "react";

interface UsersProps {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Props {
  user: UsersProps;
}

const CellActions = ({ user }: Props) => {
  return (
    <div className="flex gap-6">
      <DialogDelete context="users" item_name={user.name} item_id={user.id} />
    </div>
  );
};

export const columns: ColumnDef<UsersProps>[] = [
  {
    accessorKey: "name",
    header: () => <div className="w-[150px]">Nome do autor</div>,
    cell: ({ row }) => (
      <div className="w-[150px]">
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
    accessorKey: "email",
    header: () => <div className="text-start">Email</div>,
    cell: ({ row }) => (
      <div className="text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.email}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.email}</span>
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
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: (user) => {
      const userRow = user.row.original;
      return (
        <div className="flex justify-center">
          <CellActions user={userRow} />
        </div>
      );
    },
  },
];

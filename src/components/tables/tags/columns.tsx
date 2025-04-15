"use client";

import { DialogDelete } from "@/components/dialog/delete";
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

interface TagsProps {
  id: string;
  name: string;
  description: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Props {
  tag: TagsProps;
}

const CellActions = ({ tag }: Props) => {
  const { push } = useRouter();
  return (
    <div className="flex gap-6">
      <DialogDelete context="tags" item_name={tag.name} item_id={tag.id} />

      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() => push(`/postagens/tags/editar/${tag.id}`)}
              size={20}
              className="text-primary cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2  animate-fadeIn"
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
    </div>
  );
};

export const columns: ColumnDef<TagsProps>[] = [
  {
    accessorKey: "name",
    header: () => <div>TAG</div>,
    cell: ({ row }) => (
      <div className=" truncate w-[150px]">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "description",
    header: () => <div className="text-start">Descrição</div>,
    cell: ({ row }) => (
      <div className="text-start">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-[150px]">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center text-center w-[150px] truncate text-white select-none">
        <span
          className={`${
            row.original.status ? "bg-green" : "bg-red"
          } px-3 py-1 rounded-full text-sm capitalize`}
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
    cell: (tag) => {
      const tagRow = tag.row.original;
      return (
        <div className="flex justify-center">
          <CellActions tag={tagRow} />
        </div>
      );
    },
  },
];

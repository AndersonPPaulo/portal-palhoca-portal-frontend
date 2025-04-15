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

interface CategorysProps {
  id: string;
  name: string;
  description: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Props {
  category: CategorysProps;
}

const CellActions = ({ category }: Props) => {
  const { push } = useRouter();
  return (
    <div className="flex gap-6">
      <DialogDelete
        context="categories"
        item_name={category.name}
        item_id={category.id}
      />

      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() =>
                push(`/postagens/categorias/editar/${category.id}`)
              }
              size={20}
              className="text-primary cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2  animate-fadeIn"
              sideOffset={5}
            >
              <span>Editar categoria</span>
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

export const columns: ColumnDef<CategorysProps>[] = [
  {
    accessorKey: "name",
    header: () => <div>Categoria</div>,
    cell: ({ row }) => (
      <div className="w-[250px]">
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
    accessorKey: "description",
    header: () => <div className="text-start">Descrição</div>,
    cell: ({ row }) => (
      <div className="w-[250px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.description}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.description}</span>
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
    cell: (category) => {
      const categoryRow = category.row.original;
      return (
        <div className="flex justify-center">
          <CellActions category={categoryRow} />
        </div>
      );
    },
  },
];

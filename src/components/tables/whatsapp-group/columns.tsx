import { DialogDelete } from "@/components/dialog/delete";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useContext } from "react";
import { WhatsappGroupContext } from "@/providers/whatsapp-group";
import React from "react";

// Interface para grupos de WhatsApp
interface WhatsappGroupProps {
  id: string;
  link: string;
  is_active: boolean;
  portal: {
    id: string;
    name: string;
    link_referer: string;
    status: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  whatsappGroup: WhatsappGroupProps;
}

// Componente de ação de deletar específico para WhatsApp
const DeleteAction = ({ whatsappGroup }: Props) => {
  const { DeleteWhatsappGroup } = useContext(WhatsappGroupContext);

  const handleDelete = async () => {
    const groupName = `Grupo do ${whatsappGroup.portal?.name}`;
    if (window.confirm(`Tem certeza que deseja deletar o ${groupName}?`)) {
      try {
        await DeleteWhatsappGroup(whatsappGroup.id);
      } catch (error) {
        console.error("Erro ao deletar grupo:", error);
      }
    }
  };

  return (
    <TooltipProvider delayDuration={600}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
            sideOffset={5}
          >
            <span>Deletar grupo</span>
            <TooltipArrow
              className="fill-primary-light"
              width={11}
              height={5}
            />
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

const CellActions = ({ whatsappGroup }: Props) => {
  return (
    <div className="flex gap-3 justify-center">
      <DeleteAction whatsappGroup={whatsappGroup} />
    </div>
  );
};

export const columns: ColumnDef<WhatsappGroupProps>[] = [
  {
    accessorKey: "portal.name",
    header: () => <div>Portal</div>,
    cell: ({ row }) => (
      <div className="text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.portal?.name || "-"}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.portal?.name || "Sem portal"}</span>
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
    accessorKey: "link",
    header: () => <div className="text-start">Link do WhatsApp</div>,
    cell: ({ row }) => (
      <div className="w-[250px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">
                {row.original.link || "-"}
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.link || "Sem link"}</span>
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
    accessorKey: "portal.link_referer",
    header: () => <div className="text-start">Link do Portal</div>,
    cell: ({ row }) => (
      <div className="w-[200px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">
                {row.original.portal?.link_referer || "-"}
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.portal?.link_referer || "Sem link do portal"}</span>
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
    accessorKey: "is_active",
    header: () => <div className="text-center w-[150px]">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center text-center w-[150px] truncate text-white select-none">
        <span
          className={`px-2 py-1 rounded-full text-xs min-w-[130px]  ${
            row.original.is_active
              ? "bg-green text-white font-bold"
              : "bg-red text-white font-bold"
          }`}
        >
          {row.original.is_active ? "Ativo" : "Inativo"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-start">Criado em</div>,
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      const formattedDate = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return (
        <div className="w-[120px] text-start">
          <TooltipProvider delayDuration={600}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate">{formattedDate}</div>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                  sideOffset={5}
                >
                  <span>{date.toLocaleString("pt-BR")}</span>
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
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: (group) => {
      const groupRow = group.row.original;
      return (
        <div className="flex justify-center">
          <CellActions whatsappGroup={groupRow} />
        </div>
      );
    },
  },
];
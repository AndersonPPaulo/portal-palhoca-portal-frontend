import { DialogDelete } from "@/components/dialog/delete";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { UserContext } from "@/providers/user";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";

// Interface corrigida para corresponder ao tipo ResponsePromise do contexto
interface UsersProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: {
    id: string;
    name: string;
    isDefault?: boolean;
  };
  chiefEditor?: {
    id: string;
    name: string;
  };
  user_image?: {
    id: string;
    key: string;
    url: string;
    original_name?: string;
    mime_type?: string;
    size?: number;
    uploaded_at?: Date;
  } | null;
  topic?: string;
  created_at?: string;
  updated_at?: string;
  isActive?: boolean;
}

interface Props {
  user: UsersProps;
}

const CellActions = ({ user }: Props) => {
  const { profile } = useContext(UserContext);
  const router = useRouter();

  const isAdmin = profile?.role?.name?.toLowerCase() === "administrador";

  const handleEdit = () => {
    router.push(`/usuarios/editar/${user.id}`);
  };

  return (
    <div className="flex gap-6 items-center justify-center">
      {isAdmin && (
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Editar usuário"
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}
      <DialogDelete context="users" item_name={user.name} item_id={user.id} />
    </div>
  );
};

export const columns: ColumnDef<UsersProps>[] = [
  {
    accessorKey: "photo",
    header: "",
    cell: ({ row }) => {
      const user = row?.original;

      if (user?.user_image) {
        let photoUrl = "";

        const imageObj = user.user_image as Record<string, any>;
        if (imageObj.url) {
          photoUrl = imageObj.url;
        }

        if (photoUrl) {
          return (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={photoUrl}
                    alt={`Foto de ${user.name}`}
                    className="rounded-full w-10 h-10 cursor-pointer object-cover border-2 border-gray-200"
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
                      src={photoUrl}
                      alt={`Foto de ${user.name}`}
                      className="w-56 h-56 object-cover rounded-lg"
                    />
                    <div className="w-56 mt-2">
                      <span className="font-semibold text-body-g block">
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-600 block">
                        {user.role?.name || "Sem cargo"}
                      </span>
                    </div>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          );
        }
      }

      // Sem imagem, mostra um placeholder com iniciais
      const initials = user.name
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
    header: () => <div>Nome do usuário</div>,
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
    accessorKey: "role",
    header: () => <div className="text-start">Cargo</div>,
    cell: ({ row }) => (
      <div className="w-[130px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">
                {row.original.role?.name || "Sem cargo"}
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.role?.name || "Sem cargo"}</span>
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
      <div className="w-[200px] text-start">
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
    accessorKey: "phone",
    header: () => <div className="text-start">Telefone</div>,
    cell: ({ row }) => (
      <div className="w-[150px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.phone}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.phone}</span>
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
    accessorKey: "topic",
    header: () => <div className="text-start">Coluna</div>,
    cell: ({ row }) => (
      <div className="w-[150px] text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">{row.original.topic || "-"}</div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.topic || "Sem título de coluna"}</span>
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
    accessorKey: "chiefEditor",
    header: () => <div className="text-start">Responsável</div>,
    cell: ({ row }) => (
      <div className="text-start">
        <TooltipProvider delayDuration={600}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate">
                {row.original.chiefEditor?.name || "-"}
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                className="rounded-2xl shadow-sm bg-white text-[16px] text-gray-30 px-4 py-2 animate-fadeIn"
                sideOffset={5}
              >
                <span>{row.original.chiefEditor?.name || "-"}</span>
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

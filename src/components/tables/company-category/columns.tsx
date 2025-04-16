import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export interface CompanyCategoryItem {
  id: string;
  name: string;
}

const CellActions = (categoryId: string) => {
  const { push } = useRouter();

  return (
    <div className="flex gap-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() => push(`/comercio/categorias/editar/${categoryId}`)}
              size={20}
              className="text-primary cursor-pointer"
            />
          </TooltipTrigger>
          <TooltipContent className="rounded-2xl shadow-sm bg-primary-light text-[16px] text-primary px-4 py-2 animate-fadeIn" sideOffset={5}>
            <p>Editar Categoria</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const columns: ColumnDef<CompanyCategoryItem>[] = [
  {
    accessorKey: "name",
    header: () => <div>Categoria</div>,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">{row.original.name}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 100,
    cell: ({ row }) => (
      <div className="flex justify-center">{CellActions(row.original.id)}</div>
    ),
  },
];

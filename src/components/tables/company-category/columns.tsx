import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { DialogDelete } from "@/components/dialog/delete";

export interface CompanyCategoryItem {
  id: string;
  name: string;
}

const CellActions = ({ category }: { category: CompanyCategoryItem }) => {
  const { push } = useRouter();

  return (
    <div className="flex items-center justify-center gap-4">
      <DialogDelete
        context="companyCategory"
        item_name={category.name}
        item_id={category.id}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() =>
                push(`/comercio/categoria/editar/${category.id}`)
              }
              size={18}
              className="text-primary cursor-pointer hover:text-blue-600 transition-colors"
            />
          </TooltipTrigger>
          <TooltipContent sideOffset={5}>
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
    header: () => (
      <div className="text-left font-semibold text-lg text-gray-700">
        Categoria
      </div>
    ),
    cell: ({ row }) => (
      <div className=" max-w-[300px] text-gray-800 text-base">
        {row.original.name}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => (
      <div className="text-center font-semibold text-lg text-gray-700">
        Ações
      </div>
    ),
    size: 100,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <CellActions category={row.original} />
      </div>
    ),
  },
];

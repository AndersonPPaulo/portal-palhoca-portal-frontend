"use client";

import CustomInput from "@/components/input/custom-input";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip, TooltipArrow, TooltipPortal } from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { TagContext } from "@/providers/tags";

interface Props {
  tagid: string;
  tagName: string;
}

export function DialogDeleteTag({ tagid, tagName }: Props) {
  const { DeleteTag, ListTags } = useContext(TagContext);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (inputValue !== tagName) {
      setError("O nome da tag não corresponde.");
      return;
    }

    try {
      setIsLoading(true);
      await DeleteTag(tagid);
      setError("");
      setInputValue("");
      setOpen(false);
      ListTags();
    } catch (error) {
      setError("Erro ao deletar a tag. Tente novamente." + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setInputValue("");
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <div>
                <Trash2 size={20} className="text-red cursor-pointer" />
              </div>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className="rounded-2xl shadow-sm bg-red-light text-[16px] text-red px-4 py-2 animate-fadeIn"
              sideOffset={5}
            >
              <span>Deletar artigo</span>
              <TooltipArrow className="fill-red-light" width={11} height={5} />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="bg-white border-none outline-none sm:max-w-[425px] !rounded-3xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-header-s">Deletar tag</DialogTitle>
          <DialogDescription className="flex flex-col gap-4 pt-2">
            Você tem certeza que deseja deletar essa tag? Caso realmente for
            deletar informe o nome da tag e confirme
            <strong>{tagName}</strong>
          </DialogDescription>
        </DialogHeader>
        <CustomInput
          placeholder="Nome da tag"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DialogFooter>
          <DialogClose className="px-2">Cancelar</DialogClose>
          <Button
            type="button"
            className="rounded-3xl bg-primary-secondary"
            onClick={handleDelete}
            disabled={inputValue !== tagName || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deletando...
              </>
            ) : (
              "Confirmar e deletar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

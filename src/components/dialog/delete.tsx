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
import { CategorysContext } from "@/providers/categorys";
import { ArticleContext } from "@/providers/article";
import { UserContext } from "@/providers/user";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";
import { BannerContext } from "@/providers/banner";
import { useRouter } from "next/navigation";

interface Props {
  item_id: string;
  item_name: string;
  context:
    | "tags"
    | "categories"
    | "articles"
    | "users"
    | "companyCategory"
    | "banners";
}

export function DialogDelete({ item_id, item_name, context }: Props) {
  const { DeleteTag, ListTags } = useContext(TagContext);
  const { DeleteCategory, ListCategorys } = useContext(CategorysContext);
  const { DeleteArticle, ListAuthorArticles } = useContext(ArticleContext);
  const { DeleteUser, profile } = useContext(UserContext);
  const { DeleteCompanyCategory, ListCompanyCategory } = useContext(
    CompanyCategoryContext
  );

  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (inputValue !== item_name) {
      setError("O nome não corresponde.");
      return;
    }

    try {
      setIsLoading(true);

      if (context === "tags") {
        await DeleteTag(item_id);
        ListTags();
      } else if (context === "categories") {
        await DeleteCategory(item_id);
        ListCategorys();
      } else if (context === "articles") {
        await DeleteArticle(item_id);
        ListAuthorArticles(profile?.id);
        push("/postagens");
      } else if (context === "users") {
        DeleteUser(item_id);
      } else if (context === "companyCategory") {
        await DeleteCompanyCategory(item_id);
        ListCompanyCategory();
      }
      // else if (context === "banners") {
      //   await UpdateBanner({ status: false }, item_id);
      //   ListBanners();
      // }
      setError("");
      setInputValue("");
      setOpen(false);
    } catch (error) {
      setError("Erro ao deletar. Tente novamente." + error);
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

  const getDialogDescription = () => {
    switch (context) {
      case "tags":
        return `Você tem certeza que deseja deletar essa tag? Caso realmente for deletar informe o nome da tag e confirme`;
      case "categories":
        return `Você tem certeza que deseja deletar essa categoria? Caso realmente for deletar informe o nome da categoria e confirme `;
      case "articles":
        return `Você tem certeza que deseja deletar este artigo? Caso realmente for deletar informe o nome do artigo e confirme `;
      case "users":
        return `Você tem certeza que deseja deletar este artigo? Caso realmente for deletar informe o nome do artigo e confirme `;
      case "companyCategory":
        return `Você tem certeza que deseja deletar esta categoria? Caso realmente for deletar informe o nome da categoria e confirme `;
      default:
        return "";
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
              <span>
                {context === "banners" ? "Atualizar" : "Deletar"}{" "}
                {context === "tags"
                  ? "tag"
                  : context === "categories"
                  ? "categoria"
                  : context === "users"
                  ? "usuário"
                  : context === "companyCategory"
                  ? "categoria de comércio"
                  : context === "banners"
                  ? "banner"
                  : "artigo"}
              </span>

              <TooltipArrow className="fill-red-light" width={11} height={5} />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="bg-white border-none outline-none !rounded-3xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-header-s">
            {context === "banners" ? "Atualizar" : "Deletar"}{" "}
            {context === "tags"
              ? "tag"
              : context === "categories"
              ? "categoria"
              : context === "users"
              ? "usuário"
              : context === "companyCategory"
              ? "categoria de comércio"
              : context === "banners"
              ? "banner"
              : "artigo"}
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-4 pt-2">
            {getDialogDescription()}
            <span className="font-normal">
              Nome do conteudo que você deseja atualizar ou deletar:{" "}
              <strong>{item_name}</strong>
            </span>
          </DialogDescription>
        </DialogHeader>
        <CustomInput
          placeholder="adicone o nome acima para confirmar"
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
            disabled={inputValue !== item_name || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deletando...
              </>
            ) : context === "banners" ? (
              "Confirmar e atualizar"
            ) : (
              "Confirmar e deletar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Article } from "@/providers/article";

// Componente Switch customizado
const CustomSwitch = ({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onCheckedChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none
          ${
            checked
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300"
          }
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
            ring-0 transition duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
};

interface ArticleHighlightModalProps {
  article: Article;
  onUpdate: (article: Article) => void;
  isOpen: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function ArticleHighlightModal({
  article,
  onUpdate,
  isOpen,
  setIsOpen,
}: ArticleHighlightModalProps) {
  const [isHighlighted, setIsHighlighted] = useState(article.highlight);
  const [position, setPosition] = useState<string>(
    article.highlight_position?.toString() || "1"
  );

  console.log("article", article);
  const handleSave = () => {
    const updatedArticle: Article = {
      ...article,
      highlight: isHighlighted,
      highlight_position: isHighlighted ? Number.parseInt(position) : undefined,
    };
    onUpdate(updatedArticle);
    if (setIsOpen) setIsOpen(false);
  };

  const handleCancel = () => {
    setIsHighlighted(article.highlight);
    setPosition(article.highlight_position?.toString() || "1");
    if (setIsOpen) setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white rounded-full max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Destaque do Artigo</DialogTitle>
          <DialogDescription>
            Configure se este artigo deve ser destacado e sua posição na lista
            de destaques.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="highlight-switch" className="text-sm font-medium">
              Artigo em destaque
            </Label>
            <CustomSwitch
              id="highlight-switch"
              checked={isHighlighted}
              onCheckedChange={setIsHighlighted}
            />
          </div>

          {isHighlighted && (
            <div className="grid gap-2">
              <Label htmlFor="position-select" className="text-sm font-medium">
                Posição do destaque
              </Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">Posição 1</SelectItem>
                  <SelectItem value="2">Posição 2</SelectItem>
                  <SelectItem value="3">Posição 3</SelectItem>
                  <SelectItem value="4">Posição 4</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs ps-1 pe-4 text-muted-foreground">
                Escolha a posição onde este artigo aparecerá na seção de
                destaques do portal (1 até 4).
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

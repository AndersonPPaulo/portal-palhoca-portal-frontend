"use client";

import { useEffect, useState } from "react";
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
import { Article, UpdateArticleHighlightProps } from "@/providers/article";

// Componente Switch customizado
const CustomSwitch = ({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) => (
  <div className="flex items-center">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none
        ${
          checked
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
          ring-0 transition duration-200 ease-in-out
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

interface ArticleHighlightModalProps {
  article: Article;
  onUpdate?: (article: UpdateArticleHighlightProps) => void;
  isOpen: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function ArticleHighlightModal({
  article,
  onUpdate,
  isOpen,
  setIsOpen,
}: ArticleHighlightModalProps) {
  const [portals, setPortals] = useState(article.articlePortals || []);

  // Sincroniza o estado sempre que article mudar
  useEffect(() => {
    setPortals(article.articlePortals || []);
  }, [article]);

  const handleToggleHighlight = (portalId: string, value: boolean) => {
    setPortals((prev) =>
      prev.map((p) =>
        p.id === portalId
          ? {
              ...p,
              highlight: value,
              highlight_position: value ? p.highlight_position || 1 : undefined,
            }
          : p
      )
    );
  };

  const handleChangePosition = (portalId: string, position: string) => {
    setPortals((prev) =>
      prev.map((p) =>
        p.id === portalId
          ? {
              ...p,
              highlight_position: position === "0" ? null : Number(position), // "0" vira null
            }
          : p
      )
    );
  };

  const handleSave = () => {
    const updatedArticle: UpdateArticleHighlightProps = {
      portals: portals.map((p) => ({
        portalId: p.portal.id,
        highlight: p.highlight,
        ...(p.highlight && { highlight_position: p.highlight_position }),
      })),
    };

    onUpdate && onUpdate(updatedArticle);
    setIsOpen?.(false);
  };

  const handleCancel = () => {
    setPortals(article.articlePortals || []);
    setIsOpen?.(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white rounded-xl max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Destaques do Artigo</DialogTitle>
          <DialogDescription>
            Configure se este artigo deve ser destacado em cada portal afiliado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className="border rounded-lg p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`highlight-${portal.id}`}
                  className="text-sm font-medium"
                >
                  {portal.portal.name || `Portal ${portal.id}`}
                </Label>
                <CustomSwitch
                  id={`highlight-${portal.id}`}
                  checked={portal.highlight}
                  onCheckedChange={(val) =>
                    handleToggleHighlight(portal.id, val)
                  }
                />
              </div>

              {portal.highlight && (
                <div className="grid gap-2">
                  <Label
                    htmlFor={`position-${portal.id}`}
                    className="text-sm font-medium"
                  >
                    Posição do destaque
                  </Label>
                  <Select
                    value={portal.highlight_position?.toString() || "0"} // 0 representa "Sem Posição"
                    onValueChange={(val) =>
                      handleChangePosition(portal.id, val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Informe a posição" />
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
          ))}
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

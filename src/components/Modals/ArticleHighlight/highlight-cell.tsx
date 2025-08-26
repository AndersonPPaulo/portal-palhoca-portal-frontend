"use client";

import { Button } from "@/components/ui/button";
import {
  Article,
  ArticleContext,
  UpdateArticleHighlightProps,
} from "@/providers/article";
import { Star } from "lucide-react";
import { useContext, useState, useEffect, useMemo } from "react";
import ArticleHighlightModal from ".";

type HighlightCellProps = {
  article: Article;
  portalId?: string; // opcional: se quiser filtrar por portal específico
};

// Componente separado para a célula de highlight
export const HighlightCell = ({ article, portalId }: HighlightCellProps) => {
  const { UpdateArticleHighlight } = useContext(ArticleContext);

  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [localArticle, setLocalArticle] = useState(article);

  // Sincronizar sempre que prop article mudar
  useEffect(() => {
    setLocalArticle(article);
  }, [article]);

  // Pega o vínculo desse artigo com o portal (ou todos)
  const portalLinks = useMemo(() => {
    if (portalId) {
      return (
        localArticle.articlePortals?.filter(
          (ap) => ap.portal.id === portalId
        ) ?? []
      );
    }
    return localArticle.articlePortals ?? [];
  }, [localArticle, portalId]);

  // Se for pra mostrar status "geral": está em destaque em algum portal?
  const isHighlight = portalLinks.some((ap) => ap.highlight);
  const highlightPortal = portalLinks.find((ap) => ap.highlight);
  const highlightPosition = highlightPortal?.highlight_position;

  const handleUpdateArticle = async (
    updatedArticle: UpdateArticleHighlightProps
  ) => {
    await UpdateArticleHighlight(updatedArticle, localArticle.id).then((res) => {
      console.log('res', res);
      // setLocalArticle(updatedArticle);
      setIsHighlightModalOpen(false);
    });
  };

  

  return (
    <div className="flex items-center justify-center min-w-[120px] max-w-[180px] whitespace-normal break-words text-center">
      <span
        onClick={() => setIsHighlightModalOpen(true)}
        className={`cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition ${
          isHighlight
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-red-100 text-red-600 hover:bg-red-200"
        }`}
      >
        <Star
          className={`w-3 h-3 ${
            isHighlight ? "text-green-600" : "text-red-500 opacity-70"
          }`}
          fill="currentColor"
        />
        {isHighlight ? "Sim" : "Não"}
        {highlightPosition && (
          <span className="ml-1 text-[10px] text-green-700">
            ({highlightPosition})
          </span>
        )}
      </span>
      <ArticleHighlightModal
        article={localArticle}
        onUpdate={handleUpdateArticle}
        isOpen={isHighlightModalOpen}
        setIsOpen={setIsHighlightModalOpen}
      />
    </div>
  );
};

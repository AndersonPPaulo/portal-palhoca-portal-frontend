"use client";

import { Button } from "@/components/ui/button";
import { Article, ArticleContext } from "@/providers/article";
import { Star } from "lucide-react";
import { useContext, useState } from "react";
import ArticleHighlightModal from ".";

// Componente separado para a célula de highlight
export const HighlightCell = ({ article }: { article: Article }) => {
  const { UpdateArticleHighlight } = useContext(ArticleContext);

  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [localArticle, setLocalArticle] = useState(article);

  const handleUpdateArticle = async (updatedArticle: Article) => {
    await UpdateArticleHighlight(
      {
        ...updatedArticle,
        highlight_position: updatedArticle.highlight_position ?? undefined,
      },
      localArticle.id
    ).then(() => {
      setLocalArticle(updatedArticle);
      setIsHighlightModalOpen(false);
    });
  };

  const isHighlight = localArticle.highlight;
  const highlightPosition = localArticle.highlight_position;

  return (
    <div className="flex items-center justify-center w-[150px]">
      <span
        className={`flex items-center gap-1 rounded-full font-semibold text-sm ${
          isHighlight
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-500"
        }`}
      >
        {isHighlight ? (
          <Button
            className="bg-transparent hover:bg-green-200 text-green-600 rounded-full"
            onClick={() => setIsHighlightModalOpen(true)}
          >
            <Star className="w-4 h-4 text-green-600" fill="currentColor" /> Sim
            {highlightPosition && (
              <span className="ml-1 text-xs text-green-700">
                (Posição: {highlightPosition})
              </span>
            )}
          </Button>
        ) : (
          <Button
            className="bg-transparent hover:bg-red-200 text-red-600 rounded-full"
            onClick={() => setIsHighlightModalOpen(true)}
          >
            <Star className="w-4 h-4 text-red-500 opacity-50" /> Não
          </Button>
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

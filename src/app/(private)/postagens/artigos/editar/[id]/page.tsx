"use client";

import { useEffect, useState } from "react";
import { useContext } from "react";
import Header from "@/components/header";
import { ArticleContext } from "@/providers/article";
import FormEditArticle from "@/components/painel/cards/postagens/articles/forms/update-article";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: Props) {
  const { SelfArticle, article } = useContext(ArticleContext);
  const [loading, setLoading] = useState(true);
  console.log('article', article)

  useEffect(() => {
    params.then(({ id }) => {
      SelfArticle(id);
      setLoading(false);
    });
  }, [params]);

  return (
    <div className="bg-primary-light h-screen overflow-scroll">
      <Header title={`Editar artigo - ${article?.title}`} buttonHidden={true} />
      <div className="flex-1 overflow-hidden p-6">
        {loading || !article ? (
          <SkeletonTagForm />
        ) : (
          <FormEditArticle article={article} />
        )}
      </div>
    </div>
  );
}

function SkeletonTagForm() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-300 rounded"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  );
}

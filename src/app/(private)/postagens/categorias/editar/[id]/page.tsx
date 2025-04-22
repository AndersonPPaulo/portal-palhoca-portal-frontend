"use client";

import { useEffect, useState } from "react";
import { useContext } from "react";
import Header from "@/components/header";
import FormEditCategory from "@/components/painel/cards/postagens/categorys/forms/update-category";
import { CategorysContext } from "@/providers/categorys";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: Props) {
  const { SelfCategory, category } = useContext(CategorysContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      SelfCategory(id);
      setLoading(false);
    });
  }, [params]);

  return (
    <div className="bg-primary-light h-screen overflow-hidden">
      <Header
        title={`Editar categoria - ${category?.name}`}
        buttonHidden={true}
      />
      <div className="p-6">
        {loading || !category ? (
          <SkeletonTagForm />
        ) : (
          <FormEditCategory/>
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

"use client";

import { useEffect, useState } from "react";
import { TagContext } from "@/providers/tags";
import { useContext } from "react";
import FormEditTag from "@/components/painel/cards/postagens/tags/forms/update-tag";
import Header from "@/components/header";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditTagPage({ params }: Props) {
  const { SelfTag, tag } = useContext(TagContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      SelfTag(id);
      setLoading(false);
    });
  }, [params]);

  return (
    <div className="h-full bg-primary-light">
      <Header title={`Editar tag - ${tag?.name}`} buttonHidden={true} />
      <div className="p-6">
        {loading || !tag ? <SkeletonTagForm /> : <FormEditTag tagData={tag} />}
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

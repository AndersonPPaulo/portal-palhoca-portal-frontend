"use client";

import { useEffect, useState, useContext } from "react";
import Header from "@/components/header";
import { CompanyCategoryContext } from "@/providers/company-category/index.tsx";
import FormUpdateCompanyCategory from "@/components/painel/cards/company-category/forms/update-company-category";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCompanyCategoryPage({ params }: Props) {
  const { SelfCompanyCategory, companyCategory } = useContext(CompanyCategoryContext);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    params.then(async ({ id }) => {
      await SelfCompanyCategory(id);
      setLoading(false);
    });
  }, [params]);
  
  return (
    <div className="h-full bg-primary-light">
      <Header
        title={`Editar categoria de comércio - ${companyCategory?.name || ""}`}
        buttonHidden={true}
      />
      <div className="p-6">
        {loading || !companyCategory ? (
          <SkeletonTagForm />
        ) : (
          <FormUpdateCompanyCategory  />
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

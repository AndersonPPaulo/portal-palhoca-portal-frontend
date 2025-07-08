"use client";

import { useEffect, useState } from "react";
import { useContext } from "react";
import Header from "@/components/header";
import { CompanyContext } from "@/providers/company";
import FormUpdateCompany from "@/components/painel/cards/company/forms/update-company";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCompanyPage({ params }: Props) {
  const { SelfCompany, company } = useContext(CompanyContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      SelfCompany(id);
      setLoading(false);
    });
  }, [params]);


  return (
    <div className="flex flex-col h-screen bg-primary-light overflow-scroll overflow-x-hidden">
      <Header title={`Edita Comercio - ${company?.name}`} buttonHidden={true} />
      <div className="flex-1 p-6">
        {loading || !company ? (
          <SkeletonTagForm />
        ) : (
          <FormUpdateCompany companyData={company} />
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

"use client";

import { useEffect, useState } from "react";
import { useContext } from "react";
import Header from "@/components/header";
import { BannerContext } from "@/providers/banner";
import { FormUpdateBanner } from "@/components/painel/cards/banners/forms/update-banner";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditBannerPage({ params }: Props) {
  const { GetBanner, banner } = useContext(BannerContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      GetBanner(id);
      setLoading(false);
    });
  }, [params]);

  if(!banner.id){
    return <h1>ID não encontrado</h1>
  }

  return (
    <div className="flex flex-col h-screen bg-primary-light overflow-hidden ">
      <Header title={`Edita Comercio - ${banner?.name}`} buttonHidden={true} />
      <div className="flex-1 p-6">
        {loading || !banner ? (
          <SkeletonTagForm />
        ) : (
          <FormUpdateBanner bannerData={banner} />
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

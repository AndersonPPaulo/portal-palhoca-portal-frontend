"use client";

import Header from "@/components/header";
import { CreateBannerForm } from "@/components/painel/cards/banners/forms/create-banner";
import { useRouter } from "next/navigation";

export default function BannersPage() {
    const router = useRouter();
  return (
    <div className="bg-primary-light overflow-x-hidden min-h-screen h-full">
      <Header
        title="Criar Banner"
        description="Esolha qual tipo e crie um banner."
        buttonHidden

        onClick={() => router.push("/banners/criar")}
      />
      <div className="p-4">
        <CreateBannerForm/>
      </div>
    </div>
  );
}

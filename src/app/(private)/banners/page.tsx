"use client";

import Header from "@/components/header";
import Banners from "@/components/tabs/cards/banners/banners";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function BannersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <div className="bg-primary-light overflow-x-hidden min-h-screen h-full">
      <Header
        title="Banners"
        description="Gerencie os banners do seu site."
        text_button="Novo banner"
        onClick={() => router.push("/banners/criar")}
        isMobile={isMobile}
      />
      <Banners />
    </div>
  );
}

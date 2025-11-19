"use client";

import { ArticleAnalyticsContext } from "@/providers/analytics/ArticleAnalyticsProvider";
import { BannerAnalyticsContext } from "@/providers/analytics/BannerAnalyticsProvider";
import { CompanyAnalyticsContext } from "@/providers/analytics/CompanyAnalyticsProvider";
import { useContext } from "react";

export default function DownloadAnalytics() {
  const { Get100EventsCompany, last100EventsCompany } = useContext(
    CompanyAnalyticsContext
  );
  const { Get100EventsBanner, last100EventsBanner } = useContext(
    BannerAnalyticsContext
  );
  const { Get100EventsArticle, last100EventsArticle } = useContext(
    ArticleAnalyticsContext
  );

  return (
    <div className="flex h-[100px] w-full bg-red-500 items-center justify-center">
      <p className="text-[50px]">
        Aqui em cima vai os botões de baixar relatório dos artigos, banner e
        comércio?
      </p>
    </div>
  );
}

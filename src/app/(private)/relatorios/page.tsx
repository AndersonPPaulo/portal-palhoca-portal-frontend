import ArticleTracker from "@/components/analyticTracker/article-tracker";
import BannerTracker from "@/components/analyticTracker/banner-tracker";
import CompanyTracker from "@/components/analyticTracker/company-tracker";
import DownloadAnalytics from "@/components/analyticTracker/download-analytics";

export default function UnifiedTrackersPage() {
  return (
    <div className="w-full h-screen xl:p-2">
      <DownloadAnalytics />
      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-0 xl:gap-2 h-full overflow-y-auto xl:overflow-hidden snap-y snap-mandatory xl:snap-none">
        {/* Company Tracker */}
        <div className="h-full xl:h-full flex-shrink-0 snap-start xl:snap-align-none overflow-hidden">
          <CompanyTracker autoRefresh={true} />
        </div>

        {/* Banner Tracker */}
        <div className="h-full xl:h-full flex-shrink-0 snap-start xl:snap-align-none overflow-hidden">
          <BannerTracker autoRefresh={true} />
        </div>

        {/* Article Tracker */}
        <div className="h-full xl:h-full flex-shrink-0 snap-start xl:snap-align-none overflow-hidden">
          <ArticleTracker autoRefresh={true} />
        </div>
      </div>
    </div>
  );
}

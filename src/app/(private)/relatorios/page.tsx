import ArticleTracker from "@/components/analyticTracker/article-tracker";
import BannerTracker from "@/components/analyticTracker/banner-tracker";
import CompanyTracker from "@/components/analyticTracker/company-tracker";

export default function UnifiedTrackersPage() {
  return (
    <div className="w-full h-screen max-h-screen overflow-hidden p-2">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 h-full">
        {/* Banner Tracker */}
        <div className="h-full overflow-hidden">
          <BannerTracker autoRefresh={true} />
        </div>
        {/* Company Tracker */}
        <div className="h-full overflow-hidden">
          <CompanyTracker autoRefresh={true} />
        </div>
        {/* Article Tracker */}
        <div className="h-full overflow-hidden">
          <ArticleTracker autoRefresh={true} />
        </div>
      </div>
    </div>
  );
}

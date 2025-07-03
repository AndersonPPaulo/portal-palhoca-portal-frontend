"use client";

import { ArticleProvider } from "./article";
import { AuthProvider } from "./auth";
import { CategorysProvider } from "./categorys";
import { TagProvider } from "./tags";
import { UserProvider } from "./user";
import { CompanyProvider } from "./company";
import { CompanyCategoryProvider } from "./company-category/index.tsx";
import { BannerProvider } from "./banner";
import { PortalProvider } from "./portal";
import { ArticleAnalyticsProvider } from "./analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortalProvider>
        <UserProvider>
          <CompanyProvider>
            <ArticleProvider>
              <CategorysProvider>
                <CompanyCategoryProvider>
                  <ArticleAnalyticsProvider>
                    <BannerProvider>
                      <TagProvider>{children}</TagProvider>
                    </BannerProvider>
                  </ArticleAnalyticsProvider>
                </CompanyCategoryProvider>
              </CategorysProvider>
            </ArticleProvider>
          </CompanyProvider>
        </UserProvider>
      </PortalProvider>
    </AuthProvider>
  );
}

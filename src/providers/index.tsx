"use client";

import { ArticleProvider } from "./article";
import { AuthProvider } from "./auth";
import { CategorysProvider } from "./categorys";
import { TagProvider } from "./tags";
import { UserProvider } from "./user";
import { CompanyProvider } from "./company";
import { CompanyCategoryProvider } from "./company-category/index.tsx";
import { CompanyTransferProvider } from "./CompanyTransfer";
import { BannerProvider } from "./banner";
import { PortalProvider } from "./portal";
import { ArticleAnalyticsProvider } from "./analytics/ArticleAnalyticsProvider";
import { BannerAnalyticsProvider } from "./analytics/BannerAnalyticsProvider";
import { CompanyAnalyticsProvider } from "./analytics/CompanyAnalyticsProvider";
import { WhatsappGroupProvider } from "./whatsapp-group";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortalProvider>
        <UserProvider>
          <CompanyProvider>
            <ArticleProvider>
              <WhatsappGroupProvider>
                <CategorysProvider>
                  <CompanyCategoryProvider>
                    <CompanyTransferProvider>
                      <ArticleAnalyticsProvider>
                        <BannerAnalyticsProvider>
                          <CompanyAnalyticsProvider>
                            <BannerProvider>
                              <TagProvider>{children}</TagProvider>
                            </BannerProvider>
                          </CompanyAnalyticsProvider>
                        </BannerAnalyticsProvider>
                      </ArticleAnalyticsProvider>
                    </CompanyTransferProvider>
                  </CompanyCategoryProvider>
                </CategorysProvider>
              </WhatsappGroupProvider>
            </ArticleProvider>
          </CompanyProvider>
        </UserProvider>
      </PortalProvider>
    </AuthProvider>
  );
}

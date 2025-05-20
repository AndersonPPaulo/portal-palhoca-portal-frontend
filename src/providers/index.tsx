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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortalProvider>
        <UserProvider>
          <CompanyProvider>
            <ArticleProvider>
              <CategorysProvider>
                <CompanyCategoryProvider>
                  <CompanyTransferProvider>
                    <BannerProvider>
                      <TagProvider>{children}</TagProvider>
                    </BannerProvider>
                  </CompanyTransferProvider>
                </CompanyCategoryProvider>
              </CategorysProvider>
            </ArticleProvider>
          </CompanyProvider>
        </UserProvider>
      </PortalProvider>
    </AuthProvider>
  );
}

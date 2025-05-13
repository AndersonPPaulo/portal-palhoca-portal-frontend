"use client";

import { ArticleProvider } from "./article";
import { AuthProvider } from "./auth";
import { CategorysProvider } from "./categorys";
import { TagProvider } from "./tags";
import { UserProvider } from "./user";
import { CompanyProvider } from "./company";
import { CompanyCategoryProvider } from "./company-category/index.tsx";
import { CompanyTransferProvider } from "./CompanyTransfer";
import { Portal } from "@radix-ui/react-tooltip";
import { PortalProvider } from "./portal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <CompanyProvider>
          <ArticleProvider>
            <CategorysProvider>
              <CompanyCategoryProvider>
                <CompanyTransferProvider>
                  <TagProvider>
                    <PortalProvider>{children}</PortalProvider>
                  </TagProvider>
                </CompanyTransferProvider>
              </CompanyCategoryProvider>
            </CategorysProvider>
          </ArticleProvider>
        </CompanyProvider>
      </UserProvider>
    </AuthProvider>
  );
}

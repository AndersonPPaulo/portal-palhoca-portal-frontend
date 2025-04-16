"use client";

import { ArticleProvider } from "./article";
import { AuthProvider } from "./auth";
import { CategorysProvider } from "./categorys";
import { TagProvider } from "./tags";
import { UserProvider } from "./user";
import { CompanyProvider } from "./company";
import { CompanyCategoryProvider } from "./company-category/index.tsx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <CompanyProvider>
          <ArticleProvider>
            <CategorysProvider>
           <CompanyCategoryProvider>
              <TagProvider>{children}</TagProvider>
              </CompanyCategoryProvider>
            </CategorysProvider>
          </ArticleProvider>
        </CompanyProvider>
      </UserProvider>
    </AuthProvider>
  );
}

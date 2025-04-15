"use client";

import { ArticleProvider } from "./article";
import { AuthProvider } from "./auth";
import { CategorysProvider } from "./categorys";
import { TagProvider } from "./tags";
import { UserProvider } from "./user";
import { CompanyProvider } from "./company";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <CompanyProvider>
          <ArticleProvider>
            <CategorysProvider>
              <TagProvider>{children}</TagProvider>
            </CategorysProvider>
          </ArticleProvider>
        </CompanyProvider>
      </UserProvider>
    </AuthProvider>
  );
}

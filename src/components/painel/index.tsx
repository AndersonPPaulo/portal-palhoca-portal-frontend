"use client";

import { Eye, FileText, FileX, Sparkles, Users, Building2 } from "lucide-react";
import CardInfoPainel from "./cards/infos";
import { useContext, useEffect } from "react";
import { ArticleContext } from "@/providers/article";
import { UserContext } from "@/providers/user";
import { CompanyContext } from "@/providers/company";

export default function InfoPainel() {
  const { ListArticles, listArticles } = useContext(ArticleContext);
  const { ListUser, listUser, profile } = useContext(UserContext);
  const { ListCompany, listCompany } = useContext(CompanyContext);

  useEffect(() => {
    if (profile?.role === "superuser") {
      Promise.all([ListArticles(), ListUser(), ListCompany()]);
    } else {
      ListArticles();
    }
  }, []);

  const count = {
    published_articles: listArticles.length,
    inactives_articles: listArticles.filter((item) => item.status === false)
      .length,
    clicks_views: listArticles.reduce(
      (acc, article) => acc + Number(article.clicks_view),
      0
    ),
    highlight_articles: listArticles.filter((item) => item.highlight).length,
    authors: listUser.length,
    total_companies: listCompany?.total || 0, 
  };
  return (
    <div className="h-full bg-white rounded-[32px] p-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 ggxl:grid-cols-4 gap-4">
        <CardInfoPainel
          title="Artigos Publicados"
          value={count.published_articles}
          icon={<FileText size={32} />}
          bgCard="bg-primary-light"
          textColor="text-primary-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Artigos Inativos"
          value={count.inactives_articles}
          icon={<FileX size={32} />}
          bgCard="bg-red-light"
          textColor="text-red-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Visualizações"
          value={count.clicks_views}
          icon={<Eye size={32} />}
          bgCard="bg-green-light"
          textColor="text-green-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Artigos em Destaque"
          value={count.highlight_articles}
          icon={<Sparkles size={32} />}
          bgCard="bg-primary-light"
          textColor="text-primary-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Autores"
          value={count.authors}
          icon={<Users size={32} />}
          bgCard="bg-orange-light"
          textColor="text-primary-dark"
          path="/postagens"
          isAdmin={profile?.role === "superuser"}
        />

        <CardInfoPainel
          title="Comércios Cadastrados"
          value={count.total_companies}
          icon={<Building2 size={32} />}
          bgCard="bg-blue-light"
          textColor="text-blue-dark"
          path="/comercio"
          isAdmin={profile?.role === "superuser"}
        />
      </div>
    </div>
  );
}

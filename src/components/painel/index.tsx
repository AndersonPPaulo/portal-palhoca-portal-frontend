"use client";

import { Eye, FileText, FileX, Sparkles, Users, Building2 } from "lucide-react";
import CardInfoPainel from "./cards/infos";
import { useContext, useEffect } from "react";
import { ArticleContext } from "@/providers/article";
import { UserContext } from "@/providers/user";
import { CompanyContext } from "@/providers/company";

export default function InfoPainel() {
  const { ListAuthorArticles, listArticles } = useContext(ArticleContext);
  const { ListUser, listUser, profile } = useContext(UserContext);
  const { ListCompany, listCompany } = useContext(CompanyContext);

  useEffect(() => {
    if (profile?.role.name.toLocaleLowerCase() === "administrador") {
      Promise.all([ListAuthorArticles(), ListUser(), ListCompany()]);
    } else {
      ListAuthorArticles();
    }
  }, []);

  const count = {
    published_articles: listArticles?.meta.total,
    inactives_articles: listArticles?.data.filter(
      (item) => item.status === "inactive" || item.status === "blocked"
    ).length,
    clicks_views: listArticles?.data.reduce(
      (acc, article) => acc + Number(article.clicks_view),
      0
    ),
    highlight_articles: listArticles?.data.filter((item) => item.highlight)
      .length,
    authors: listUser?.total,
    total_companies: listCompany?.total,
  };

  return (
    <div className="h-full bg-white rounded-[32px] p-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 ggxl:grid-cols-4 gap-4">
        <CardInfoPainel
          title="Artigos Publicados"
          value={count.published_articles ? count.published_articles : 0}
          icon={<FileText size={32} />}
          bgCard="bg-primary-light"
          textColor="text-primary-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Artigos Inativos"
          value={count.inactives_articles ? count.inactives_articles : 0}
          icon={<FileX size={32} />}
          bgCard="bg-red-light"
          textColor="text-red-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Visualizações"
          value={count.clicks_views ? count.clicks_views : 0}
          icon={<Eye size={32} />}
          bgCard="bg-green-light"
          textColor="text-green-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Artigos em Destaque"
          value={count.highlight_articles ? count.highlight_articles : 0}
          icon={<Sparkles size={32} />}
          bgCard="bg-primary-light"
          textColor="text-primary-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Usuários Cadastrados"
          value={Number(count.authors) || 0}
          icon={<Users size={32} />}
          bgCard="bg-orange-light"
          textColor="text-primary-dark"
          path="/postagens"
          isAdmin={profile?.role.name.toLowerCase() === "administrador"}
        />

        <CardInfoPainel
          title="Comércios Cadastrados"
          value={count.total_companies ? count.total_companies : 0}
          icon={<Building2 size={32} />}
          bgCard="bg-blue-light"
          textColor="text-blue-dark"
          path="/comercio"
          isAdmin={profile?.role.name.toLowerCase() === "administrador"}
        />
        <CardInfoPainel
          title="Novos Leads"
          value={count.total_companies ? count.total_companies : 0}
          icon={<Building2 size={32} />}
          bgCard="bg-red"
          textColor="text-black"
          path="/comercio?tab=new_leads"
          isAdmin={profile?.role.name.toLowerCase() === "administrador"}
        />
      </div>
    </div>
  );
}

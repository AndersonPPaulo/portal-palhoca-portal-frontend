"use client";

import { Eye, FileText, FileX, Sparkles, Users, Building2 } from "lucide-react";
import CardInfoPainel from "./cards/infos";
import { useContext, useEffect, useState } from "react";
import { ArticleContext } from "@/providers/article";
import { UserContext } from "@/providers/user";
import { CompanyContext } from "@/providers/company";
import { api } from "@/service/api";

export default function InfoPainel() {
  const { ListAuthorArticles, listArticles } = useContext(ArticleContext);
  const { ListUser, listUser, profile, Profile } = useContext(UserContext);
  const { ListCompany, listCompany } = useContext(CompanyContext);

  const [highlightByPortal, setHighlightByPortal] = useState<
    { portalName: string; highlightCount: number }[]
  >([]);

  useEffect(() => {
    Profile();
    if (profile?.role.name.toLocaleLowerCase() === "administrador") {
      Promise.all([
        ListAuthorArticles(),
        ListUser(),
        ListCompany(undefined, undefined, undefined),
      ]);
    } else if (profile?.id) {
      ListAuthorArticles(profile?.id);
    }
  }, [profile?.id]);

  // buscar contagem de artigos em destaque por portal
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await api.get("/highlights-by-portal", {
          params: { role: profile?.role.name },
        });
        setHighlightByPortal(response.data);
      } catch (err) {
        console.error("Erro ao carregar destaques por portal:", err);
      }
    };
    if (profile?.id) {
      fetchHighlights();
    }
  }, [profile?.id]);

  const count = {
    published_articles: listArticles?.meta.total,
    inactives_articles: listArticles?.data.filter(
      (item) => item.status === "inactive" || item.status === "blocked"
    ).length,
    clicks_views: listArticles?.data.reduce(
      (acc, article) => acc + Number(article.clicks_view),
      0
    ),
    highlight_articles: listArticles?.data.filter((item) =>
      item.articlePortals.some((ap) => ap.highlight)
    ).length,
    authors: listUser?.total,
    total_companies: listCompany?.total,
    new_leads: listCompany?.data.filter((item) => item.status === "new_lead")
      .length,
  };

  return (
    <div className="h-full bg-white rounded-[32px] p-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 ggxl:grid-cols-4 gap-4">
        {/* === BLOCO PADRÃO === */}
        <CardInfoPainel
          title="Artigos Publicados"
          value={count.published_articles || 0}
          icon={<FileText size={32} />}
          bgCard="bg-primary-light"
          textColor="text-primary-dark"
          path="/postagens"
        />

        <CardInfoPainel
          title="Usuários Cadastrados"
          value={Number(count.authors) || 0}
          icon={<Users size={32} />}
          bgCard="bg-orange-light"
          textColor="text-orange-dark"
          path="/usuarios"
          isAdmin={profile?.role.name.toLowerCase() === "administrador"}
        />

        <CardInfoPainel
          title="Comércios Cadastrados"
          value={count.total_companies || 0}
          icon={<Building2 size={32} />}
          bgCard="bg-blue-light"
          textColor="text-blue-dark"
          path="/comercio"
          isAdmin={profile?.role.name.toLowerCase() === "administrador"}
        />

        <CardInfoPainel
          title="Novos Leads"
          value={count.new_leads || 0}
          icon={<Building2 size={32} />}
          bgCard="bg-green-light"
          textColor="text-green-dark"
          path="/comercio?tab=new_leads"
          isAdmin={profile?.role.name.toLowerCase() === "administrador"}
        />
      </div>

      {/* === BLOCO DESTAQUES POR PORTAL === */}
      {highlightByPortal.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Artigos em Destaque por Portal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {highlightByPortal.map((portal) => (
              <CardInfoPainel
                key={portal.portalName}
                title={`Portal: ${portal.portalName}`}
                value={portal.highlightCount}
                icon={<Sparkles size={32} />}
                bgCard="bg-yellow-100"
                textColor="text-yellow-700"
                path="/postagens"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

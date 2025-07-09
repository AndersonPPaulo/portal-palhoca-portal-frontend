"use client";

import ArticleTracker, { ArticleEvent } from "@/components/analyticTracker/article-tracker";
import BannerTracker, { BannerEvent } from "@/components/analyticTracker/banner-tracker";
import CompanyTracker, { CompanyEvent } from "@/components/analyticTracker/company-tracker";
import { useState, useEffect } from "react";

export default function UnifiedTrackersPage() {
  const [bannerEvents, setBannerEvents] = useState<BannerEvent[]>([]);
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [articleEvents, setArticleEvents] = useState<ArticleEvent[]>([]);

  // Banner Events
  useEffect(() => {
    const generateBannerEvent = (): BannerEvent => {
      const eventTypes = ["view", "view_end", "click_view"] as const;
      const bannerTitles = [
        "Black Friday - Desconto 70% em Eletrônicos",
        "Promoção Relâmpago - 2h apenas!",
        "iPhone 15 - Pré-venda Exclusiva",
        "Newsletter Premium - Cadastre-se Grátis",
        "Frete Grátis para Todo Brasil",
        "Primeira Compra - 30% OFF",
        "Liquidação de Verão - Até 80% OFF",
        "Cashback Duplo - Apenas Hoje",
      ];
      const positions = ["Header Top", "Sidebar Right", "Footer", "Pop-up Center", "Banner Lateral", "Header Bottom"];
      const campaigns = ["CAMP_BF2024", "CAMP_SUMMER", "CAMP_NEWUSER", "CAMP_CASHBACK", "CAMP_MOBILE"];
      const devices = ["desktop", "mobile", "tablet"] as const;
      const locations = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Salvador", "Recife"];
      
      return {
        id: `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        bannerTitle: bannerTitles[Math.floor(Math.random() * bannerTitles.length)],
        bannerPosition: positions[Math.floor(Math.random() * positions.length)],
        campaignId: campaigns[Math.floor(Math.random() * campaigns.length)],
        timestamp: new Date(),
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userLocation: locations[Math.floor(Math.random() * locations.length)],
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        referrer: Math.random() > 0.5 ? "Google Ads" : "Facebook Ads",
      };
    };

    // Eventos iniciais
    const initialBannerEvents = Array.from({ length: 15 }, () => {
      const event = generateBannerEvent();
      event.timestamp = new Date(Date.now() - Math.random() * 600000);
      return event;
    });
    setBannerEvents(initialBannerEvents);

    // Novos eventos
    const bannerInterval = setInterval(
      () => {
        const newEvent = generateBannerEvent();
        setBannerEvents((prev) => [newEvent, ...prev].slice(0, 100));
      },
      Math.random() * 2000 + 1000,
    );

    return () => clearInterval(bannerInterval);
  }, []);

  // Company Events
  useEffect(() => {
    const generateCompanyEvent = (): CompanyEvent => {
      const eventTypes = ["view", "view_end", "click_view"] as const;
      const companies = [
        { name: "TechStore Premium", category: "Eletrônicos", rating: 4.8, address: "Shopping Center Norte" },
        { name: "Fashion Boutique Elite", category: "Moda", rating: 4.5, address: "Rua Augusta, 1234" },
        { name: "Restaurante Sabor & Arte", category: "Gastronomia", rating: 4.7, address: "Vila Madalena" },
        { name: "Farmácia Saúde Total", category: "Saúde", rating: 4.3, address: "Av. Paulista, 567" },
        { name: "Livraria Mundo Literário", category: "Educação", rating: 4.6, address: "Centro Histórico" },
        { name: "Academia FitLife Pro", category: "Fitness", rating: 4.4, address: "Bairro Jardins" },
        { name: "Pet Shop Amigo Fiel", category: "Pet Care", rating: 4.9, address: "Vila Olímpia" },
        { name: "Ótica Visão Perfeita", category: "Saúde", rating: 4.2, address: "Shopping Iguatemi" },
      ];
      const actions = [
        "Visualizou cardápio completo",
        "Clicou em 'Ver localização'",
        "Salvou nos favoritos",
        "Compartilhou com amigos",
        "Clicou no telefone",
        "Visualizou galeria de fotos",
        "Leu todas as avaliações",
        "Clicou em 'Como chegar'",
      ];
      const locations = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Brasília"];
      const company = companies[Math.floor(Math.random() * companies.length)];
      
      return {
        id: `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        companyName: company.name,
        companyCategory: company.category,
        companyRating: company.rating,
        companyAddress: company.address,
        timestamp: new Date(),
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userLocation: locations[Math.floor(Math.random() * locations.length)],
        sessionDuration: Math.floor(Math.random() * 300) + 30,
        actionDetails: actions[Math.floor(Math.random() * actions.length)],
      };
    };

    // Eventos iniciais
    const initialCompanyEvents = Array.from({ length: 12 }, () => {
      const event = generateCompanyEvent();
      event.timestamp = new Date(Date.now() - Math.random() * 400000);
      return event;
    });
    setCompanyEvents(initialCompanyEvents);

    // Novos eventos
    const companyInterval = setInterval(
      () => {
        const newEvent = generateCompanyEvent();
        setCompanyEvents((prev) => [newEvent, ...prev].slice(0, 100));
      },
      Math.random() * 3000 + 1500,
    );

    return () => clearInterval(companyInterval);
  }, []);

  // Article Events
  useEffect(() => {
    const generateArticleEvent = (): ArticleEvent => {
      const eventTypes = ["view", "view_end", "click_view"] as const;
      const articles = [
        {
          title: "IA Generativa Transforma Educação no Brasil",
          category: "Tecnologia",
          author: "Dr. Carlos Silva",
          readingTime: 8,
        },
        {
          title: "PIB Brasileiro Cresce 2.1% no Último Trimestre",
          category: "Economia",
          author: "Ana Rodrigues",
          readingTime: 5,
        },
        {
          title: "Copa do Mundo 2026: Seleção Intensifica Preparação",
          category: "Esportes",
          author: "João Santos",
          readingTime: 6,
        },
        {
          title: "Revolução 5G Chega ao Interior do País",
          category: "Tecnologia",
          author: "Maria Tech",
          readingTime: 7,
        },
        {
          title: "Empresas Brasileiras Lideram Sustentabilidade",
          category: "Economia",
          author: "Pedro Green",
          readingTime: 9,
        },
        { title: "Educação Digital: O Futuro do Ensino", category: "Educação", author: "Prof. Laura", readingTime: 10 },
        { title: "Novo Tratamento para Diabetes Tipo 2", category: "Saúde", author: "Dr. Roberto", readingTime: 12 },
        {
          title: "Reforma Tributária Avança no Congresso",
          category: "Política",
          author: "Jornalista Ana",
          readingTime: 8,
        },
      ];
      const shareActions = ["facebook", "twitter", "whatsapp", "copy"] as const;
      const referrals = ["Google", "Facebook", "Twitter", "Direct", "Newsletter"];
      const locations = ["São Paulo", "Rio de Janeiro", "Brasília", "Recife", "Porto Alegre", "Belo Horizonte"];
      const article = articles[Math.floor(Math.random() * articles.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      return {
        id: `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType,
        articleTitle: article.title,
        articleCategory: article.category,
        author: article.author,
        readingTime: article.readingTime,
        timestamp: new Date(),
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userLocation: locations[Math.floor(Math.random() * locations.length)],
        readingProgress: eventType === "view" ? Math.floor(Math.random() * 100) : undefined,
        shareAction:
          eventType === "click_view" ? shareActions[Math.floor(Math.random() * shareActions.length)] : undefined,
        referralSource: referrals[Math.floor(Math.random() * referrals.length)],
      };
    };

    // Eventos iniciais
    const initialArticleEvents = Array.from({ length: 18 }, () => {
      const event = generateArticleEvent();
      event.timestamp = new Date(Date.now() - Math.random() * 800000);
      return event;
    });
    setArticleEvents(initialArticleEvents);

    // Novos eventos
    const articleInterval = setInterval(
      () => {
        const newEvent = generateArticleEvent();
        setArticleEvents((prev) => [newEvent, ...prev].slice(0, 100));
      },
      Math.random() * 4000 + 2000,
    );

    return () => clearInterval(articleInterval);
  }, []);

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden p-2">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 h-full">
        {/* Banner Tracker */}
        <div className="h-full overflow-hidden">
          <BannerTracker events={bannerEvents} maxEvents={50} autoRefresh={true} />
        </div>

        {/* Company Tracker */}
        <div className="h-full overflow-hidden">
          <CompanyTracker events={companyEvents} maxEvents={50} autoRefresh={true} />
        </div>

        {/* Article Tracker */}
        <div className="h-full overflow-hidden">
          <ArticleTracker events={articleEvents} maxEvents={50} autoRefresh={true} />
        </div>
      </div>
    </div>
  );
}
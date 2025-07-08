import {
  Eye,
  MousePointer,
  TrendingUp,
  MessageCircle,
  MapPin,
  User,
  BarChart3,
} from "lucide-react";
import type { EventTypeConfig, MetricConfig } from "../AnalyticsModal/index";

export const articleEventConfigs: EventTypeConfig[] = [
  {
    type: "view",
    label: "Visualizações",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Total de visualizações do artigo",
  },
  {
    type: "view_end",
    label: "Leituras Completas",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Usuários que chegaram ao final do artigo",
  },
  {
    type: "click",
    label: "Cliques",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Total de cliques no artigo",
  },
  {
    type: "whatsapp_click",
    label: "Cliques WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Cliques no botão WhatsApp",
  },
  {
    type: "map_click",
    label: "Cliques no Mapa",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Cliques em mapas ou localização",
  },
  {
    type: "profile_view",
    label: "Visualizações de Perfil",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Visualizações de perfil relacionadas",
  },
];

// Métricas calculadas específicas para artigos
export const articleMetricConfigs: MetricConfig[] = [
  {
    key: "total_views",
    label: "Total Views",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
    calculation: (events) => events.view || 0,
  },
  {
    key: "total_clicks",
    label: "Total Clicks",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    calculation: (events) => events.click || 0,
  },
  {
    key: "completion_rate",
    label: "Taxa Conclusão",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    calculation: (events) => {
      const views = events.view || 0;
      const ends = events.view_end || 0;
      return views > 0 ? `${((ends / views) * 100).toFixed(1)}%` : "0%";
    },
  },
  {
    key: "ctr",
    label: "CTR",
    icon: BarChart3,
    color: "text-orange-600",
    bgColor: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
    calculation: (events) => {
      const views = events.view || 0;
      const clicks = events.click || 0;
      return views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : "0%";
    },
  },
];


// Configuração específica para banners baseada no seu EventType
export const bannerEventConfigs: EventTypeConfig[] = [
  {
    type: "view",
    label: "Visualizações",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Total de visualizações do banner",
  },
  {
    type: "view_end",
    label: "Visualizações Completas",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Usuários que visualizaram o banner por completo",
  },
  {
    type: "click",
    label: "Cliques",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Total de cliques no banner",
  },
  {
    type: "whatsapp_click",
    label: "Cliques WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Cliques no botão WhatsApp do banner",
  },
  {
    type: "map_click",
    label: "Cliques no Mapa",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Cliques em mapas ou localização no banner",
  },
  {
    type: "profile_view",
    label: "Visualizações de Perfil",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Visualizações de perfil através do banner",
  },
];

// Métricas calculadas específicas para banners
export const bannerMetricConfigs: MetricConfig[] = [
  {
    key: "total_impressions",
    label: "Total Impressões",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
    calculation: (events) => events.view || 0,
  },
  {
    key: "total_interactions",
    label: "Total Interações",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    calculation: (events) => (events.click || 0) + (events.whatsapp_click || 0) + (events.map_click || 0),
  },
  {
    key: "view_completion_rate",
    label: "Taxa Visualização",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    calculation: (events) => {
      const views = events.view || 0;
      const ends = events.view_end || 0;
      return views > 0 ? `${((ends / views) * 100).toFixed(1)}%` : "0%";
    },
  },
  {
    key: "engagement_rate",
    label: "Taxa Engajamento",
    icon: BarChart3,
    color: "text-orange-600",
    bgColor: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
    calculation: (events) => {
      const views = events.view || 0;
      const totalEngagement = (events.click || 0) + (events.whatsapp_click || 0) + (events.profile_view || 0);
      return views > 0 ? `${((totalEngagement / views) * 100).toFixed(1)}%` : "0%";
    },
  },
];

// Configuração específica para comércios baseada no seu EventType
export const companyEventConfigs: EventTypeConfig[] = [
  {
    type: "view",
    label: "Visualizações",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Total de visualizações do comércio",
  },
  {
    type: "view_end",
    label: "Visualizações Completas",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Usuários que visualizaram completamente o perfil do comércio",
  },
  {
    type: "click",
    label: "Cliques",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Total de cliques no comércio",
  },
  {
    type: "whatsapp_click",
    label: "Cliques WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Cliques no WhatsApp do comércio",
  },
  {
    type: "map_click",
    label: "Cliques no Mapa",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Cliques na localização do comércio",
  },
  {
    type: "profile_view",
    label: "Visualizações de Perfil",
    icon: User,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Visualizações do perfil completo do comércio",
  },
];

// Métricas calculadas específicas para comércios
export const companyMetricConfigs: MetricConfig[] = [
  {
    key: "total_views",
    label: "Total Views",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
    calculation: (events) => events.view || 0,
  },
  {
    key: "total_clicks",
    label: "Total Clicks",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    calculation: (events) => events.click || 0,
  },
  {
    key: "engagement_rate",
    label: "Taxa Engajamento",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    calculation: (events) => {
      const views = events.view || 0;
      const profile_views = events.profile_view || 0;
      return views > 0 ? `${((profile_views / views) * 100).toFixed(1)}%` : "0%";
    },
  },
  {
    key: "conversion_rate",
    label: "Taxa Conversão",
    icon: BarChart3,
    color: "text-orange-600",
    bgColor: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
    calculation: (events) => {
      const views = events.view || 0;
      const whatsapp = events.whatsapp_click || 0;
      return views > 0 ? `${((whatsapp / views) * 100).toFixed(1)}%` : "0%";
    },
  },
];
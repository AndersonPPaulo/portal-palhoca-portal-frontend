import {
  Eye,
  MousePointer,
  TrendingUp,
  MessageCircle,
  MapPin,
  User,
  BarChart3,
  EyeOff,
} from "lucide-react";
import type { EventTypeConfig, MetricConfig } from "../AnalyticsModal/index";

export const articleEventConfigs: EventTypeConfig[] = [
  {
    type: "view",
    label: "Leituras",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Total de leituras da noticia",
  },
  {
    type: "view_end",
    label: "Leituras Completas",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Usuários que chegaram ao final da noticia",
  },
  {
    type: "click",
    label: "Cliques",
    icon: MousePointer,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Total de cliques na noticia",
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
    calculation: (events) =>
      (events.click || 0) +
      (events.whatsapp_click || 0) +
      (events.map_click || 0),
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
    key: "whatsapp_clicks",
    label: "Cliques no Whatsapp",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    calculation: (events) => events.whatsapp_click || 0,
  },
];

// Configuração específica para comércios baseada no seu EventType
export const companyEventConfigs: EventTypeConfig[] = [
  {
    type: "print",
    label: "Impressões",
    icon: EyeOff,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    description: "Aparições na tela principal e busca sem cliques",
  },
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
    type: "view_source",
    label: "Origem das Visualizações",
    icon: TrendingUp,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "Proporção de views do portal (com click) vs externas (sem click)",
  },
];

// Métricas calculadas específicas para comércios
export const companyMetricConfigs: MetricConfig[] = [
  {
    key: "print",
    label: "Impressões",
    icon: EyeOff,
    color: "text-slate-600",
    bgColor: "border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100",
    calculation: (events) => {
      // Impressões = aparições na tela principal e busca sem cliques
      const prints = events.print || 0;
      return prints;
    },
  },
  {
    key: "total_views",
    label: "Total Visualizações",
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
    key: "map_clicks",
    label: "Cliques no Mapa",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "border-red-200 bg-gradient-to-br from-red-50 to-red-100",
    calculation: (events) => events.map_click || 0,
  },
  {
    key: "whatsapp_clicks",
    label: "Cliques no WhatsApp",
    icon: MessageCircle,
    color: "text-green-600",
    bgColor: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    calculation: (events) => events.whatsapp_click || 0,
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  MousePointer,
  CheckCircle,
  FileText,
  Tag,
  Bell,
  Clock,
} from "lucide-react";
import {
  ArticleAnalyticsContext,
  IEvent,
} from "@/providers/analytics/ArticleAnalyticsProvider";

export interface ArticleEvent {
  id: string;
  eventType: "view" | "view_end" | "click";
  articleTitle: string;
  articleCategory: string;
  author: string;
  readingTime: number;
  timestamp: Date;
  userId: string;
  userLocation: string;
  readingProgress?: number;
  shareAction?: "facebook" | "twitter" | "whatsapp" | "copy";
  referralSource?: string;
}

interface ArticleTrackerProps {
  autoRefresh?: boolean;
}

const eventTypeConfig = {
  view: {
    label: "Começou a Ler",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  view_end: {
    label: "Leu até o Final",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  click: {
    label: "Clicou",
    icon: MousePointer,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
};

const categoryColors: Record<string, string> = {
  Tecnologia: "bg-blue-500",
  Política: "bg-red-500",
  Economia: "bg-green-500",
  Esportes: "bg-yellow-500",
  Saúde: "bg-pink-500",
  Educação: "bg-purple-500",
  Cultura: "bg-indigo-500",
};

function ArticleEventItem({ event }: { event: IEvent }) {
  const eventConfig = eventTypeConfig[
    event.event_type as keyof typeof eventTypeConfig
  ] ?? {
    label: "Evento desconhecido",
    icon: Bell, // fallback
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  };

  function formatTimeAgo(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return "agora mesmo";
    if (diffInSeconds < 5) return "agora mesmo";
    if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}min atrás`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  }
  const EventIcon = eventConfig.icon;
  const categoryColor = event?.article?.category?.name
    ? categoryColors[event.article.category.name] || "bg-gray-500"
    : "bg-gray-500";

  const eventDate = new Date(event.timestamp);
  const localTimeString = eventDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${eventConfig.bgColor} ${eventConfig.borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`p-2 rounded-full bg-white border-2 ${eventConfig.borderColor}`}
          >
            <EventIcon className={`w-4 h-4 ${eventConfig.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-500" />
              <Badge
                variant="secondary"
                className="bg-purple-500 text-white text-xs"
              >
                Notícia
              </Badge>
              <span className={`text-sm font-medium ${eventConfig.color}`}>
                {eventConfig.label}
              </span>
            </div>

            <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
              {event.article.title}
            </h4>

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <Badge
                variant="secondary"
                className={`${categoryColor} text-white text-xs`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {event.article.category.name}
              </Badge>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(event.timestamp)}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">{localTimeString}</div>
      </div>
    </div>
  );
}

export default function ArticleTracker({
  autoRefresh = true,
}: ArticleTrackerProps) {
  const { Get100EventsArticle, lastEventsArticle } = useContext(
    ArticleAnalyticsContext
  );

  const [isLive, setIsLive] = useState(autoRefresh);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  // Buscar dados iniciais com delay de 30 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      Get100EventsArticle(itemsPerPage);
    }, 30000);
    return () => clearTimeout(timer);
  }, [itemsPerPage, Get100EventsArticle]);

  useEffect(() => {
    if (!isLive) return;

    let interval: NodeJS.Timeout;

    // Aguardar 30 segundos antes de iniciar o intervalo
    const initialTimer = setTimeout(() => {
      // Primeira chamada após o delay
      Get100EventsArticle(itemsPerPage);

      // Intervalo de 45 segundos para atualização automática
      interval = setInterval(() => {
        Get100EventsArticle(itemsPerPage);
      }, 45000);
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      if (interval) clearInterval(interval);
    };
  }, [isLive, Get100EventsArticle, itemsPerPage]);

  const [eventFilter, setEventFilter] = useState<
    "all" | "view" | "view_end" | "click_view"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = Array.from(
    new Set(
      (Array.isArray(lastEventsArticle) ? lastEventsArticle : [])
        .map((e) => e.article?.category?.name)
        .filter(Boolean)
    )
  );
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Tracker de Notícias
              {isLive && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  AO VIVO
                </div>
              )}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>Total:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="text-xs border rounded px-2 py-1 bg-white cursor-pointer"
              >
                <option value={100}>100 itens</option>
                <option value={200}>200 itens</option>
                <option value={300}>300 itens</option>
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={isLive ? "text-green-600" : ""}
          >
            {isLive ? "Pausar" : "Retomar"}
          </Button>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ação:</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value as any)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">Todas</option>
              <option value="view">Leituras iniciadas</option>
              <option value="view_end">Leituras completas</option>
              <option value="click_view">Compartilhamentos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6">
          {lastEventsArticle.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento de notícia encontrado</p>
              <p className="text-sm">Aguardando leituras de artigos...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lastEventsArticle.map((event) => (
                <ArticleEventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

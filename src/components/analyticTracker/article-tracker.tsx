"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  MousePointer,
  CheckCircle,
  Clock,
  MapPin,
  User,
  FileText,
  Tag,
  Share2,
} from "lucide-react";

export interface ArticleEvent {
  id: string;
  eventType: "view" | "view_end" | "click_view";
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
  events: ArticleEvent[];
  maxEvents?: number;
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
  click_view: {
    label: "Compartilhou/Clicou",
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

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  return date.toLocaleDateString("pt-BR");
}

function ArticleEventItem({ event }: { event: ArticleEvent }) {
  const eventConfig = eventTypeConfig[event.eventType];
  const EventIcon = eventConfig.icon;
  const categoryColor = categoryColors[event.articleCategory] || "bg-gray-500";

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
              {event.articleTitle}
            </h4>

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <Badge
                variant="secondary"
                className={`${categoryColor} text-white text-xs`}
              >
                <Tag className="w-3 h-3 mr-1" />
                {event.articleCategory}
              </Badge>
              <span>Por: {event.author}</span>
              <span>{event.readingTime} min de leitura</span>
            </div>

            {event.readingProgress && event.eventType === "view" && (
              <div className="mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Progresso de leitura:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${event.readingProgress}%` }}
                    />
                  </div>
                  <span>{event.readingProgress}%</span>
                </div>
              </div>
            )}

            {event.shareAction && event.eventType === "click_view" && (
              <div className="mb-2 text-sm text-gray-600">
                <Share2 className="w-3 h-3 inline mr-1" />
                Compartilhou via:{" "}
                <Badge variant="outline" className="text-xs">
                  {event.shareAction}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(event.timestamp)}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {event.userId}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.userLocation}
              </div>
              {event.referralSource && <span>Via: {event.referralSource}</span>}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {event.timestamp.toLocaleTimeString("pt-BR")}
        </div>
      </div>
    </div>
  );
}

export default function ArticleTracker({
  events,
  maxEvents = 50,
  autoRefresh = true,
}: ArticleTrackerProps) {
  const [filteredEvents, setFilteredEvents] = useState<ArticleEvent[]>(events);
  const [eventFilter, setEventFilter] = useState<
    "all" | "view" | "view_end" | "click_view"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLive, setIsLive] = useState(autoRefresh);

  const categories = Array.from(new Set(events.map((e) => e.articleCategory)));

  useEffect(() => {
    let filtered = events;

    if (eventFilter !== "all") {
      filtered = filtered.filter((event) => event.eventType === eventFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (event) => event.articleCategory === categoryFilter
      );
    }

    filtered = filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxEvents);
    setFilteredEvents(filtered);
  }, [events, eventFilter, categoryFilter, maxEvents]);

  const totalEvents = events.length;
  const recentEvents = events.filter(
    (e) => new Date().getTime() - e.timestamp.getTime() < 60000
  ).length;
  const completedReads = events.filter(
    (e) => e.eventType === "view_end"
  ).length;
  const shares = events.filter(
    (e) => e.eventType === "click_view" && e.shareAction
  ).length;

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
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>Total: {totalEvents}</span>
              <span>Último minuto: {recentEvents}</span>
              <span>Leituras completas: {completedReads}</span>
              <span>Compartilhamentos: {shares}</span>
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
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento de notícia encontrado</p>
              <p className="text-sm">Aguardando leituras de artigos...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <ArticleEventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

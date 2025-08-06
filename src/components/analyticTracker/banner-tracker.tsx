// banner-tracker.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MousePointer,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Target,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

export interface BannerEvent {
  id: string;
  eventType: "view" | "view_end" | "click_view";
  bannerTitle: string;
  bannerPosition: string;
  campaignId: string;
  timestamp: Date;
  userId: string;
  userLocation: string;
  deviceType: "desktop" | "mobile" | "tablet";
  referrer?: string;
}

interface BannerTrackerProps {
  events: BannerEvent[];
  maxEvents?: number;
  autoRefresh?: boolean;
}

const eventTypeConfig = {
  view: {
    label: "Visualizou Banner",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  view_end: {
    label: "Viu Banner Completo",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  click_view: {
    label: "Clicou no Banner",
    icon: MousePointer,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
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

function BannerEventItem({ event }: { event: BannerEvent }) {
  const eventConfig = eventTypeConfig[event.eventType];
  const EventIcon = eventConfig.icon;

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
              <Target className="w-4 h-4 text-blue-500" />
              <Badge
                variant="secondary"
                className="bg-blue-500 text-white text-xs"
              >
                Banner
              </Badge>
              <span className={`text-sm font-medium ${eventConfig.color}`}>
                {eventConfig.label}
              </span>
            </div>

            <h4 className="font-medium text-gray-900 mb-1">
              {event.bannerTitle}
            </h4>

            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Posição:</span>{" "}
              {event.bannerPosition} •
              <span className="font-medium"> Campanha:</span> {event.campaignId}
            </div>

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
              <Badge variant="outline" className="text-xs">
                {event.deviceType}
              </Badge>
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

export default function BannerTracker({
  events,
  maxEvents = 50,
  autoRefresh = true,
}: BannerTrackerProps) {
  const [filteredEvents, setFilteredEvents] = useState<BannerEvent[]>(events);
  const [eventFilter, setEventFilter] = useState<
    "all" | "view" | "view_end" | "click_view"
  >("all");
  const [isLive, setIsLive] = useState(autoRefresh);

  useEffect(() => {
    let filtered = events;

    if (eventFilter !== "all") {
      filtered = filtered.filter((event) => event.eventType === eventFilter);
    }

    filtered = filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxEvents);
    setFilteredEvents(filtered);
  }, [events, eventFilter, maxEvents]);

  const totalEvents = events.length;
  const recentEvents = events.filter(
    (e) => new Date().getTime() - e.timestamp.getTime() < 60000
  ).length;
  const clickEvents = events.filter((e) => e.eventType === "click_view").length;
  const viewEvents = events.filter((e) => e.eventType === "view").length;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Tracker de Banners
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
              <span>Cliques: {clickEvents}</span>
              <span>Views: {viewEvents}</span>
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

        <div className="flex items-center gap-2 pt-4 border-t">
          <span className="text-sm text-gray-600">Filtrar por ação:</span>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as any)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="all">Todas as ações</option>
            <option value="view">Visualizações</option>
            <option value="view_end">Visto completo</option>
            <option value="click_view">Cliques</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento de banner encontrado</p>
              <p className="text-sm">Aguardando interações com banners...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <BannerEventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

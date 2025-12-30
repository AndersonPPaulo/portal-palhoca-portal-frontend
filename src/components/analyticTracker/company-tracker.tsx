"use client";

import { useState, useEffect, useContext, useMemo } from "react";
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
  Store,
  Star,
  Bell,
} from "lucide-react";

import {
  CompanyAnalyticsContext,
  IEvent,
} from "@/providers/analytics/CompanyAnalyticsProvider"; // precisa criar provider igual ao de banner

interface CompanyTrackerProps {
  autoRefresh?: boolean;
}

const eventTypeConfig = {
  view: {
    label: "Visualizou Comércio",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  view_end: {
    label: "Explorou Completamente",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  click: {
    label: "Interagiu com Comércio",
    icon: MousePointer,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  whatsapp_click: {
    label: "Clicou no Whatsapp",
    icon: MousePointer,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
  },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  return date.toLocaleDateString("pt-BR");
}

function CompanyEventItem({ event }: { event: IEvent }) {
  const eventConfig = eventTypeConfig[
    event.event_type as keyof typeof eventTypeConfig
  ] ?? {
    label: "Evento desconhecido",
    icon: Bell,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  };

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
              <Store className="w-4 h-4 text-green-500" />
              <Badge
                variant="secondary"
                className="bg-green-500 text-white text-xs"
              >
                Comércio
              </Badge>
              <span className={`text-sm font-medium ${eventConfig.color}`}>
                {eventConfig.label}
              </span>
            </div>

            <h4 className="font-medium text-gray-900 mb-1">
              {event.company.name}
            </h4>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(event.timestamp)}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {new Date(event.timestamp).toLocaleTimeString("pt-BR")}
        </div>
      </div>
    </div>
  );
}

export default function CompanyTracker({
  autoRefresh = true,
}: CompanyTrackerProps) {
  const { Get100EventsCompany, lastEventsCompany } = useContext(
    CompanyAnalyticsContext
  );

  const [isLive, setIsLive] = useState(autoRefresh);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  // Buscar dados iniciais imediatamente
  useEffect(() => {
    Get100EventsCompany(itemsPerPage);
  }, [itemsPerPage, Get100EventsCompany]);

  useEffect(() => {
    if (!isLive) return;

    // Intervalo de 45 segundos para atualização automática
    const interval = setInterval(() => {
      Get100EventsCompany(itemsPerPage);
    }, 45000);

    return () => clearInterval(interval);
  }, [isLive, Get100EventsCompany, itemsPerPage]);

  const [eventFilter, setEventFilter] = useState<
    "all" | "view" | "view_end" | "click" | "whatsapp_click"
  >("all");

  const filteredEvents = useMemo(() => {
    return lastEventsCompany.filter((event) =>
      eventFilter === "all" ? true : event.event_type === eventFilter
    );
  }, [lastEventsCompany, eventFilter]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-green-500" />
              Tracker de Comércios
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

        <div className="flex items-center gap-2 pt-4 border-t">
          <span className="text-sm text-gray-600">Filtrar por ação:</span>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as any)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="all">Todas as ações</option>
            <option value="view">Visualizações</option>
            <option value="view_end">Explorou</option>
            <option value="click">Interações</option>
            <option value="whatsapp_click">Cliques no WhatsApp</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento de comércio encontrado</p>
              <p className="text-sm">
                Aguardando interações com estabelecimentos...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <CompanyEventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

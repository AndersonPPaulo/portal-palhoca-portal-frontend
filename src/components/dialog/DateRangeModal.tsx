"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, CalendarDays, CalendarRange } from "lucide-react";

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
  title: string;
}

type PeriodPreset =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "year"
  | "custom";

export default function DateRangeModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DateRangeModalProps) {
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMonthDates = () => {
    const now = new Date();
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return {
      start: formatDateTimeLocal(start),
      end: formatDateTimeLocal(now),
    };
  };

  const monthDates = getMonthDates();

  const [startDate, setStartDate] = useState(monthDates.start);
  const [endDate, setEndDate] = useState(monthDates.end);
  const [error, setError] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset>("month");

  const applyPreset = (preset: PeriodPreset) => {
    setSelectedPreset(preset);
    setError("");

    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case "today":
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = now;
        break;

      case "yesterday":
        start = new Date();
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;

      case "week":
        // Início da semana (domingo)
        const dayOfWeek = now.getDay();
        start = new Date();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end = now;
        break;

      case "month":
        start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end = now;
        break;

      case "year":
        start = new Date();
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end = now;
        break;

      case "custom":
        setStartDate("");
        setEndDate("");
        return;
    }

    setStartDate(formatDateTimeLocal(start));
    setEndDate(formatDateTimeLocal(end));
  };

  const presetButtons = [
    { value: "today" as PeriodPreset, label: "Hoje", icon: Clock },
    { value: "yesterday" as PeriodPreset, label: "Ontem", icon: Calendar },
    { value: "week" as PeriodPreset, label: "Esta Semana", icon: CalendarDays },
    { value: "month" as PeriodPreset, label: "Este Mês", icon: CalendarDays },
    { value: "year" as PeriodPreset, label: "Este Ano", icon: CalendarRange },
    {
      value: "custom" as PeriodPreset,
      label: "Personalizado",
      icon: CalendarRange,
    },
  ];

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      setError("Por favor, preencha ambas as datas.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError("A data inicial não pode ser maior que a data final.");
      return;
    }

    setError("");
    onConfirm(startDate, endDate);
    handleClose();
  };

  const handleClose = () => {
    const monthDates = getMonthDates();
    setStartDate(monthDates.start);
    setEndDate(monthDates.end);
    setError("");
    setSelectedPreset("month");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Selecione um período pré-definido ou escolha datas personalizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Botões de Período Pré-definido */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Período</Label>
            <div className="grid grid-cols-3 gap-2">
              {presetButtons.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={
                      selectedPreset === preset.value ? "default" : "outline"
                    }
                    onClick={() => applyPreset(preset.value)}
                    className={`w-full ${
                      selectedPreset === preset.value
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Inputs de Data */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Data Inicial
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedPreset("custom");
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              Data Final
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedPreset("custom");
              }}
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Gerar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

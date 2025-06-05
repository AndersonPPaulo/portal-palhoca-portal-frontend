"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Star, Upload, X } from "lucide-react";

interface NewsHighlightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (
    isHighlight: boolean,
    highlightPosition?: number
  ) => Promise<void>;
  newsTitle?: string;
}

export default function HighlightModal({
  open,
  onOpenChange,
  onPublish,
  newsTitle = "Nova Notícia",
}: NewsHighlightModalProps) {
  const [isHighlight, setIsHighlight] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<
    number | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await onPublish(isHighlight, highlightPosition);
      // Reset do estado após publicar
      setIsHighlight(false);
      setHighlightPosition(undefined);
    } catch (error) {
      console.error("Erro ao publicar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsHighlight(false);
    setHighlightPosition(undefined);
    onOpenChange(false);
  };

  const toggleHighlight = () => {
    setIsHighlight(!isHighlight);
    if (!isHighlight) {
      setHighlightPosition(undefined);
    }
  };

  // Reset do estado quando o modal é fechado
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsHighlight(false);
      setHighlightPosition(undefined);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-[600px] h-auto max-h-[90vh] m-0 p-0 rounded-lg overflow-hidden dialog-content">
        <div className="flex flex-col h-full">
          {/* Cabeçalho fixo */}
          <DialogHeader className="bg-[#333] text-white py-4 px-6 border-b border-gray-600 flex-shrink-0">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="mr-4 text-white hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <DialogTitle className="text-xl font-semibold truncate">
                Configurações de Publicação
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Conteúdo principal */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
            <div className="w-full max-w-4xl mx-auto p-6">
              <div className="space-y-6">
                {/* Título da notícia */}
                <div className="bg-gray-100 p-4 rounded-md">
                  <h2 className="text-xl font-bold mb-2">{newsTitle}</h2>
                  <p className="text-sm text-gray-600">
                    Configure as opções de destaque antes de publicar sua
                    notícia
                  </p>
                </div>

                {/* Configuração de destaque */}
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <div className="space-y-4">
                    {/* Botão de destaque no meio */}
                    <div className="flex justify-center">
                      <Button
                        onClick={toggleHighlight}
                        variant={isHighlight ? "default" : "outline"}
                        className={`${
                          isHighlight
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                        } rounded-3xl min-h-[48px] text-[16px] px-8 shadow-sm transition-all duration-200`}
                      >
                        <Star className="mr-2 h-5 w-5" />
                        {isHighlight
                          ? "Remover Destaque"
                          : "Definir como Destaque"}
                      </Button>
                    </div>

                    {/* Select de nível de destaque */}
                    {isHighlight && (
                      <div className="mt-6 space-y-3">
                        <label className="block text-sm font-medium text-gray-700 bg-white">
                          Nível de Destaque
                        </label>
                        <Select
                          value={highlightPosition?.toString()}
                          onValueChange={(value) =>
                            setHighlightPosition(Number.parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Selecione o nível de destaque" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="1">
                              Destaque Principal (Posição 1)
                            </SelectItem>
                            <SelectItem value="2">
                              Segundo Destaque (Posição 2)
                            </SelectItem>
                            <SelectItem value="3">
                              Terceiro Destaque (Posição 3)
                            </SelectItem>
                            <SelectItem value="4">
                              Quarto Destaque (Posição 4)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Quanto menor o número, maior a prioridade de exibição
                        </p>
                      </div>
                    )}

                    {/* Informações sobre destaque */}
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h3 className="font-semibold mb-2 text-blue-800">
                        {isHighlight
                          ? "Notícia será publicada em destaque"
                          : "Notícia será publicada normalmente"}
                      </h3>
                      <p className="text-sm text-blue-700">
                        {isHighlight
                          ? `Esta notícia aparecerá na seção de destaques${
                              highlightPosition
                                ? ` na posição ${highlightPosition}`
                                : ""
                            }.`
                          : "Esta notícia aparecerá na listagem normal de notícias."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé fixo com ações */}
          <div className="bg-gray-200 py-4 px-6 flex justify-between items-center flex-shrink-0 border-t border-gray-300">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar Publicação
            </Button>

            <Button
              onClick={handlePublish}
              className="bg-green-500 text-white hover:bg-green-600 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
              disabled={isSubmitting || (isHighlight && !highlightPosition)}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

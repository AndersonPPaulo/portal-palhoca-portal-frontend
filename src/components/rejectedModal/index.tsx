"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RejectedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  motivo: string;
}

export function RejectedModal({
  open,
  onOpenChange,
  titulo,
  motivo,
}: RejectedModalProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[50vw] max-w-[50vw] h-[60vh] max-h-[60vh] m-0 p-0 rounded-lg overflow-hidden dialog-content">
          <div className="flex flex-col h-full">
            {/* Cabeçalho fixo */}
            <DialogHeader className="article-review-modal-header bg-[#333] text-white py-4 px-6 border-b border-gray-600 flex-shrink-0">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="mr-4 text-white hover:bg-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <DialogTitle className="text-xl font-semibold truncate">
                  Motivo de Rejeição
                </DialogTitle>
              </div>
            </DialogHeader>

            {/* Conteúdo principal com scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
              <div className="w-full max-w-4xl mx-auto p-6">
                <div className="space-y-6">
                  {/* Conteúdo da rejeição */}
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <X className="h-5 w-5 mr-2 text-red-600" />
                      Detalhes da Rejeição
                    </h3>
                    <div className="prose max-w-none overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap text-gray-700 p-3 bg-white rounded border border-red-100">
                      {motivo ||
                        "Nenhum motivo específico foi fornecido pelo revisor."}
                    </div>
                  </div>

                  {/* Orientação */}
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">O que fazer agora?</h3>
                    <p className="text-gray-700">
                      Este artigo foi rejeitado e não poderá ser publicado em
                      seu estado atual. Você pode criar um novo artigo, levando
                      em consideração os motivos da rejeição fornecidos acima.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé fixo com ações */}
            <div className="bg-gray-200 py-4 px-6 flex justify-end space-x-4 flex-shrink-0 border-t border-gray-300">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-3xl min-h-[48px] text-[16px] px-6 whitespace-nowrap shadow-sm"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RejectedModal;

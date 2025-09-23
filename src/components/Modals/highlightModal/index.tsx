"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";

type Portal = {
  id: string;
  name: string;
};

type PortalConfig = {
  portalId: string;
  name: string;
  highlight: boolean;
  highlight_position?: number | null;
};

type NewsHighlightModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (data: { portals: PortalConfig[] }) => Promise<void>; // envia o JSON inteiro
  newsTitle: string;
  portals: Portal[]; // <<< receber do ArticleViewModal
};

export default function HighlightModal({
  open,
  onOpenChange,
  onPublish,
  newsTitle = "Nova Notícia",
  portals,
}: NewsHighlightModalProps) {
  const [portalsConfig, setPortalsConfig] = useState<PortalConfig[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // inicializa os portais sempre que mudar
  useEffect(() => {
    if (portals?.length) {
      setPortalsConfig(
        portals.map((p) => ({
          portalId: p.id,
          name: p.name,
          highlight: false,
          highlight_position: undefined,
        }))
      );
    }
  }, [portals]);

  const handleToggleHighlight = (portalId: string) => {
    setPortalsConfig((prev) =>
      prev.map((p) =>
        p.portalId === portalId
          ? {
              ...p,
              highlight: !p.highlight,
              highlight_position: !p.highlight
                ? undefined
                : p.highlight_position,
            }
          : p
      )
    );
  };

  const handleSetPosition = (portalId: string, value: string) => {
    setPortalsConfig((prev) =>
      prev.map((p) =>
        p.portalId === portalId
          ? { ...p, highlight_position: Number(value) }
          : p
      )
    );
  };

  const handlePublish = async () => {
    // validação
    for (const portal of portalsConfig) {
      if (portal.highlight && !portal.highlight_position) {
        toast.error(
          `Por favor, selecione a posição do destaque para o portal ${portal.name}`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onPublish({ portals: portalsConfig });
      toast.success("Publicação realizada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao publicar:", error);
      toast.error("Erro ao processar a publicação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPortalsConfig(
      portals.map((p) => ({
        portalId: p.id,
        name: p.name,
        highlight: false,
        highlight_position: undefined,
      }))
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[700px] max-h-[90vh] p-0 rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="bg-[#333] text-white py-4 px-6 border-b border-gray-600">
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

          <div className="flex-1 bg-white flex flex-col">
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-gray-100 p-4 rounded-md">
                <h2 className="text-xl font-bold mb-2">{newsTitle}</h2>
                <p className="text-sm text-gray-600">
                  Configure as opções de destaque em cada portal
                </p>
              </div>

              {portalsConfig.map((portal) => (
                <div
                  key={portal.portalId}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <h3 className="font-semibold text-lg">{portal.name}</h3>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => handleToggleHighlight(portal.portalId)}
                      variant={portal.highlight ? "default" : "outline"}
                      className={`${
                        portal.highlight
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                      } rounded-3xl min-h-[40px] text-[15px] px-6`}
                    >
                      <Star className="mr-2 h-5 w-5" />
                      {portal.highlight
                        ? "Remover Destaque"
                        : "Definir como Destaque"}
                    </Button>
                  </div>

                  {portal.highlight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posição do Destaque *
                      </label>
                      <Select
                        value={portal.highlight_position?.toString()}
                        onValueChange={(val) =>
                          handleSetPosition(portal.portalId, val)
                        }
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Selecione a posição" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {[1, 2, 3, 4].map((pos) => (
                            <SelectItem key={pos} value={pos.toString()}>
                              {`Posição ${pos}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-200 py-4 px-6 flex justify-between items-center border-t border-gray-300">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-3xl px-6"
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>

            <Button
              onClick={handlePublish}
              className="bg-green-500 text-white hover:bg-green-600 rounded-3xl px-6 disabled:opacity-50"
              disabled={isSubmitting}
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

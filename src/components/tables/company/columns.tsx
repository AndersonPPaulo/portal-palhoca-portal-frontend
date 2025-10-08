"use client";

import CompanyAnalyticsModal from "@/components/Modals/AnalyticsModal/companyAnalyticsModal";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { ICompanyProps, CompanyContext } from "@/providers/company";
import { ColumnDef } from "@tanstack/react-table";
import { format, set } from "date-fns";
import { ChartLine, Edit, Star, StarOff } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useContext } from "react";
import { toast } from "sonner";

const CellActions = (company: ICompanyProps) => {
  const { push } = useRouter();
  const { 
    UpdateCompany, 
    ListCompany, 
    listCompany,
    currentFilters, 
    currentPage, 
    currentLimit 
  } = useContext(CompanyContext);
  const [loading, setLoading] = useState(false);
  // ✅ Estado local para controlar o highlight de forma otimista
  const [optimisticHighlight, setOptimisticHighlight] = useState(company.highlight);

  // ✅ Sincronizar quando os dados da empresa mudarem
  React.useEffect(() => {
    setOptimisticHighlight(company.highlight);
  }, [company.highlight]);

  const handleToggleHighlight = async () => {
    const newHighlightValue = !optimisticHighlight;
    
    try {
      setLoading(true);
      // ✅ Atualiza o ícone IMEDIATAMENTE (otimista)
      setOptimisticHighlight(newHighlightValue);
      
      // Enviar todos os campos obrigatórios que o backend espera
      const updateData = {
        name: company.name,
        email: company.email,
        responsibleName: company.responsibleName || company.name,
        document_number: company.document_number,
        document_type: company.document_type,
        status: company.status,
        openingHours: company.openingHours || "",
        lat: company.lat,
        long: company.long,
        zipcode: company.zipcode,
        highlight: newHighlightValue,
        companyCategoryIds: company.company_category?.map(cat => cat.id) || [],
        portalIds: company.portals?.map(portal => portal.id) || [],
        phone: company.phone,
        description: company.description,
        linkInstagram: company.linkInstagram,
        linkWhatsapp: company.linkWhatsapp,
        linkLocationMaps: company.linkLocationMaps,
        linkLocationWaze: company.linkLocationWaze,
        address: company.address,
        district: company.district,
        city: company.city,
      };

      await UpdateCompany(updateData, company.id);
      
      // ✅ Atualizar localmente sem fazer nova requisição
      // Isso evita perder os filtros e é mais rápido
      if (listCompany) {
        const updatedData = listCompany.data.map(c => 
          c.id === company.id ? { ...c, highlight: newHighlightValue } : c
        );
        listCompany.data = updatedData;
      }
      
    } catch (err: any) {
      // ✅ Se der erro, volta ao estado anterior
      setOptimisticHighlight(!newHighlightValue);
      console.error("Erro ao atualizar destaque:", err);
      toast.error(err.response?.data?.message || "Erro ao atualizar destaque do comércio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 items-center">
      {/* Editar Comércio */}
      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit
              onClick={() => push(`/comercio/editar/${company.id}`)}
              size={20}
              className="text-primary cursor-pointer hover:text-primary-dark transition-colors"
            />
          </TooltipTrigger>
          <TooltipContent
            className="rounded-2xl shadow-sm bg-primary-light text-[15px] text-primary px-4 py-2 animate-fadeIn"
            sideOffset={5}
          >
            <span>Editar Comércio</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Toggle Highlight */}
      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleToggleHighlight}
              disabled={loading}
              className="focus:outline-none"
            >
              {/* ✅ Usa o estado otimista ao invés do company.highlight */}
              {optimisticHighlight ? (
                <Star
                  size={22}
                  className={`cursor-pointer transition-all duration-200 ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "text-yellow-500 hover:text-yellow-600"
                  }`}
                  fill={optimisticHighlight ? "currentColor" : "none"}
                />
              ) : (
                <StarOff
                  size={22}
                  className={`cursor-pointer transition-all duration-200 ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "text-gray-400 hover:text-yellow-500"
                  }`}
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            className="rounded-2xl shadow-sm bg-primary-light text-[15px] text-primary px-4 py-2 animate-fadeIn"
            sideOffset={5}
          >
            <span>
              {optimisticHighlight ? "Remover destaque" : "Destacar comércio"}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};


// Célula de analíticos
const AnalyticsCell = ({ company }: { company: ICompanyProps }) => {
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  return (
    <>
      <TooltipProvider delayDuration={600}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="text-center text-primary w-[150px] truncate flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 rounded-lg p-2 transition-colors"
              onClick={() => setIsAnalyticsModalOpen(true)}
            >
              <ChartLine size={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="rounded-2xl shadow-sm bg-primary-light text-[15px] text-primary px-4 py-2 animate-fadeIn"
            sideOffset={5}
          >
            <span>Ver estatísticas detalhadas</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CompanyAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        companyId={company.id}
        companyTitle={company.name}
      />
    </>
  );
};

export const columns: ColumnDef<ICompanyProps>[] = [
  {
    accessorKey: "name",
    header: () => <div>Comércio</div>,
  },
  {
    id: "location",
    header: () => <div className="text-start">Localização</div>,
    cell: ({ row }) => {
      const { city, district } = row.original;
      return (
        <div className="text-start leading-5">
          <div className="font-medium text-gray-800">{city || "-"}</div>
          <div className="text-sm text-gray-500">{district || "-"}</div>
        </div>
      );
    },
  },
  {
    id: "info",
    header: () => <div className="text-start">Informações</div>,
    cell: ({ row }) => {
      const { created_at, status } = row.original;
      const formattedDate = created_at ? format(created_at, "dd/MM/yyyy") : "-";

      const statusTextMap: Record<string, string> = {
        active: "Ativo",
        blocked: "Bloqueado",
        new_lead: "Novo Lead",
        inactive: "Inativo",
      };

      const statusColorMap: Record<string, string> = {
        active: "bg-green-500",
        blocked: "bg-red-500",
        new_lead: "bg-primary",
        inactive: "bg-yellow-600",
      };

      const statusText = statusTextMap[status] || "Em processo";
      const statusColor = statusColorMap[status] || "bg-orange-500";

      return (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-gray-800">
            <span className="font-medium">Cadastrado:</span> {formattedDate}
          </div>
          <span
            className={`text-white ${statusColor} font-bold px-3 py-1 rounded-full text-sm w-fit`}
          >
            {statusText}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Analíticos",
    header: () => <div className="text-center w-[150px]">Analíticos</div>,
    cell: ({ row }) => <AnalyticsCell company={row.original} />,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    size: 150,
    cell: ({ row }) => (
      <div className="flex justify-center">{CellActions(row.original)}</div>
    ),
  },
];

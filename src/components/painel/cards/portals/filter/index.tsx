"use client";

import { useState, useContext, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { PortalContext } from "@/providers/portal";
import CustomSelect from "@/components/select/custom-select";
import TableWhatsapp from "@/components/tables/whatsapp-group/page";

export default function WhatsappGroupsWithFilters() {
  const [filter, setFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    portal_id: null as string | null,
    is_active: null as boolean | null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [portalValue, setPortalValue] = useState("");
  const [statusValue, setStatusValue] = useState("");

  const { ListPortals, listPortals } = useContext(PortalContext);

  useEffect(() => {
    ListPortals();
  }, []);

  // Opções para os selects
  const portalOptions = [
    { value: "", label: "Todos os portais" },
    ...(listPortals?.map(portal => ({
      value: portal.id,
      label: portal.name
    })) || [])
  ];

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

  const handlePortalChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    setPortalValue(stringValue);
    setActiveFilters(prev => ({
      ...prev,
      portal_id: stringValue || null
    }));
  };

  const handleStatusChange = (value: string | string[]) => {
    const stringValue = Array.isArray(value) ? value[0] : value;
    setStatusValue(stringValue);
    setActiveFilters(prev => ({
      ...prev,
      is_active: stringValue ? stringValue === "true" : null
    }));
  };

  const clearFilters = () => {
    setFilter("");
    setPortalValue("");
    setStatusValue("");
    setActiveFilters({
      portal_id: null,
      is_active: null,
    });
  };

  const hasActiveFilters = filter || activeFilters.portal_id || activeFilters.is_active !== null;

  return (
    <div className="w-full space-y-4">
      {/* Barra de busca e filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Linha principal - Busca e botão de filtros */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por portal ou link do WhatsApp..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-primary text-white rounded-full w-2 h-2"></span>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>

          {/* Filtros expansíveis */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <CustomSelect
                id="portal_filter"
                label="Portal"
                options={portalOptions}
                value={portalValue}
                onChange={handlePortalChange}
                placeholder="Selecione um portal"
              />

              <CustomSelect
                id="status_filter"
                label="Status"
                options={statusOptions}
                value={statusValue}
                onChange={handleStatusChange}
                placeholder="Selecione um status"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <TableWhatsapp filter={filter} activeFilters={activeFilters} />
      </Card>
    </div>
  );
}
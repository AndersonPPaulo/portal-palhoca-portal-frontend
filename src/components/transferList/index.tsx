"use client";

import { Search, ChevronRight, ChevronLeft, Check } from "lucide-react";
import CustomInput from "../input/custom-input";
import { useCompanyTransfer } from "@/providers/CompanyTransfer";
import { Button } from "../ui/button";

interface CompanyTransferListProps {
  sourceTitle?: string;
  targetTitle?: string;
  className?: string;
}

const CompanyTransferList: React.FC<CompanyTransferListProps> = ({
  sourceTitle = "Comércios Cadastrados",
  targetTitle = "Comércios Selecionados",
  className = "",
}) => {
  const {
    isLoading,
    filteredSourceItems,
    filteredTargetItems,
    sourceSearchQuery,
    targetSearchQuery,
    setSourceSearchQuery,
    setTargetSearchQuery,
    selectedSourceItems,
    selectedTargetItems,
    toggleSelection,
    selectAll,
    deselectAll,
    moveToTarget,
    moveToSource,
    moveAllToTarget,
  } = useCompanyTransfer();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Carregando Comércios
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      <div className="flex-1 border-2 border-primary-light rounded-[24px] p-4">
        <h3 className="text-lg font-medium mb-3 px-2">{sourceTitle}</h3>

        <CustomInput
          placeholder="Procurar Comércios"
          value={sourceSearchQuery}
          onChange={(e) => setSourceSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="mb-3"
        />

        <div className="flex justify-between mb-2 px-2">
          <div className="flex gap-2">
            <Button
              onClick={() => selectAll("source")}
              className="rounded-3xl h-8 text-[13px] p-1"
            >
              Selecionar todos
            </Button>
            <Button
              onClick={() => deselectAll("source")}
              className="rounded-3xl h-8 text-[13px] p-1"
            >
              Limpar
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedSourceItems.length} de {filteredSourceItems.length}{" "}
            Selecionados
          </div>
        </div>

        <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-[16px]">
          {filteredSourceItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredSourceItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedSourceItems.includes(item.id) ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggleSelection(item.id, "source")}
                >
                  <div className="w-5 h-5 mr-3 flex-shrink-0">
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedSourceItems.includes(item.id)
                          ? "border-primary-light bg-primary-light"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedSourceItems.includes(item.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-body-m">{item.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Nenhum comércio encontrado
            </div>
          )}
        </div>
      </div>

      <div className="flex md:flex-col justify-center ">
        <Button
          onClick={() => moveToTarget(selectedSourceItems)}
          disabled={selectedSourceItems.length === 0}
          className={`p-4 mb-1 rounded-full border-2${
            selectedSourceItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move selected companies to target"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => moveToSource(selectedTargetItems)}
          disabled={selectedTargetItems.length === 0}
          className={`p-2 rounded-full border-2 bg-blue-600 hover:bg-blue-700 text-white ${
            selectedTargetItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move selected companies to source"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 border-2 border-primary-light rounded-[24px] p-4">
        <h3 className="text-lg font-medium mb-3 px-2">{targetTitle}</h3>

        <CustomInput
          placeholder="Procurar Comércios Selecionados"
          value={targetSearchQuery}
          onChange={(e) => setTargetSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="mb-3"
        />

        <div className="flex justify-between mb-2 px-2">
          <div className="flex gap-2">
            <Button
              onClick={() => selectAll("target")}
              className="rounded-3xl h-8 text-[13px] p-1"
            >
              Selecionar todos
            </Button>
            <Button
              onClick={() => deselectAll("target")}
              className="rounded-3xl h-8 text-[13px] p-1"
            >
              Limpar
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedTargetItems.length} de {filteredTargetItems.length}{" "}
            Selecionados
          </div>
        </div>

        <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-[16px]">
          {filteredTargetItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredTargetItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedTargetItems.includes(item.id) ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggleSelection(item.id, "target")}
                >
                  <div className="w-5 h-5 mr-3 flex-shrink-0">
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedTargetItems.includes(item.id)
                          ? "border-primary-light bg-primary-light"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedTargetItems.includes(item.id) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-body-m">{item.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Nenhum Comércio Selecionado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyTransferList;

// types.ts
export interface ICompanyProps {
  id: string;
  name: string;
  status?: string;
  [key: string]: any;
}

export interface CompanyResponseProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ICompanyProps[];
}

export interface TransferListItem {
  id: string;
  label: string;
}

// context/CompanyTransferProvider.tsx
"use client";

import { api } from "@/service/api";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";

interface CompanyTransferContextProps {
  // Company data
  companies: CompanyResponseProps;
  isLoading: boolean;
  
  // Transfer list data
  sourceItems: TransferListItem[];
  targetItems: TransferListItem[];
  
  // Methods
  fetchCompanies: (limit?: number, page?: number) => Promise<void>;
  moveToTarget: (itemIds: string[]) => void;
  moveToSource: (itemIds: string[]) => void;
  moveAllToTarget: () => void;
  moveAllToSource: () => void;
  isSelected: (id: string, listType: "source" | "target") => boolean;
  toggleSelection: (id: string, listType: "source" | "target") => void;
  selectedSourceItems: string[];
  selectedTargetItems: string[];
  selectAll: (listType: "source" | "target") => void;
  deselectAll: (listType: "source" | "target") => void;
  
  // Search
  sourceSearchQuery: string;
  targetSearchQuery: string;
  setSourceSearchQuery: (query: string) => void;
  setTargetSearchQuery: (query: string) => void;
  filteredSourceItems: TransferListItem[];
  filteredTargetItems: TransferListItem[];
}

const CompanyTransferContext = createContext<CompanyTransferContextProps | undefined>(undefined);

export const CompanyTransferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Company data state
  const [companies, setCompanies] = useState<CompanyResponseProps>({
    total: 0,
    page: 0,
    limit: 0,
    totalPages: 0,
    data: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Transfer list state
  const [sourceItems, setSourceItems] = useState<TransferListItem[]>([]);
  const [targetItems, setTargetItems] = useState<TransferListItem[]>([]);
  const [selectedSourceItems, setSelectedSourceItems] = useState<string[]>([]);
  const [selectedTargetItems, setSelectedTargetItems] = useState<string[]>([]);
  const [sourceSearchQuery, setSourceSearchQuery] = useState<string>("");
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>("");

  // Fetch companies from API
  const fetchCompanies = useCallback(async (limit: number = 1000, page: number = 1) => {
    setIsLoading(true);
    try {
      const config = { params: { limit, page } };
      const response = await api.get("/company", config);
      
      const dataWithStatus = response.data.response.data.map(
        (company: ICompanyProps) => ({
          ...company,
          status: company.status || "active",
        })
      );

      const formattedResponse = {
        ...response.data.response,
        data: dataWithStatus,
      };

      setCompanies(formattedResponse);
      
      // Initialize source items with all companies
      const companyItems: TransferListItem[] = dataWithStatus.map((company: ICompanyProps) => ({
        id: company.id,
        label: company.name,
      }));
      
      setSourceItems(companyItems);
      return formattedResponse;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error listing companies");
      return {
        total: 0,
        page: 0,
        limit: 0,
        totalPages: 0,
        data: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Filter items based on search queries
  const filteredSourceItems = useMemo(() => {
    return sourceItems.filter((item) => 
      item.label.toLowerCase().includes(sourceSearchQuery.toLowerCase())
    );
  }, [sourceItems, sourceSearchQuery]);

  const filteredTargetItems = useMemo(() => {
    return targetItems.filter((item) => 
      item.label.toLowerCase().includes(targetSearchQuery.toLowerCase())
    );
  }, [targetItems, targetSearchQuery]);

  // Selection methods
  const toggleSelection = useCallback((id: string, listType: "source" | "target") => {
    if (listType === "source") {
      setSelectedSourceItems(prev => 
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    } else {
      setSelectedTargetItems(prev => 
        prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
      );
    }
  }, []);

  const isSelected = useCallback((id: string, listType: "source" | "target") => {
    return listType === "source" 
      ? selectedSourceItems.includes(id) 
      : selectedTargetItems.includes(id);
  }, [selectedSourceItems, selectedTargetItems]);

  const selectAll = useCallback((listType: "source" | "target") => {
    if (listType === "source") {
      setSelectedSourceItems(filteredSourceItems.map(item => item.id));
    } else {
      setSelectedTargetItems(filteredTargetItems.map(item => item.id));
    }
  }, [filteredSourceItems, filteredTargetItems]);

  const deselectAll = useCallback((listType: "source" | "target") => {
    if (listType === "source") {
      setSelectedSourceItems([]);
    } else {
      setSelectedTargetItems([]);
    }
  }, []);

  // Transfer methods
  const moveToTarget = useCallback((itemIds: string[]) => {
    const itemsToMove = sourceItems.filter(item => itemIds.includes(item.id));
    setSourceItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    setTargetItems(prev => [...prev, ...itemsToMove]);
    setSelectedSourceItems([]);
  }, [sourceItems]);

  const moveToSource = useCallback((itemIds: string[]) => {
    const itemsToMove = targetItems.filter(item => itemIds.includes(item.id));
    setTargetItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    setSourceItems(prev => [...prev, ...itemsToMove]);
    setSelectedTargetItems([]);
  }, [targetItems]);

  const moveAllToTarget = useCallback(() => {
    setTargetItems(prev => [...prev, ...sourceItems]);
    setSourceItems([]);
    setSelectedSourceItems([]);
  }, [sourceItems]);

  const moveAllToSource = useCallback(() => {
    setSourceItems(prev => [...prev, ...targetItems]);
    setTargetItems([]);
    setSelectedTargetItems([]);
  }, [targetItems]);

  const value = {
    companies,
    isLoading,
    sourceItems,
    targetItems,
    fetchCompanies,
    moveToTarget,
    moveToSource,
    moveAllToTarget,
    moveAllToSource,
    isSelected,
    toggleSelection,
    selectedSourceItems,
    selectedTargetItems,
    selectAll,
    deselectAll,
    sourceSearchQuery,
    targetSearchQuery,
    setSourceSearchQuery,
    setTargetSearchQuery,
    filteredSourceItems,
    filteredTargetItems
  };

  return (
    <CompanyTransferContext.Provider value={value}>
      {children}
    </CompanyTransferContext.Provider>
  );
};

export const useCompanyTransfer = () => {
  const context = useContext(CompanyTransferContext);
  if (context === undefined) {
    throw new Error("useCompanyTransfer must be used within a CompanyTransferProvider");
  }
  return context;
};
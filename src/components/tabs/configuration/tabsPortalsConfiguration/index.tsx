"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { TabConfig } from "./tabsPortalsConfiguration";
import { useIsMobile } from "@/hooks/useIsMobile";

interface PortalTabsProps {
  tabs: TabConfig[];
}

export function PortalTabs({ tabs }: PortalTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const IsMobile = useIsMobile();

  const tabQuery = searchParams.get("tab") || tabs[0]?.value;
  const [activeTab, setActiveTab] = useState(
    tabs.find((tab) => tab.value === tabQuery) || tabs[0]
  );

  useEffect(() => {
    const newTab = tabs.find((tab) => tab.value === tabQuery);
    if (newTab) {
      setActiveTab(newTab);
    } else if (tabs.length > 0) {
      setActiveTab(tabs[0]);
      router.replace(`?tab=${tabs[0].value}`);
    }
  }, [tabQuery, tabs, router]);

  const handleTabChange = (value: string) => {
    const selectedTab = tabs.find((tab) => tab.value === value);
    if (selectedTab) {
      setActiveTab(selectedTab);
      router.replace(`?tab=${value}`);
    }
  };

  if (!activeTab || tabs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={activeTab.value}
      value={activeTab.value}
      className="w-full h-full"
      onValueChange={handleTabChange}
    >
      <Header
        title={activeTab.title}
        description={activeTab.description}
        text_button={`Adicionar ${activeTab.name}`}
        onClick={() => router.push(activeTab.path)}
        isMobile={IsMobile}
      />

      <TabsList className="flex bg-white justify-start ">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="flex-1 gap-4 py-2 px-6 h-screen"
        >
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}

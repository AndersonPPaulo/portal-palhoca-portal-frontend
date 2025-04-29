"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../header";

interface TabConfig {
  value: string;
  label: string;
  description: string;
  component: React.ReactNode;
  path: string;
  title: string;
  name: string;
}

interface DynamicTabsProps {
  tabs: TabConfig[];
}

export function DynamicTabs({ tabs }: DynamicTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab") || tabs[0].value;

  const [activeTab, setActiveTab] = useState(
    tabs.find((tab) => tab.value === tabQuery) || tabs[0]
  );

  useEffect(() => {
    const newTab = tabs.find((tab) => tab.value === tabQuery);
    if (newTab) setActiveTab(newTab);
  }, [tabQuery, tabs]);

  const handleTabChange = (value: string) => {
    const selectedTab = tabs.find((tab) => tab.value === value);
    if (selectedTab) {
      setActiveTab(selectedTab);
      router.replace(`?tab=${value}`);
    }
  };

  return (
    <Tabs
      defaultValue={activeTab.value}
      value={activeTab.value}
      className="w-full h-full "
      onValueChange={handleTabChange}
    >
      <Header
        title={activeTab.title}
        description={activeTab.description}
        text_button={`Adicionar ${activeTab.name}`}
        onClick={() => router.push(activeTab.path)}
      />

      <TabsList className="flex bg-white justify-start">
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
          className="flex-1 gap-4 py-2 px-6"
        >
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}

"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserContext } from "@/providers/user";
import { filterTabsByRole, TabConfig } from "./tabPostConfiguration";
import Header from "@/components/header";

interface PostTabsProps {
  tabs: TabConfig[];
}

export function PostTabs({ tabs }: PostTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useContext(UserContext);

  const filteredTabs = useMemo(() => {
    return filterTabsByRole(tabs, profile?.role?.name);
  }, [tabs, profile?.role?.name]);

  const userPermissions = useMemo(() => {
    return {
      isChiefEditor:
        profile?.role?.name?.toLowerCase() === "chefe de redação" ||
        profile?.chiefEditor !== null,
      isAdmin: profile?.role?.name?.toLowerCase() === "administrador",
      userId: profile?.id,
      userRole: profile?.role?.name,
      profile,
    };
  }, [profile]);

  const tabQuery = searchParams.get("tab") || filteredTabs[0]?.value;
  const [activeTab, setActiveTab] = useState(
    filteredTabs.find((tab) => tab.value === tabQuery) || filteredTabs[0]
  );

  useEffect(() => {
    const newTab = filteredTabs.find((tab) => tab.value === tabQuery);
    if (newTab) {
      setActiveTab(newTab);
    } else if (filteredTabs.length > 0) {
      setActiveTab(filteredTabs[0]);
      router.replace(`?tab=${filteredTabs[0].value}`);
    }
  }, [tabQuery, filteredTabs, router]);

  const handleTabChange = (value: string) => {
    const selectedTab = filteredTabs.find((tab) => tab.value === value);
    if (selectedTab) {
      setActiveTab(selectedTab);
      router.replace(`?tab=${value}`);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (filteredTabs.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Acesso Restrito
        </h3>
        <p className="text-gray-600">
          Sua role <strong>"{profile?.role?.name}"</strong> não tem acesso ao
          sistema de artigos.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Apenas <strong>Administrador</strong>,{" "}
          <strong>Chefe de Redação</strong>, <strong>Jornalista</strong> e{" "}
          <strong>Colunista</strong> têm acesso.
        </p>
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando permissões...</span>
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
      />

      <TabsList className="flex bg-white justify-start">
        {filteredTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            {tab.label}
            {userPermissions.isChiefEditor &&
              tab.value === "PENDING_REVIEW" && (
                <span className="ml-1 text-xs"></span>
              )}
          </TabsTrigger>
        ))}
      </TabsList>

      {filteredTabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="flex-1 gap-4 py-2 px-6"
        >
          {React.isValidElement(tab.component) && typeof tab.component.type !== "string"
            ? React.cloneElement(tab.component as React.ReactElement<any>, {
                ...(tab.component.props || {}),
                userId: userPermissions.userId,
                userRole: userPermissions.userRole,
                isChiefEditor: userPermissions.isChiefEditor,
                isAdmin: userPermissions.isAdmin,
              })
            : tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}

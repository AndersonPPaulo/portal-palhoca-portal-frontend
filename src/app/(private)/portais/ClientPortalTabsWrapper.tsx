// src/app/(private)/portais/ClientPortalTabsWrapper.tsx

"use client";

import { tabPortalsConfigurations } from "@/components/tabs/configuration/tabsPortalsConfiguration/tabsPortalsConfiguration";
import dynamic from "next/dynamic";

// Importa dinamicamente o componente PortalTabs com ssr: false
const PortalTabs = dynamic(
  () => import("@/components/tabs/configuration/tabsPortalsConfiguration/index").then(mod => mod.PortalTabs),
  { ssr: false }
);

export default function ClientPortalTabsWrapper() {
  return <PortalTabs tabs={tabPortalsConfigurations} />;
}
"use client";

import dynamic from "next/dynamic";
import { tabCompanyConfigurations } from "@/components/tabs/configuration/tabCompanyConfiguration";

const DynamicTabs = dynamic(() => import("@/components/tabs").then((mod) => mod.DynamicTabs), {
  ssr: false,
});

export default function ClientTabsWrapper() {
  return <DynamicTabs tabs={tabCompanyConfigurations} />;
}

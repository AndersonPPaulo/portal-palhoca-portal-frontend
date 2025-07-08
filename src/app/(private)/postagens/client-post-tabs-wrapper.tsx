// src/app/(private)/postagens/ClientPostTabsWrapper.tsx

"use client";

import { tabPostConfigurations } from "@/components/tabs/configuration/tabsPostConfiguration/tabPostConfiguration";
import dynamic from "next/dynamic";

// Importa dinamicamente o componente com ssr: false
const PostTabs = dynamic(
  () => import("@/components/tabs/configuration/tabsPostConfiguration").then(mod => mod.PostTabs),
  { ssr: false }
);

export default function ClientPostTabsWrapper() {
  return <PostTabs tabs={tabPostConfigurations} />;
}

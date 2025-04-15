import { DynamicTabs } from "@/components/tabs";
import { tabConfigurations } from "@/components/tabs/configuration";

export default function Postagens() {
  return (
    <div className="h-full bg-primary-light">
      <DynamicTabs tabs={tabConfigurations} />
    </div>
  );
}




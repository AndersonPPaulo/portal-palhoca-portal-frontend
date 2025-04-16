import { DynamicTabs } from "@/components/tabs";
import { tabPostConfigurations } from "@/components/tabs/configuration/tabPostConfiguration";

export default function Postagens() {
  return (
    <div className="h-full bg-primary-light">
      <DynamicTabs tabs={tabPostConfigurations} />
    </div>
  );
}




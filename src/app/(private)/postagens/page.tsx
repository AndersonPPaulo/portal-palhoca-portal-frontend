import { DynamicTabs } from "@/components/tabs";
import { tabPostConfigurations } from "@/components/tabs/configuration/tabPostConfiguration";

export default function Postagens() {
  return (
    <div className="bg-primary-light h-screen overflow-hidden">
      <DynamicTabs tabs={tabPostConfigurations} />
    </div>
  );
}




import { DynamicTabs } from "@/components/tabs";
import { tabCompanyConfigurations } from "@/components/tabs/configuration/tabCompanyConfiguration";

export default function Companytagens() {
  return (
    <div className="bg-primary-light overflow-x-hidden min-h-screen h-full">
      <DynamicTabs tabs={tabCompanyConfigurations} />
    </div>
  );
}
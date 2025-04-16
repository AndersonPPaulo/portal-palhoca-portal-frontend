import { DynamicTabs } from "@/components/tabs";
import { tabCompanyConfigurations } from "@/components/tabs/configuration/tabCompanyConfiguration";

export default function Companytagens() {
  return (
    <div className="h-full bg-primary-light">
      <DynamicTabs tabs={tabCompanyConfigurations} />
    </div>
  );
}
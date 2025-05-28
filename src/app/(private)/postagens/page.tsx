import { PostTabs } from "@/components/tabs/configuration/tabsPostConfiguration";
import { tabPostConfigurations } from "@/components/tabs/configuration/tabsPostConfiguration/tabPostConfiguration";

export default function Postagens() {
  return (
    <div className="bg-primary-light h-full">
      <PostTabs tabs={tabPostConfigurations} />
    </div>
  );
}




import Header from "@/components/header";
import AuthorSettingsTabs from "@/components/painel/cards/my-account/author-settings-tabs";
export default function MinhaConta() {
  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Minha conta"
        buttonHidden
        description="Dados da minha conta"
      />
      <div className="flex-1 p-6">
        <AuthorSettingsTabs />
      </div>
    </div>
  );
}

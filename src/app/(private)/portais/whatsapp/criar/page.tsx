import Header from "@/components/header";
import FormCreateWhatsappGroup from "@/components/painel/cards/whatsapp-group/forms/create-whatsapp-group";

export default function CriarAutor() {
  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Criar Portal"
        buttonHidden
        description="Criar novos portais de notícias, eventos e informações."
      />
      <div className="flex-1 p-6">
        <FormCreateWhatsappGroup/>
      </div>
    </div>
  );
}

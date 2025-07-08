import Header from "@/components/header";
import FormCreatePortals from "@/components/painel/cards/portals/forms/create-portals";

export default function CriarAutor() {
  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Criar Usuário"
        buttonHidden
        description="Criar usuários para poderem publicar artigos/postagens para o site"
      />
      <div className="flex-1 p-6">
        <FormCreatePortals/>
      </div>
    </div>
  );
}

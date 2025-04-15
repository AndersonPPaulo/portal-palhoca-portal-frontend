import Header from "@/components/header";
import FormCreateArticle from "@/components/painel/cards/postagens/articles/forms/create-articles";

export default function CreateArticle() {
  return (
    <div className="bg-primary-light flex flex-col h-screen overflow-hidden ">
      <Header title="Cadastrar artigo" buttonHidden />
      <div className="flex-1 p-6 overflow-hidden">
        <FormCreateArticle />
      </div>
    </div>
  );
}

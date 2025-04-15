import Header from "@/components/header";
import FormCreateTag from "@/components/painel/cards/postagens/tags/forms/create-tag";

export default function CreateTags() {
  return (
    <div className="h-full bg-primary-light">
      <Header title="Cadastro de Tags Semelhantes" buttonHidden={true} />
      <div className="p-6">
        <FormCreateTag />
      </div>
    </div>
  );
}

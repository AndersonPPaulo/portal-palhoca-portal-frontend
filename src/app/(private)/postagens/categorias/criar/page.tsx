import Header from "@/components/header";
import FormCreateCategory from "@/components/painel/cards/postagens/categorys/forms/create-category";

export default function CreateCategorys() {
  return (
    <div className="h-full bg-primary-light">
      <Header title="Cadastro de categoria" buttonHidden={true} />
      <div className="p-6">
        <FormCreateCategory />
      </div>
    </div>
  );
}

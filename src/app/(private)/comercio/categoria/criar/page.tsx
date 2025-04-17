import Header from "@/components/header";
import FormCreateCompanyCategory from "@/components/painel/cards/company-category/forms/create-company-category";

export default function CreateCompanyCategory() {
  return (
    <div className="bg-primary-light flex flex-col h-screen overflow-hidden ">
      <Header title="Cadastrar categoria de comércio" buttonHidden />
      <div className="flex-1 p-6 overflow-hidden">
        <FormCreateCompanyCategory />
      </div>
    </div>
  );
}
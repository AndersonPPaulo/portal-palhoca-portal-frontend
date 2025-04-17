import Header from "@/components/header";
import FormCreateCompany from "@/components/painel/cards/company/forms/create-company";

export default function CreateCompany() {
  return (
    <div className="bg-primary-light h-screen overflow-scroll">
      <Header title="Cadastrar comércio" buttonHidden />
      <div className="flex-1 p-6 overflow-hidden">
        <FormCreateCompany />
      </div>
    </div>
  );
}
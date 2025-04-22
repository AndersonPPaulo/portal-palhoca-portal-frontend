import Header from "@/components/header";
import FormCreateCompanyCategory from "@/components/painel/cards/company-category/forms/create-company-category";
import TransferList from "@/components/transferList";

export default function CreateCompanyCategory() {
  return (
    <div className=" bg-primary-light h-screen overflow-x-hidden">
      <Header title="Cadastrar categoria de comércio" buttonHidden />
      <div className="flex-1 p-6  ">
        <FormCreateCompanyCategory />
      </div>
    </div>
  );
}
import Header from "@/components/header";
import InfoPainel from "@/components/painel";

export default function Painel() {
  return (
    <div className="bg-primary-light overflow-x-hidden min-h-screen h-full">
      <Header
        title="Painel de controle"
        buttonHidden
        description="Indicadores de uso e resultados"
      />
      <div className="flex-1 p-1  py-3">
        <InfoPainel />
      </div>
    </div>
  );
}

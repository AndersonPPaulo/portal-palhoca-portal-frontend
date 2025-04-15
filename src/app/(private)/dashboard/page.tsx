import Header from "@/components/header";
import InfoPainel from "@/components/painel";

export default function Painel() {
  return (
    <div className="h-screen bg-primary-light flex flex-col overflow-hidden">
      <Header
        title="Painel de controle"
        buttonHidden
        description="Indicadores de uso e resultados"
      />
      <div className="flex-1 p-6">
        <InfoPainel />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Login - Si3 Sistemas",
  description:
    "O Painel de Gestão de Artigos do Si3 Sistemas oferece uma interface intuitiva e poderosa para gerenciar, editar e monitorar os artigos postados no blog do seu site. Com recursos avançados de categorização, tags e melhor ranqueamento no google, você pode otimizar o conteúdo, acompanhar visualizações e garantir uma experiência de leitura de qualidade para seus usuários. Ideal para gerenciar múltiplos artigos de forma eficiente, com foco em performance e usabilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-montserrat">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

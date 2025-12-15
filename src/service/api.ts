import axios from "axios";

/**
 * Configuração da API principal
 *
 * Em ambiente de desenvolvimento (NEXT_PUBLIC_USE_MOCK=true), usa a API mock local
 * Em produção ou desenvolvimento com API real (NEXT_PUBLIC_USE_MOCK=false), usa a API real
 *
 * IMPORTANTE: Usar NEXT_PUBLIC_ para variáveis funcionarem no browser!
 *
 * NOTA: No browser, sempre usa localhost:5555. No servidor Next.js dentro do Docker,
 * pode usar mock-api:5555 (hostname interno do Docker).
 */
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Determinar a URL base da API
let apiBaseURL: string;

if (useMockApi) {
  // Se estiver no browser (client-side), sempre usar localhost
  if (typeof window !== "undefined") {
    apiBaseURL = "http://localhost:5555";
  } else {
    // Se estiver no servidor (server-side), pode usar a URL da variável de ambiente
    // ou localhost como fallback
    apiBaseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";
  }
} else {
  apiBaseURL = "https://api.portalpalhoca.com.br/";
}

export const api = axios.create({
  baseURL: apiBaseURL,
});

// Log para facilitar debug (sempre mostrar para ajudar desenvolvimento)
console.log("🔧 API Configuration:", {
  useMockApi,
  baseURL: apiBaseURL,
  isClient: typeof window !== "undefined",
  env: process.env.NODE_ENV,
});

export const api_cep = axios.create({
  baseURL: "https://viacep.com.br/ws/",
});

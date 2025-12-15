import axios from "axios";

/**
 * Configuração da API principal
 *
 * Em ambiente de desenvolvimento (NEXT_PUBLIC_USE_MOCK=true), usa a API mock local
 * Em produção ou desenvolvimento com API real (NEXT_PUBLIC_USE_MOCK=false), usa a API real
 *
 * IMPORTANTE: Usar NEXT_PUBLIC_ para variáveis funcionarem no browser!
 */
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const apiBaseURL = useMockApi
  ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555"
  : "https://api.portalpalhoca.com.br/";

export const api = axios.create({
  baseURL: apiBaseURL,
});

// Log para facilitar debug (sempre mostrar para ajudar desenvolvimento)
console.log("🔧 API Configuration:", {
  useMockApi,
  baseURL: apiBaseURL,
  env: process.env.NODE_ENV,
});

export const api_cep = axios.create({
  baseURL: "https://viacep.com.br/ws/",
});

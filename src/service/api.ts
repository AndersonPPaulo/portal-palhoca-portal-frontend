/* eslint-disable @typescript-eslint/no-explicit-any */
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
    apiBaseURL = "http://localhost:3000";
  } else {
    // Se estiver no servidor (server-side), pode usar a URL da variável de ambiente
    // ou localhost como fallback
    apiBaseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }
} else {
  // Usar a URL do .env ou fallback para produção
  apiBaseURL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.portalpalhoca.com.br";
}

// Remover barra final se existir (para evitar URLs como /api//endpoint)
apiBaseURL = apiBaseURL.replace(/\/$/, "");

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 120000, // 2 minutos de timeout
});

// Log para facilitar debug (sempre mostrar para ajudar desenvolvimento)
console.log("🔧 API Configuration:", {
  useMockApi,
  baseURL: apiBaseURL,
  isClient: typeof window !== "undefined",
  env: process.env.NODE_ENV,
});

// Interceptor de resposta para tratamento global de erros
api.interceptors.response.use(
  (response) => {
    // Log de sucesso em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API Success:", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log de erro detalhado
    console.error("❌ API Error:", {
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });

    // Tratamento especial para Network Error
    if (error.message === "Network Error" && !error.response) {
      console.error("🌐 Network Error - Possíveis causas:", {
        "1": "Servidor não está rodando ou não está acessível",
        "2": "URL da API está incorreta",
        "3": "Problema de CORS (servidor precisa permitir origem)",
        "4": "Firewall ou proxy bloqueando a requisição",
        "5": "Sem conexão com a internet",
        apiURL: apiBaseURL,
        endpoint: error.config?.url,
      });

      // Criar uma resposta de erro amigável
      error.response = {
        data: {
          message: `Não foi possível conectar ao servidor (${apiBaseURL}). Verifique se o servidor está rodando e acessível.`,
        },
        status: 0,
        statusText: "Network Error",
      } as any;
    }

    // Adicionar mensagem de erro amigável se não existir
    if (error.response && !error.response.data) {
      error.response.data = {
        message: `Erro ${error.response.status}: ${error.response.statusText}`,
      };
    }

    return Promise.reject(error);
  },
);

export const api_cep = axios.create({
  baseURL: "https://viacep.com.br/ws/",
});

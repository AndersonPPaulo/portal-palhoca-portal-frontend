/**
 * Utilitário para extrair mensagem de erro de diferentes estruturas de resposta da API
 *
 * Este helper foi criado para lidar com diferenças entre ambiente de desenvolvimento (mock)
 * e ambiente de produção, onde as estruturas de resposta podem variar.
 */

export const getApiErrorMessage = (error: any): string => {
  // Verificar se há uma resposta do servidor
  if (error?.response?.data) {
    // Tentar diferentes campos comuns para mensagens de erro
    return (
      error.response.data.message ||
      error.response.data.error ||
      error.response.data.msg ||
      error.response.data.detail ||
      "Erro ao processar requisição"
    );
  }

  // Verificar se há mensagem de erro direta
  if (error?.message) {
    return error.message;
  }

  // Mensagem padrão
  return "Erro desconhecido ao processar requisição";
};

/**
 * Verifica se a resposta da API tem os dados esperados
 */
export const hasValidResponse = (response: any): boolean => {
  return response && response.data !== undefined;
};

/**
 * Extrai dados da resposta considerando diferentes estruturas
 */
export const getResponseData = (response: any, fallback: any = null): any => {
  if (!hasValidResponse(response)) {
    return fallback;
  }

  // Tentar diferentes estruturas comuns
  return (
    response.data.response ||
    response.data.data ||
    response.data.result ||
    response.data ||
    fallback
  );
};

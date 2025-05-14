// Função auxiliar para formatar a data
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

export default formatDateForInput;
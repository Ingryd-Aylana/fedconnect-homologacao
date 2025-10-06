import api from "./api"; // Garanta que o caminho para sua instância do Axios esteja correto

const cotacaoService = {
  cotacaoIncendio: async (paylod) => {
    try {
      const response = await api.post("cotacao/incendio-conteudo/", paylod);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      throw error;
    }
  },
};

export default cotacaoService;

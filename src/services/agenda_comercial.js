import api from "./api";

const API_URL = "comercial/agenda/";

export const AgendaComercialService = {
  /**
   * Busca as visitas de um mês específico.
   * @param {number} ano O ano desejado.
   * @param {number} mes O mês desejado (1 a 12).
   * @returns {Promise<Array>} Uma promessa que retorna a lista de visitas filtrada.
   */
  getVisitas: async (ano, mes) => {
    try {
      // Adiciona os parâmetros 'ano' e 'mes' à requisição GET
      const response = await api.get(API_URL, {
        params: { ano, mes },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar visitas:", error);
      throw error;
    }
  },

  /**
   * @returns {Promise<Object>}
   */
  criarVisita: async (payload) => {
    try {
      const response = await api.post(API_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar visita:", error);
      throw error;
    }
  },

  /**
   * Atualiza o status de um agendamento comercial.
   * @param {number} visitaId O ID da visita.
   * @param {string} novoStatus O novo status.
   * @param {Object} extraPayload Dados adicionais.
   * @returns {Promise<Object>} Promessa que retorna a visita atualizada.
   */
  updateVisitaStatus: async (visitaId, novoStatus, extraPayload = {}) => {
    try {
      const payload = { status: novoStatus, ...extraPayload };
      const response = await api.patch(`${API_URL}${visitaId}/`, payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar status da visita:", error);
      throw error;
    }
  },

  /**
   * Atualiza os detalhes de uma visita.
   * @param {number} visitaId O ID da visita.
   * @param {Object} dados Os dados completos a serem atualizados.
   * @returns {Promise<Object>} Promessa que retorna a visita atualizada.
   */
  confirmarVisita: async (visitaId, dados) => {
    try {
      const response = await api.patch(`${API_URL}${visitaId}/`, dados);
      return response.data;
    } catch (error) {
      console.error("Erro ao confirmar visita:", error);
      throw error;
    }
  },

  deleteVisita: async (visitaId) => {
    try {
      await api.delete(`${API_URL}${visitaId}/`);
    } catch (error) {
      console.error("Erro ao excluir visita:", error);
      throw error;
    }
  },
};

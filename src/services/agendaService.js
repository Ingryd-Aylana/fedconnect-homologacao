// src/services/agendaService.js
import api from "./api"; // Verifique se o caminho para a sua instância do Axios está correto

const API_URL = "agenda/";

export const AgendaService = {
  /**
   * Busca todas as reservas de agenda do backend.
   * @returns {Promise<Array>} Uma promessa que retorna uma lista de reservas.
   */
  getReservas: async (dataInicio, dataFim) => {
    try {
      const params = {};
        params.data_inicio = dataInicio;
        params.data_fim = dataFim;
      const response = await api.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      throw error;
    }
  },

  /**
   * Cria uma nova reserva de agenda.
   * @param {Object} reservaData Os dados da nova reserva (tema, participantes, data, etc.).
   * @returns {Promise<Object>} Uma promessa que retorna a reserva criada.
   */
  createReserva: async (reservaData) => {
    try {
      const response = await api.post(API_URL, reservaData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      throw error;
    }
  },

  /**
   * Deleta uma reserva de agenda pelo seu ID.
   * @param {number} reservaId O ID da reserva a ser deletada.
   * @returns {Promise<void>} Uma promessa que resolve quando a reserva é excluída.
   */
  deleteReserva: async (reservaId) => {
    try {
      await api.delete(`${API_URL}${reservaId}/`);
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
      throw error;
    }
  },
};

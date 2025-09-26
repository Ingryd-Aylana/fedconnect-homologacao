
import api from "./api";

const API_URL = "comercial/agenda/"; // Novo endpoint no backend (você precisará criar)

export const AgendaComercialService = {
  /**
   * Busca todas as visitas para o dashboard comercial.
   * @returns {Promise<Array>} Uma promessa que retorna uma lista de visitas.
   */
  getVisitas: async () => {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar visitas:", error);
      throw error;
    }
  },

/**
  *@returns {Promise<Object>} 
  */
  criarVisita: async(payload) =>{
    try {
      const response = await api.post(API_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar visita:", error);
      throw error;
    }
  }
,
  /**
  /**
   * Atualiza o status de um agendamento comercial.
   * @param {number} visitaId O ID da visita.
   * @param {string} novoStatus O novo status ('agendada', 'realizada', 'cancelada').
   * @returns {Promise<Object>} Promessa que retorna a visita atualizada.
   */
  updateVisitaStatus: async (visitaId, novoStatus) => {
    try {
      const response = await api.patch(`${API_URL}${visitaId}/`, { status: novoStatus });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar status da visita:", error);
      throw error;
    }
  },

  /**
   * Confirma uma visita e atualiza seus detalhes.
   * @param {number} visitaId O ID da visita.
   * @param {Object} dados Os dados a serem atualizados (comentário, resultado).
   * @returns {Promise<Object>} Promessa que retorna a visita atualizada.
   */
  confirmarVisita: async (visitaId, dados) => {
    try {
      const response = await api.patch(`${API_URL}${visitaId}/`, { ...dados, status: "realizada" });
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
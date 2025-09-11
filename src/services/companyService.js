import api from './api'; // Garanta que o caminho para sua instância do Axios esteja correto

export const CompanyService = {
    /**
     * Busca todas as empresas cadastradas na API.
     * @returns {Promise<Array>} Uma promessa que resolve para uma lista de objetos de empresa.
     */
    getAllCompanies: async () => {
        try {
            const response = await api.get('empresas/'); // Endpoint da sua API Django para empresas
            // O Django REST Framework geralmente retorna dados paginados com 'results'
            // ou um array direto, dependendo da sua configuração.
            return response.data; // Retorna a resposta completa (que pode conter 'results', 'count', etc.)
        } catch (error) {
            console.error("Erro ao buscar todas as empresas:", error);
            // Rejeita a promessa para que o componente que chamou possa tratar o erro.
            throw error;
        }
    },

    /**
     * Busca uma empresa específica pelo seu ID.
     * @param {number} id O ID da empresa.
     * @returns {Promise<Object>} Uma promessa que resolve para o objeto da empresa.
     */
    getCompanyById: async (id) => {
        try {
            const response = await api.get(`empresas/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar empresa com ID ${id}:`, error);
            throw error;
        }
    },

    // --- Métodos Adicionais (opcionais, se sua API Django permitir) ---

    /**
     * Cria uma nova empresa.
     * @param {Object} companyData Os dados da nova empresa (ex: { nome: 'Nova Empresa' }).
     * @returns {Promise<Object>} Uma promessa que resolve para o objeto da empresa criada.
     */
    createCompany: async (companyData) => {
        try {
            const response = await api.post('empresas/', companyData);
            return response.data;
        } catch (error) {
            console.error("Erro ao criar empresa:", error);
            throw error;
        }
    },

    /**
     * Atualiza uma empresa existente.
     * @param {number} id O ID da empresa a ser atualizada.
     * @param {Object} companyData Os dados atualizados da empresa.
     * @returns {Promise<Object>} Uma promessa que resolve para o objeto da empresa atualizada.
     */
    updateCompany: async (id, companyData) => {
        try {
            const response = await api.put(`empresas/${id}/`, companyData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar empresa com ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deleta uma empresa.
     * @param {number} id O ID da empresa a ser deletada.
     * @returns {Promise<void>} Uma promessa que resolve quando a empresa é deletada.
     */
    deleteCompany: async (id) => {
        try {
            await api.delete(`empresas/${id}/`);
        } catch (error) {
            throw error;
        }
    },
};
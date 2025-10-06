// services/consultaService.js
import api from "./api"; // Certifique-se de que este 'api' é a instância do Axios

export const ConsultaService = {
  getConsultaHistory: async (page = 1, page_size = 10) => {
    const response = await api.get(
      `/consultas/historico/?page=${page}&page_size=${page_size}`
    );
    return response.data;
  },

  getHistoryByID: async (payload) => {
    const response = await api.get(`/consultas/historico/${payload}`);
    return response.data;
  },

  getUserHistory: async (userId, page = 1, page_size = 10) => {
    // Supondo que o endpoint aceite paginação também
    const response = await api.get(
      `/consultas/historico/usuario/?page=${page}&page_size=${page_size}`
    );
    return response.data;
  },

  realizarConsulta: async (payload) => {
    const response = await api.post("/consultas/realizar/", payload);
    return response.data;
  },

  consultarCpf: async (cpf) => {
    const payload = {
      tipo_consulta: "cpf",
      parametro_consulta: cpf,
    };
    const response = await api.post("/consultas/realizar/", payload);
    return response.data;
  },
  consultarCep: async (cep) => {
    const payload = {
      tipo_consulta: "endereco", // Novo tipo de consulta
      parametro_consulta: cep,
    };
    const response = await api.post("/consultas/realizar/", payload);
    return response.data;
  },

  consultarComercial: async (cnpj) => {
    const payload = {
      tipo_consulta: "cnpj_comercial",
      parametro_consulta: cnpj,
    };
    const response = await api.post("consultas/comercial/", payload);
    return response.data;
  },

  consultarContatoComercial: async (cpf) => {
    const payload = {
      tipo_consulta: "comercial",
      parametro_consulta: cpf,
    };
    const response = await api.post("consultas/cont-comercial/", payload);
    return response.data;
  },

  consultarComercialMassa: async (payload) => {
    const response = await api.post("/consulta-massa-comercial/", payload, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Envia uma lista de CNPJs para processamento em massa e recebe um arquivo.
   * @param {object} payload - Objeto contendo { cnpjs: Array<object>, origem: string }.
   * @returns {Promise<Blob>} - Promessa com o Blob do arquivo XLSX de resultado.
   */
  processarPlanilhaCNPJ: async (payload) => {
    const response = await api.post("/processar-cnpj-planilha/", payload, {
      responseType: "blob", // Indica ao Axios para tratar a resposta como um Blob
    });
    return response.data;
  },

  /**
   * Baixa a planilha modelo de CNPJ.
   * @returns {Promise<Blob>} - Promessa com o Blob do arquivo XLSX modelo.
   */
  baixarPlanilhaModeloCNPJ: async () => {
    const response = await api.get("/planilha-modelo-cnpj/", {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Envia uma lista de CPFs para processamento em massa e recebe um arquivo.
   * @param {object} payload - Objeto contendo { cpfs: Array<object>, origem: string }.
   * @returns {Promise<Blob>} - Promessa com o Blob do arquivo XLSX de resultado.
   */
  processarPlanilhaCPF: async (payload) => {
    const response = await api.post("/processar-cpf-planilha/", payload, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Baixa a planilha modelo de CPF.
   * @returns {Promise<Blob>} - Promessa com o Blob do arquivo XLSX modelo.
   */
  baixarPlanilhaModeloCPF: async () => {
    const response = await api.get("/planilha-modelo-cpf/", {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * NOVO: Envia uma lista de CEPs para processamento em massa e recebe um arquivo.
   * @param {object} payload - Objeto contendo { ceps: Array<object>, origem: string }.
   * @returns {Promise<Blob>} - Promessa com o Blob do arquivo XLSX de resultado.
   */
  processarPlanilhaCEP: async (payload) => {
    // Endpoint para processar CEPs em massa. Ajuste conforme seu backend Django.
    const response = await api.post("/processar-cep-planilha/", payload, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * NOVO: Baixa a planilha modelo de CEP.
   * @returns {Promise<Blob>} - Promessa com o Blob do arquivo XLSX modelo.
   */
  baixarPlanilhaModeloCEP: async () => {
    // Endpoint para baixar o modelo de planilha de CEP. Ajuste conforme seu backend Django.
    const response = await api.get("/planilha-modelo-cep/", {
      responseType: "blob",
    });
    return response.data;
  },
  consultarSegurados: async (payload) => {
    const response = await api.post("consultas/segurados/", payload)
    return response.data;
  },

  getAdms: async (payload) => {
    const response = await api.get(`/administradoras/?administradora=${payload}&page_size=5`);
    return response.data;
  },
  getfatura: async (payload) => {
    const response = await api.post(`/consultas/faturas/`, payload)
    return response.data;
  },
};

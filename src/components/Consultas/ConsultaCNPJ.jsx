import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";
import { FileSpreadsheet } from "lucide-react";

function isValidCNPJ(raw) {
  const cnpj = String(raw).replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  const calcDV = (base) => {
    let soma = 0;
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < pesos.length; i++) {
      soma += Number(base[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = calcDV(cnpj.slice(0, 12));
  const dv2 = calcDV(cnpj.slice(0, 12) + dv1);
  return cnpj.endsWith(`${dv1}${dv2}`);
}

function getFriendlyError(err, context = {}) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const serverMsg =
    data?.detail || data?.message || data?.mensagem || data?.error || data?.erro;

  if (!err?.response) {
    if (err?.code === "ECONNABORTED")
      return "Tempo de resposta excedido. Tente novamente em instantes.";
    return "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.";
  }

  if (status === 404) {
    if (context?.tipo_consulta === "cnpj")
      return "CNPJ não encontrado. Confira os dígitos e tente novamente.";
    return serverMsg || "Nenhum resultado encontrado para os filtros informados.";
  }
  if (status === 400 || status === 422) {
    if (context?.tipo_consulta === "cnpj") {
      return "CNPJ inválido ou em formato incorreto. Use apenas números (14 dígitos).";
    }
    return "Parâmetros inválidos na consulta. Ajuste os filtros e tente novamente.";
  }
  if (status === 429) return "Muitas consultas em sequência. Aguarde e tente novamente.";
  if (status === 401 || status === 403) return "Acesso não autorizado. Verifique suas credenciais.";
  if (status >= 500) return "Serviço do provedor indisponível no momento. Tente novamente em instantes.";

  return serverMsg || `Erro inesperado (${status}). Tente novamente.`;
}

const ConsultaCNPJ = () => {
  const [cnpj, setCnpj] = useState("");
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [hasQueried, setHasQueried] = useState(false);

  const [formData, setFormData] = useState({
    razaoSocial: "",
    uf: "",
    email: "",
    telefone: "",
  });

  const resultadoRef = useRef(null);

  const [massConsultaMessage, setMassConsultaMessage] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);

  // Funções auxiliares
  const flatToBasicData = (flat) => {
    if (!flat) return null;

    const Contact = {
      Phone1: flat.ddd_telefone_1 ?? null,
      Phone2: flat.ddd_telefone_2 ?? null,
      Email: flat.email ?? null,
    };

    const Address = {
      Neighborhood: flat.bairro ?? null,
      ZipCode: flat.cep ?? null,
      StreetType: flat.descricao_tipo_de_logradouro ?? null,
      Street: flat.logradouro ?? null,
      Complement: flat.complemento ?? null,
      Number: flat.numero ?? null,
      City: flat.municipio ?? null,
      State: flat.uf ?? null,
    };

    return {
      OfficialName: flat.razao_social ?? null,
      TradeName: flat.nome_fantasia ?? null,
      TaxIdNumber: flat.cnpj ?? null,
      HeadquarterState: flat.uf ?? null,
      Activities: flat.cnae_fiscal_descricao
        ? [{ Activity: flat.cnae_fiscal_descricao }]
        : [],
      LegalNature: flat.natureza_juridica ? { Activity: flat.natureza_juridica } : null,
      TaxIdStatus: flat.descricao_situacao_cadastral ?? null,
      FoundedDate: flat.data_inicio_atividade ?? null,
      Contact,
      Address,
    };
  };

  const getRoot = (res) => (res?.resultado_api ?? res);

  const getResultList = (res) => {
    if (!res) return [];
    const root = getRoot(res);

    if (Array.isArray(root?.Result)) return root.Result;
    if (Array.isArray(root?.results)) return root.results;
    if (Array.isArray(root?.items)) return root.items;
    if (Array.isArray(root?.data)) return root.data;

    if (root && (root.cnpj || root.razao_social)) {
      const basic = flatToBasicData(root);
      return basic ? [{ BasicData: basic }] : [];
    }

    return [];
  };

  const getCnpjData = (res) => {
    if (!res) return null;
    const tipo = res?.historico_salvo?.tipo_consulta;

    if (tipo === "cnpj") {
      return res?.resultado_api ?? res;
    }

    if (tipo === "cnpj_razao_social") {
      const list = getResultList(res);
      const item0 = list?.[0];
      if (item0?.BasicData) return item0.BasicData;

      const root = getRoot(res);
      if (root && (root.cnpj || root.razao_social)) {
        return flatToBasicData(root);
      }
      return null;
    }

    const list = getResultList(res);
    return list?.[0]?.BasicData ?? null;
  };

  // ESSA PARTE É FUNDAMENTAL!
  const cnpjData = getCnpjData(resultado);
  const resultList = getResultList(resultado);

  // EFEITO DO SCROLL AUTOMÁTICO
  useEffect(() => {
    if (
      (activeForm === "cnpj" && cnpjData) ||
      (activeForm === "chaves" && Array.isArray(resultList) && resultList.length > 0)
    ) {
      setTimeout(() => {
        resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 180);
    }
  }, [activeForm, cnpjData, resultList]);

  // Restante das funções
  const handleCnpjChange = (e) => {
    const rawCnpj = e.target.value.replace(/\D/g, "").slice(0, 14);
    setCnpj(rawCnpj);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);
    setMassConsultaMessage("");

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = "";

    if (activeForm === "cnpj") {
      if (cnpj.length !== 14) {
        validationErrorMessage = "Por favor, insira um CNPJ válido com 14 dígitos.";
        isFormValid = false;
      } else if (!isValidCNPJ(cnpj)) {
        validationErrorMessage = "CNPJ inválido: os dígitos verificadores não conferem.";
        isFormValid = false;
      } else {
        payload = { tipo_consulta: "cnpj", parametro_consulta: cnpj };
      }
    } else if (activeForm === "chaves") {
      if (
        !formData.razaoSocial.trim() &&
        !formData.uf.trim() &&
        !formData.email.trim() &&
        !formData.telefone.trim()
      ) {
        validationErrorMessage =
          "Por favor, preencha pelo menos um campo para busca por chaves alternativas.";
        isFormValid = false;
      } else {
        const qParams = [];
        if (formData.razaoSocial.trim()) qParams.push(`name{${formData.razaoSocial.trim()}}`);
        // Adicione outros parâmetros aqui se quiser expandir a busca

        if (qParams.length === 0) {
          validationErrorMessage = "Nenhum parâmetro de busca válido para chaves alternativas.";
          isFormValid = false;
        } else {
          const bigDataCorpPayload = {
            Datasets: "basic_data",
            q: qParams.join(", "),
            Limit: 5,
          };
          payload = {
            tipo_consulta: "cnpj_razao_social",
            parametro_consulta: JSON.stringify(bigDataCorpPayload),
          };
        }
      }
    }

    if (!isFormValid) {
      setError(validationErrorMessage);
      setLoading(false);
      return;
    }

    try {
      const response = await ConsultaService.realizarConsulta(payload);
      setResultado(response?.data ?? response);
    } catch (err) {
      const friendly = getFriendlyError(err, payload);
      setError(friendly);
    } finally {
      setLoading(false);
      setHasQueried(true);
    }
  };

  const handleMassFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMassConsultaMessage("Por favor, selecione um arquivo para upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);
    setMassConsultaMessage("Lendo planilha e preparando para consulta...");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const cnpjsParaConsulta = jsonData.map((row) => ({ CNPJ: String(row.CNPJ) }));
        const requestBody = { cnpjs: cnpjsParaConsulta, origem: "planilha" };

        setMassConsultaMessage("Enviando CNPJs para processamento em massa...");

        const response = await ConsultaService.processarPlanilhaCNPJ(requestBody);
        const blob = response;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "planilha-resultado.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setMassConsultaMessage("Processamento concluído! O download da planilha de resultados iniciou.");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Erro inesperado: Verifique sua conexão e o formato do arquivo.";
        setMassConsultaMessage(`Erro ao processar a planilha: ${errorMessage}`);
      } finally {
        setLoading(false);
        if (event.target) event.target.value = null;
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadModel = async () => {
    setLoading(true);
    setMassConsultaMessage("Baixando planilha modelo...");
    try {
      const response = await ConsultaService.baixarPlanilhaModeloCNPJ();

      const blob = response;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "modelo-cnpj.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setMassConsultaMessage("Download do modelo concluído.");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Erro na comunicação com o servidor para baixar o modelo.";
      setMassConsultaMessage(`Erro ao baixar modelo: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandResult = (idx) => {
    setSelectedResultIndex(selectedResultIndex === idx ? null : idx);
  };

  const resetStateOnTab = (tab) => {
    setActiveForm(tab);
    setError(null);
    setResultado(null);
    setMassConsultaMessage("");
    setSelectedResultIndex(null);
    setHasQueried(false);
  };

  return (
    <div className="consulta-container03">
      <h1 className="consultas-title">
        <i className="bi-clipboard-data"></i> Consultas Disponíveis
      </h1>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === "cnpj" ? "active" : ""}`}
          onClick={() => resetStateOnTab("cnpj")}
        >
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="white"
              className="bi bi-building"
              viewBox="0 0 16 16"
            >
              <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
              <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
            </svg>
          </div>
          <h5>Consulta por CNPJ</h5>
        </div>

        <div
          className={`card card-option ${activeForm === "chaves" ? "active" : ""}`}
          onClick={() => resetStateOnTab("chaves")}
        >
          <div className="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
              <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zM10 8a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1" />
            </svg>
          </div>
          <h5>Chaves Alternativas</h5>
        </div>

        <div
          className={`card card-option ${activeForm === "massa" ? "active" : ""}`}
          onClick={() => resetStateOnTab("massa")}
        >
          <div className="icon-container">
            <FileSpreadsheet size={35} />
          </div>
          <h5>Consulta em Massa</h5>
        </div>
      </div>

      {activeForm === "cnpj" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cnpj">Digite o documento</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={cnpj}
            onChange={handleCnpjChange}
            placeholder="Digite o CNPJ"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className={`consulta-btn ${loading ? "loading" : ""}`}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === "chaves" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="razaoSocial">Razão Social:</label>
          <input
            type="text"
            id="razaoSocial"
            name="razaoSocial"
            value={formData.razaoSocial}
            onChange={handleFormChange}
            placeholder="Digite a razão social"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={
              loading ||
              (!formData.razaoSocial.trim() &&
                !formData.uf.trim() &&
                !formData.email.trim() &&
                !formData.telefone.trim())
            }
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === "massa" && (
        <div className="form-massa-container">
          <input
            type="file"
            id="input-massa"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMassFileUpload}
            disabled={loading}
          />
          <button type="button" onClick={() => document.getElementById("input-massa").click()} disabled={loading}>
            Importar Planilha de CNPJs
          </button>
          <button type="button" onClick={handleDownloadModel} disabled={loading}>
            Baixar Planilha Modelo
          </button>

          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>{massConsultaMessage || "Processando..."}</p>
            </div>
          )}

          {!loading && massConsultaMessage && (
            <div className={
              massConsultaMessage.toLowerCase().includes("erro") ||
                massConsultaMessage.toLowerCase().includes("falha")
                ? "error-message"
                : "success-message"
            }>
              {massConsultaMessage}
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {activeForm === "cnpj" && cnpjData && (
        <div className="card-resultado" ref={resultadoRef}>
          <h4>Resultado da busca realizada</h4>

          <label>Razão Social:</label>
          <input type="text" value={cnpjData.razao_social || "N/A"} disabled />

          <label>CNPJ:</label>
          <input type="text" value={cnpjData.cnpj || "N/A"} disabled />

          <label>Atividade Principal:</label>
          <input type="text" value={cnpjData.cnae_fiscal_descricao || "N/A"} disabled />

          <label>Telefone:</label>
          <input type="text" value={cnpjData.ddd_telefone_1 || cnpjData.ddd_telefone_2 || "N/A"} disabled />

          <label>UF (Sede):</label>
          <input type="text" value={cnpjData.uf || "N/A"} disabled />

          <label>Bairro</label>
          <input type="text" value={cnpjData.bairro || "Não informada"} disabled />

          <label>Rua</label>
          <input
            type="text"
            value={
              cnpjData.descricao_tipo_de_logradouro && cnpjData.logradouro
                ? `${cnpjData.descricao_tipo_de_logradouro} ${cnpjData.logradouro}${cnpjData.numero ? `, ${cnpjData.numero}` : ""
                }`
                : cnpjData.descricao_tipo_de_logradouro || cnpjData.logradouro || "Não informada"
            }
            disabled
          />

          <label>Complemento</label>
          <input type="text" value={cnpjData.complemento || "Não informada"} disabled />

          <label>Município</label>
          <input type="text" value={cnpjData.municipio || "Não informada"} disabled />
        </div>
      )}

      {activeForm === "chaves" && Array.isArray(resultList) && resultList.length > 0 && (
        <div className="card-resultado" ref={resultadoRef}>
          <h4>Resultados encontrados</h4>
          <table className="historico-table">
            <thead>
              <tr>
                <th>Razão Social</th>
                <th>CNPJ</th>
                <th>UF</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resultList.map((item, idx) => {
                const BD = item.BasicData ?? item.basicData ?? flatToBasicData(item) ?? {};
                const AD = BD.Address ?? {};
                const CT = BD.Contact ?? {};

                return (
                  <React.Fragment key={idx}>
                    <tr
                      className={selectedResultIndex === idx ? "active-row" : ""}
                      onClick={() => handleExpandResult(idx)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{BD?.OfficialName || "N/A"}</td>
                      <td>{BD?.TaxIdNumber || "N/A"}</td>
                      <td>{BD?.HeadquarterState || "N/A"}</td>
                      <td className="expand-icon">
                        <i className={`bi ${selectedResultIndex === idx ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                      </td>
                    </tr>
                    {selectedResultIndex === idx && (
                      <tr>
                        <td colSpan="4">
                          <div className="detalhes-historico-panel">
                            <p>
                              <strong>Razão Social:</strong> {BD?.OfficialName || "Não localizado"}
                            </p>
                            <p>
                              <strong>Nome Fantasia:</strong> {BD?.TradeName || "Não localizado"}
                            </p>
                            <p>
                              <strong>CNPJ:</strong> {BD?.TaxIdNumber || "Não localizado"}
                            </p>
                            <p>
                              <strong>Situação Cadastral:</strong> {BD?.TaxIdStatus || "Não localizado"}
                            </p>
                            <p>
                              <strong>Telefone:</strong> {CT?.Phone1 || CT?.Phone2 || "N/A"}
                            </p>
                            <p>
                              <strong>Email:</strong> {CT?.Email || "Não localizado"}
                            </p>
                            <p>
                              <strong>CEP:</strong> {AD?.ZipCode || "Não localizado"}
                            </p>
                            <p>
                              <strong>Endereço:</strong>{" "}
                              {AD?.StreetType || AD?.Street || AD?.Number || AD?.Complement
                                ? `${AD?.StreetType ?? ""} ${AD?.Street ?? ""}${AD?.Number ? `, ${AD?.Number}` : ""
                                  }${AD?.Complement ? ` - ${AD?.Complement}` : ""}`
                                  .replace(/\s+/g, " ")
                                  .trim()
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Bairro:</strong> {AD?.Neighborhood || "Não localizado"}
                            </p>
                            <p>
                              <strong>Município:</strong> {AD?.City || "Não localizado"}
                            </p>
                            <p>
                              <strong>UF:</strong> {BD?.HeadquarterState || "Não localizado"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeForm === "chaves" &&
        !loading &&
        !error &&
        hasQueried &&
        resultado &&
        Array.isArray(resultList) &&
        resultList.length === 0 && (
          <div className="no-results-message">
            Nenhum resultado encontrado para os filtros informados. Adicione mais informações.
          </div>
        )}
    </div>
  );
};

export default ConsultaCNPJ;

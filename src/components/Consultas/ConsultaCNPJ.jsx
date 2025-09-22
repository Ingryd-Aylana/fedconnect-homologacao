
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";
import { FileSpreadsheet } from "lucide-react";
import { FiCopy, FiCheck } from "react-icons/fi";

function preencherZeros(valor, tamanho) {
  valor = String(valor).replace(/\D/g, "");
  return valor.padStart(tamanho, "0");
}

function formatarDataBrasileira(dataStr) {
  if (!dataStr) return "";

  if (dataStr.length > 10 && dataStr[4] === '-') {
    const [ano, mes, dia] = dataStr.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  }

  const match = dataStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (match) {
    const [, ano, mes, dia] = match;
    return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
  }

  return dataStr;
}


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

function baixarXLSX(linhas) {
  if (!linhas || !linhas.length) return;
  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, "resultado-consulta-cnpjs.xlsx");
}

const ConsultaCNPJ = () => {

  const [copiado, setCopiado] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  function copiarParaClipboard(texto, campo) {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiado((prev) => ({ ...prev, [campo]: true }));
    setShowPopup(true);
    setTimeout(() => {
      setCopiado((prev) => ({ ...prev, [campo]: false }));
      setShowPopup(false);
    }, 1000);
  }
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

  const [massResultRows, setMassResultRows] = useState([]);
  const [massProgress, setMassProgress] = useState({ current: 0, total: 0 });
  const [massProcessing, setMassProcessing] = useState(false);

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

  const cnpjData = getCnpjData(resultado);
  const resultList = getResultList(resultado);

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
      const apiData = response?.data ?? response;

      setResultado(apiData);
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

    setMassConsultaMessage("Lendo planilha...");
    setMassProcessing(true);
    setMassProgress({ current: 0, total: 0 });
    setMassResultRows([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const cnpjsParaConsulta = jsonData
          .map((row) => preencherZeros(row.CNPJ, 14))
          .filter((cnpj) => cnpj.length === 14 && isValidCNPJ(cnpj));


        if (!cnpjsParaConsulta.length)
          throw new Error("Nenhum CNPJ válido encontrado na planilha.");

        setMassConsultaMessage("Iniciando consultas individuais...");
        setMassProgress({ current: 0, total: cnpjsParaConsulta.length });

        const resultados = [];
        for (let i = 0; i < cnpjsParaConsulta.length; i++) {
          setMassProgress({ current: i + 1, total: cnpjsParaConsulta.length });
          try {
            const resp = await ConsultaService.realizarConsulta({
              tipo_consulta: "cnpj",
              parametro_consulta: cnpjsParaConsulta[i],
            });
            const data = resp.resultado_api || resp.resultado_api;


            resultados.push({
              CNPJ: cnpjsParaConsulta[i],
              RazaoSocial: data.razao_social || "",
              Atividade: data.cnae_fiscal_descricao || "",
              Municipio: data.municipio || "",
              UF: data.uf || "",
              Bairro: data.bairro || "",
              CEP: data.cep || "",
              Rua: data.logradouro || "",
              Numero: data.numero || "",
              Complemento: data.complemento || "",
              Telefone: data.ddd_telefone_1 || data.ddd_telefone_2 || "",
              'Situação Cadastral': data.descricao_situacao_cadastral || "",
              'Data Início Atividade': formatarDataBrasileira(data.data_inicio_atividade),
              'Matriz/Filial': data.descricao_identificador_matriz_filial || "",
              'Atividades Secundárias': (
                Array.isArray(data.cnaes_secundarios)
                  ? data.cnaes_secundarios
                    .map((c) => c.descricao)
                    .filter((d) => !!d && d.trim() !== "")
                    .join(", ")
                  : ""
              ),
            });

          } catch (e) {
            resultados.push({
              CNPJ: cnpjsParaConsulta[i],
              RazaoSocial: "",
              Situacao: "Erro",
              Atividade: "",
              Municipio: "",
              UF: "",
              Erro: getFriendlyError(e, { tipo_consulta: "cnpj" }),
              SituacaoReceita: "",
              DataInclusao: "",
            });
          }
          await new Promise((r) => setTimeout(r, 300));
        }
        setMassResultRows(resultados);
        setMassConsultaMessage("Consultas finalizadas! Baixando arquivo de resultados...");
        baixarXLSX(resultados);
      } catch (err) {
        setMassConsultaMessage(
          `Erro ao processar a planilha: ${err.message || "Erro inesperado"}`
        );
      } finally {
        setMassProcessing(false);
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
    setMassResultRows([]);
    setMassProgress({ current: 0, total: 0 });
    setMassProcessing(false);
  };

  {
    showPopup && (
      <div className="popup-copiado">
        <FiCheck style={{ marginRight: 8 }} />
        Copiado para área de transferência!
      </div>
    )
  }

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
            disabled={massProcessing}
          />
          <button type="button" onClick={() => document.getElementById("input-massa").click()} disabled={massProcessing}>
            Importar Planilha de CNPJs
          </button>
          <button type="button" onClick={handleDownloadModel} disabled={loading || massProcessing}>
            Baixar Planilha Modelo
          </button>

          {massProcessing && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>
                {massConsultaMessage} <br />
                {massProgress.current} de {massProgress.total}
              </p>
            </div>
          )}

          {!massProcessing && massConsultaMessage && (
            <div className={
              massConsultaMessage.toLowerCase().includes("erro") ||
                massConsultaMessage.toLowerCase().includes("falha")
                ? "error-message"
                : "success-message"
            }>
              {massConsultaMessage}
            </div>
          )}

          {!massProcessing && massResultRows.length > 0 && (
            <div className="mass-result">
              <p>{massResultRows.length} linhas processadas.</p>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {activeForm === "cnpj" && cnpjData && (
        <div className="card-resultado" ref={resultadoRef}>
          <h4>Resultado da busca realizada</h4>

          <label>Razão Social:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.razao_social || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar Razão Social"
              onClick={() => copiarParaClipboard(cnpjData.razao_social || "N/A", "razao_social")}>
              {copiado.razao_social ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>CNPJ:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.cnpj || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar CNPJ"
              onClick={() => copiarParaClipboard(cnpjData.cnpj || "N/A", "cnpj")}>
              {copiado.cnpj ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Atividade Principal:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.cnae_fiscal_descricao || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar Atividade Principal"
              onClick={() => copiarParaClipboard(cnpjData.cnae_fiscal_descricao || "N/A", "atividade_principal")}>
              {copiado.atividade_principal ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label style={{ marginBottom: 0 }}>Atividades Secundárias:</label>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <ul style={{ margin: 0, paddingLeft: 24 }}>
              {(Array.isArray(cnpjData.cnaes_secundarios) && cnpjData.cnaes_secundarios.length > 0)
                ? cnpjData.cnaes_secundarios
                  .filter(c => !!c.descricao && c.descricao.trim() !== "")
                  .map((c, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{c.descricao}</li>
                  ))
                : <li>Nenhuma</li>
              }
            </ul>
            <button
              type="button"
              className="copy-btn"
              title="Copiar todas as Atividades Secundárias"
              style={{ marginTop: 2 }}
              onClick={() =>
                copiarParaClipboard(
                  Array.isArray(cnpjData.cnaes_secundarios)
                    ? cnpjData.cnaes_secundarios
                      .filter(c => !!c.descricao && c.descricao.trim() !== "")
                      .map(c => c.descricao)
                      .join('\n') || "Nenhuma"
                    : "Nenhuma",
                  "atividades_secundarias"
                )
              }
            >
              {copiado.atividades_secundarias ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>


          <label>Matriz / Filial:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.descricao_identificador_matriz_filial || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar Matriz/Filial"
              onClick={() => copiarParaClipboard(cnpjData.descricao_identificador_matriz_filial || "N/A", "matriz_filial")}>
              {copiado.matriz_filial ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Telefone:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.ddd_telefone_1 || cnpjData.ddd_telefone_2 || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar Telefone"
              onClick={() => copiarParaClipboard(cnpjData.ddd_telefone_1 || cnpjData.ddd_telefone_2 || "N/A", "telefone")}>
              {copiado.telefone ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Situação Cadastral:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.descricao_situacao_cadastral || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar Situação Cadastral"
              onClick={() => copiarParaClipboard(cnpjData.descricao_situacao_cadastral || "N/A", "situacao_cadastral")}>
              {copiado.situacao_cadastral ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Data de Início de Atividade:</label>
          <div className="input-copy-group">
            <input type="text" value={formatarDataBrasileira(cnpjData.data_inicio_atividade) || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar Data de Início"
              onClick={() => copiarParaClipboard(formatarDataBrasileira(cnpjData.data_inicio_atividade) || "N/A", "data_inicio")}>
              {copiado.data_inicio ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>UF (Sede):</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.uf || "N/A"} disabled />
            <button type="button" className="copy-btn" title="Copiar UF"
              onClick={() => copiarParaClipboard(cnpjData.uf || "N/A", "uf")}>
              {copiado.uf ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Bairro:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.bairro || "Não informada"} disabled />
            <button type="button" className="copy-btn" title="Copiar Bairro"
              onClick={() => copiarParaClipboard(cnpjData.bairro || "Não informada", "bairro")}>
              {copiado.bairro ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>CEP:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.cep || "Não informado"} disabled />
            <button type="button" className="copy-btn" title="Copiar CEP"
              onClick={() => copiarParaClipboard(cnpjData.cep || "Não informado", "cep")}>
              {copiado.cep ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Rua:</label>
          <div className="input-copy-group">
            <input
              type="text"
              value={
                cnpjData.descricao_tipo_de_logradouro && cnpjData.logradouro
                  ? `${cnpjData.descricao_tipo_de_logradouro} ${cnpjData.logradouro}${cnpjData.numero ? `, ${cnpjData.numero}` : ""}`
                  : cnpjData.descricao_tipo_de_logradouro || cnpjData.logradouro || "Não informada"
              }
              disabled
            />
            <button type="button" className="copy-btn" title="Copiar Rua"
              onClick={() => copiarParaClipboard(
                cnpjData.descricao_tipo_de_logradouro && cnpjData.logradouro
                  ? `${cnpjData.descricao_tipo_de_logradouro} ${cnpjData.logradouro}${cnpjData.numero ? `, ${cnpjData.numero}` : ""}`
                  : cnpjData.descricao_tipo_de_logradouro || cnpjData.logradouro || "Não informada",
                "rua"
              )}>
              {copiado.rua ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Complemento:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.complemento || "Não informada"} disabled />
            <button type="button" className="copy-btn" title="Copiar Complemento"
              onClick={() => copiarParaClipboard(cnpjData.complemento || "Não informada", "complemento")}>
              {copiado.complemento ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          <label>Município:</label>
          <div className="input-copy-group">
            <input type="text" value={cnpjData.municipio || "Não informada"} disabled />
            <button type="button" className="copy-btn" title="Copiar Município"
              onClick={() => copiarParaClipboard(cnpjData.municipio || "Não informada", "municipio")}>
              {copiado.municipio ? <FiCheck color="#20bf55" /> : <FiCopy />}
            </button>
          </div>

          {(cnpjData.cep && (cnpjData.descricao_tipo_de_logradouro || cnpjData.logradouro)) && (
            <button
              type="button"
              className="maps-btn"
              style={{ marginTop: 12, marginBottom: 12 }}
              onClick={() => {
                const endereco = `${cnpjData.cep} ${cnpjData.descricao_tipo_de_logradouro || ""} ${cnpjData.logradouro || ""}${cnpjData.numero ? `, ${cnpjData.numero}` : ""}`;
                window.open(`https://www.google.com/maps/place/${encodeURIComponent(endereco)}`, "_blank");
              }}
            >
              Ver endereço no maps
            </button>
          )}
        </div>
      )}

      {/* Resultado da consulta por chaves */}
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

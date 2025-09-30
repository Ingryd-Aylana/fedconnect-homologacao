import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";
import { FileSpreadsheet } from "lucide-react";
import { FiCopy, FiCheck } from "react-icons/fi";

const ConsultaEnd = () => {
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

  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [hasQueried, setHasQueried] = useState(false);

  const [formData, setFormData] = useState({
    cep: "",
    rua: "",
    bairro: "",
    cidade: "",
    uf: "",
  });
  const [massConsultaMessage, setMassConsultaMessage] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(null);

  const resultadoRef = useRef(null);

  // ===== Scroll control (com cancelamento robusto) =====
  const scrollFlagRef = useRef(false);        // se devemos rolar no próximo resultado
  const raf1Ref = useRef(null);               // id do 1º requestAnimationFrame
  const raf2Ref = useRef(null);               // id do 2º requestAnimationFrame

  function cancelPendingScroll() {
    scrollFlagRef.current = false;
    if (raf1Ref.current) {
      cancelAnimationFrame(raf1Ref.current);
      raf1Ref.current = null;
    }
    if (raf2Ref.current) {
      cancelAnimationFrame(raf2Ref.current);
      raf2Ref.current = null;
    }
  }

  function scheduleScrollToResult() {
    cancelPendingScroll(); // garante que não há duplicidade
    scrollFlagRef.current = true;
    raf1Ref.current = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(() => {
        if (!scrollFlagRef.current) return; // pode ter sido cancelado
        const el = resultadoRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          // Só rola se o topo do card estiver consideravelmente fora de vista
          const precisaRolar = rect.top > vh * 0.25 || rect.top < 0;
          if (precisaRolar) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        // desarma a flag após uso
        scrollFlagRef.current = false;
        raf1Ref.current = null;
        raf2Ref.current = null;
      });
    });
  }

  // ===========================
  // Helpers para abrir Google Maps (/search)
  // ===========================
  function buildMapsSearchUrl({ street, neighborhood, city, state, cep }) {
    const parts = [
      street && String(street).trim(),
      neighborhood && String(neighborhood).trim(),
      city && String(city).trim(),
      state && String(state).trim(),
      cep && String(cep).trim(),
    ].filter(Boolean);

    const query = parts.join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function openInMaps(addressObj) {
    const url = buildMapsSearchUrl(addressObj);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const isValidCEP = (raw) => {
    const cep = String(raw || "").replace(/\D/g, "");
    if (cep.length !== 8) return false;
    if (cep === "00000000") return false;
    return true;
  };

  const getFriendlyError = (err, context = {}) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const serverMsg =
      data?.detail || data?.message || data?.mensagem || data?.error || data?.erro;

    if (!err?.response) {
      if (err?.code === "ECONNABORTED") return "Tempo de resposta excedido. Tente novamente em instantes.";
      return "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.";
    }

    if (status === 404) {
      if (context?.tipo_consulta === "endereco")
        return "CEP não encontrado. Confira os dígitos e tente novamente.";
      if (context?.tipo_consulta === "cep_rua_cidade")
        return "Nenhum endereço encontrado para os filtros informados.";
      return serverMsg || "Recurso não encontrado.";
    }
    if (status === 400 || status === 422) {
      if (context?.tipo_consulta === "endereco")
        return "CEP inválido ou em formato incorreto. Use apenas números (8 dígitos).";
      if (context?.tipo_consulta === "cep_rua_cidade")
        return "Parâmetros inválidos na consulta. Revise UF, Cidade e Rua.";
      return "Requisição inválida. Ajuste os campos e tente novamente.";
    }
    if (status === 429) return "Muitas consultas em sequência. Aguarde e tente novamente.";
    if (status === 401 || status === 403) return "Acesso não autorizado. Verifique suas credenciais.";
    if (status >= 500) return "Serviço do provedor indisponível no momento. Tente novamente em instantes.";

    return serverMsg || `Erro inesperado (${status}). Tente novamente.`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cep") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 8) {
        formattedValue = formattedValue.substring(0, 8);
      }
    }
    if (name === "uf") {
      formattedValue = value.toUpperCase().substring(0, 2);
    }

    // Usuário começou a editar: cancele qualquer scroll pendente
    cancelPendingScroll();

    // Se já existe um resultado exibido, mantenha a viewport no topo do formulário
    if (resultado) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);
    setMassConsultaMessage("");
    setSelectedResultIndex(null);

    // Ao iniciar uma nova consulta, garanta viewport no topo e nenhum scroll pendente
    window.scrollTo({ top: 0, behavior: "auto" });
    cancelPendingScroll();

    let payload = {};
    let isFormValid = true;
    let validationErrorMessage = "";

    if (activeForm === "cep") {
      if (!isValidCEP(formData.cep)) {
        validationErrorMessage = "Por favor, insira um CEP válido com 8 dígitos.";
        isFormValid = false;
      } else {
        payload = {
          tipo_consulta: "endereco",
          parametro_consulta: formData.cep,
          origem: "manual",
        };
      }
    } else if (activeForm === "chaves") {
      const obrigatorios = [formData.uf.trim(), formData.cidade.trim(), formData.rua.trim()];
      const filled = obrigatorios.filter(Boolean).length;

      if (filled === 0) {
        validationErrorMessage = "Preencha os campos obrigatórios para buscar.";
        isFormValid = false;
      } else if (filled < 3) {
        validationErrorMessage = "Por favor, preencha TODOS os campos obrigatórios: UF, Cidade e Rua.";
        isFormValid = false;
      } else {
        if (!/^[A-Z]{2}$/.test(formData.uf.trim().toUpperCase())) {
          validationErrorMessage = "UF inválida. Use 2 letras (ex: RJ).";
          isFormValid = false;
        } else {
          payload = {
            tipo_consulta: "cep_rua_cidade",
            parametro_consulta: JSON.stringify({
              estado: formData.uf,
              cidade: formData.cidade,
              logradouro: formData.rua,
              ...(formData.bairro.trim() ? { bairro: formData.bairro.trim() } : {}),
            }),
            origem: "manual",
          };
        }
      }
    } else {
      setLoading(false);
      return;
    }

    if (!isFormValid) {
      setError(validationErrorMessage);
      setLoading(false);
      setHasQueried(false);
      return;
    }

    try {
      const resp = await ConsultaService.realizarConsulta(payload);
      const response = resp?.data ?? resp;

      if (response?.resultado_api) {
        setResultado(response);
        // agenda um ÚNICO scroll suave até o card do resultado
        scheduleScrollToResult();
      } else {
        setError(
          response?.mensagem ||
          "Resposta inesperada da API. Endereço não encontrado ou inválido."
        );
        setResultado(null);
      }
    } catch (err) {
      const friendly = getFriendlyError(err, payload);
      setError(friendly);
      console.error("Erro na consulta de endereço individual:", err?.response?.data || err);
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

        const cepsParaConsulta = jsonData.map((row) => ({
          CEP: String(row.CEP || "").replace(/\D/g, ""),
        }));

        const cepsValidos = cepsParaConsulta.filter((item) => isValidCEP(item.CEP));

        if (cepsValidos.length === 0) {
          setMassConsultaMessage(
            "Nenhum CEP válido encontrado na planilha. Verifique se a coluna de CEPs está preenchida corretamente e se o cabeçalho é 'CEP'."
          );

          setLoading(false);
          if (event.target) event.target.value = null;
          return;
        }

        const requestBody = { ceps: cepsValidos, origem: "planilha" };

        setMassConsultaMessage("Enviando CEPs para processamento em massa...");
        const blobResponse = await ConsultaService.processarPlanilhaCEP(requestBody);
        const url = window.URL.createObjectURL(new Blob([blobResponse]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "planilha-resultado-ceps.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setMassConsultaMessage("Processamento concluído! O download da planilha de resultados iniciou.");
      } catch (err) {
        console.error("Erro na comunicação ou processamento do arquivo:", err);
        const friendly = getFriendlyError(err, { tipo_consulta: "massa_cep" });
        setMassConsultaMessage(`Erro ao processar a planilha: ${friendly}`);
      } finally {
        setLoading(false);
        if (event.target) {
          event.target.value = null;
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadModel = async () => {
    setLoading(true);
    setMassConsultaMessage("Baixando planilha modelo...");
    try {
      const blobResponse = await ConsultaService.baixarPlanilhaModeloCEP();
      const url = window.URL.createObjectURL(new Blob([blobResponse]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "planilha-modelo-cep.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setMassConsultaMessage("Download do modelo concluído.");
    } catch (err) {
      console.error("Erro ao baixar modelo:", err);
      const friendly = getFriendlyError(err, { tipo_consulta: "modelo_cep" });
      setMassConsultaMessage(`Erro ao baixar modelo: ${friendly}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandResult = (idx) => {
    setSelectedResultIndex(selectedResultIndex === idx ? null : idx);
  };

  const resetFormState = () => {
    // Ao trocar de aba/limpar, cancele QUALQUER scroll pendente e jogue pro topo
    cancelPendingScroll();
    window.scrollTo({ top: 0, behavior: "auto" });

    setFormData({ cep: "", rua: "", bairro: "", cidade: "", uf: "" });
    setError(null);
    setResultado(null);
    setMassConsultaMessage("");
    setSelectedResultIndex(null);
    setHasQueried(false);
  };

  function isBuscaChaveSemResultado(resultado) {
    if (!resultado?.resultado_api) return false;
    const arr = resultado.resultado_api.resultados_viacep;
    return resultado.tipo_consulta === "cep_rua_cidade" && (!Array.isArray(arr) || arr.length === 0);
  }

  return (
    <div className="consulta-container03">
      <h1 className="consultas-title">
        <i className="bi-clipboard-data"></i> Consultas Disponíveis
      </h1>

      <div className="card-options-wrapper">
        <div
          className={`card card-option ${activeForm === "cep" ? "active" : ""}`}
          onClick={() => {
            setActiveForm("cep");
            resetFormState();
          }}
        >
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="white"
              className="bi bi-geo-alt-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"></path>
            </svg>
          </div>
          <h5>Consulta por CEP</h5>
        </div>

        <div
          className={`card card-option ${activeForm === "chaves" ? "active" : ""}`}
          onClick={() => {
            setActiveForm("chaves");
            resetFormState();
          }}
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
          onClick={() => {
            setActiveForm("massa");
            resetFormState();
          }}
        >
          <div className="icon-container">
            <FileSpreadsheet size={35} />
          </div>
          <h5>Consulta em Massa (CEP)</h5>
        </div>
      </div>

      {/* FORMULÁRIOS */}
      {activeForm === "cep" && (
        <form className="form-container" onSubmit={handleSubmit}>
          <label htmlFor="cep">Digite o CEP para ser localizado</label>
          <input
            type="text"
            id="cep"
            name="cep"
            value={formData.cep}
            onChange={handleFormChange}
            placeholder="Digite o CEP (apenas números)"
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
          <label htmlFor="uf">
            UF: <span className="obrigatorio" title="Campo obrigatório para busca por chaves alternativas">*</span>
          </label>
          <input
            type="text"
            id="uf"
            name="uf"
            value={formData.uf}
            onChange={handleFormChange}
            placeholder="Digite o Estado (ex: RJ)"
            maxLength="2"
            required
            disabled={loading}
          />

          <label htmlFor="cidade">
            Cidade: <span className="obrigatorio" title="Campo obrigatório para busca por chaves alternativas">*</span>
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleFormChange}
            placeholder="Digite a cidade"
            required
            disabled={loading}
          />

          <label htmlFor="rua">
            Rua: <span className="obrigatorio" title="Campo obrigatório para busca por chaves alternativas">*</span>
          </label>
          <input
            type="text"
            id="rua"
            name="rua"
            value={formData.rua}
            onChange={handleFormChange}
            placeholder="Digite o nome da rua"
            required
            disabled={loading}
          />

          <label htmlFor="bairro">Bairro (Opcional):</label>
          <input
            type="text"
            id="bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleFormChange}
            placeholder="Digite o nome do bairro"
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}

      {activeForm === "massa" && (
        <div className="form-massa-container">
          <button type="button" onClick={() => document.getElementById("input-massa-cep").click()} disabled={loading}>
            Importar Planilha de CEPs
          </button>
          <button type="button" onClick={handleDownloadModel} disabled={loading}>
            Baixar Planilha Modelo (CEP)
          </button>
          <input
            type="file"
            id="input-massa-cep"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMassFileUpload}
            disabled={loading}
          />
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>{massConsultaMessage || "Processando..."}</p>
            </div>
          )}

          {!loading && massConsultaMessage && (
            <div
              className={
                massConsultaMessage.toLowerCase().includes("erro") ||
                massConsultaMessage.toLowerCase().includes("falha")
                  ? "error-message"
                  : "success-message"
              }
            >
              {massConsultaMessage}
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
        </div>
      )}

      {/* RESULTADO - CONSULTA POR CEP */}
      {activeForm !== "massa" &&
        resultado?.resultado_api &&
        ((resultado?.historico_salvo?.tipo_consulta || resultado?.tipo_consulta) === "endereco") && (
          <div className="card-resultado" ref={resultadoRef}>
            <label>CEP:</label>
            <div className="input-copy-group">
              <input type="text" value={resultado.resultado_api.cep || "N/A"} disabled />
              <button
                type="button"
                className="copy-btn"
                title="Copiar CEP"
                onClick={() => copiarParaClipboard(resultado.resultado_api.cep || "N/A", "cep")}
              >
                {copiado.cep ? <FiCheck color="#20bf55" /> : <FiCopy />}
              </button>
            </div>

            <label>Logradouro:</label>
            <div className="input-copy-group">
              <input type="text" value={resultado.resultado_api.street || "N/A"} disabled />
              <button
                type="button"
                className="copy-btn"
                title="Copiar Logradouro"
                onClick={() => copiarParaClipboard(resultado.resultado_api.street || "N/A", "logradouro")}
              >
                {copiado.logradouro ? <FiCheck color="#20bf55" /> : <FiCopy />}
              </button>
            </div>

            <label>Bairro:</label>
            <div className="input-copy-group">
              <input type="text" value={resultado.resultado_api.neighborhood || "N/A"} disabled />
              <button
                type="button"
                className="copy-btn"
                title="Copiar Bairro"
                onClick={() => copiarParaClipboard(resultado.resultado_api.neighborhood || "N/A", "bairro")}
              >
                {copiado.bairro ? <FiCheck color="#20bf55" /> : <FiCopy />}
              </button>
            </div>

            <label>Cidade:</label>
            <div className="input-copy-group">
              <input type="text" value={resultado.resultado_api.city || "N/A"} disabled />
              <button
                type="button"
                className="copy-btn"
                title="Copiar Cidade"
                onClick={() => copiarParaClipboard(resultado.resultado_api.city || "N/A", "cidade")}
              >
                {copiado.cidade ? <FiCheck color="#20bf55" /> : <FiCopy />}
              </button>
            </div>

            <label>UF:</label>
            <div className="input-copy-group">
              <input type="text" value={resultado.resultado_api.state || "N/A"} disabled />
              <button
                type="button"
                className="copy-btn"
                title="Copiar UF"
                onClick={() => copiarParaClipboard(resultado.resultado_api.state || "N/A", "uf")}
              >
                {copiado.uf ? <FiCheck color="#20bf55" /> : <FiCopy />}
              </button>
            </div>

            {(resultado.resultado_api.cep && resultado.resultado_api.street) && (
              <button
                className="maps-btn"
                style={{ marginTop: 12, marginBottom: 10 }}
                type="button"
                onClick={() =>
                  openInMaps({
                    street: resultado.resultado_api.street,
                    neighborhood: resultado.resultado_api.neighborhood,
                    city: resultado.resultado_api.city,
                    state: resultado.resultado_api.state,
                    cep: resultado.resultado_api.cep,
                  })
                }
              >
                Ver endereço no maps
              </button>
            )}
          </div>
        )}

      {/* RESULTADO - CONSULTA POR CHAVES (múltiplos) */}
      {activeForm === "chaves" &&
        resultado?.resultado_api?.resultados_viacep &&
        resultado.resultado_api.resultados_viacep.length > 0 && (
          <div className="card-resultado" ref={resultadoRef}>
            <h4>Resultados encontrados</h4>
            <table className="historico-table">
              <thead>
                <tr>
                  <th>CEP</th>
                  <th>Logradouro</th>
                  <th>Cidade</th>
                  <th>UF</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {resultado.resultado_api.resultados_viacep.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr
                      className={selectedResultIndex === idx ? "active-row" : ""}
                      onClick={() => setSelectedResultIndex(selectedResultIndex === idx ? null : idx)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{item.cep || "N/A"}</td>
                      <td>{item.logradouro || "N/A"}</td>
                      <td>{item.localidade || "N/A"}</td>
                      <td>{item.uf || "N/A"}</td>
                      <td className="expand-icon">
                        <i className={`bi ${selectedResultIndex === idx ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                      </td>
                    </tr>
                    {selectedResultIndex === idx && (
                      <tr>
                        <td colSpan="5">
                          <div className="detalhes-historico-panel">
                            <p><strong>CEP:</strong> {item.cep || "N/A"}</p>
                            <p><strong>Logradouro:</strong> {item.logradouro || "N/A"}</p>
                            <p><strong>Bairro:</strong> {item.bairro || "N/A"}</p>
                            <p><strong>Cidade:</strong> {item.localidade || "N/A"}</p>
                            <p><strong>UF:</strong> {item.uf || "N/A"}</p>
                            <p><strong>Complemento:</strong> {item.complemento || "N/A"}</p>
                            {(item.cep && item.logradouro) && (
                              <button
                                className="maps-btn"
                                style={{ marginTop: 8 }}
                                type="button"
                                onClick={() =>
                                  openInMaps({
                                    street: item.logradouro,
                                    neighborhood: item.bairro,
                                    city: item.localidade,
                                    state: item.uf,
                                    cep: item.cep,
                                  })
                                }
                              >
                                Ver endereço no maps
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {activeForm === "chaves" &&
              isBuscaChaveSemResultado(resultado) &&
              hasQueried &&
              !loading &&
              !error && (
                <div className="no-results-message">
                  Nenhum endereço encontrado para os parâmetros fornecidos.
                </div>
              )}
          </div>
        )}
    </div>
  );
};

export default ConsultaEnd;

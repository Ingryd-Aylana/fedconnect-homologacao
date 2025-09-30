import React, { useState, useRef, useEffect } from "react";
import "../styles/Comercial.css";
import { ConsultaService } from "../../services/consultaService";
import { FaBriefcase, FaFileExcel, FaSearch } from "react-icons/fa";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const ConsultaComercial = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [accordionOpen, setAccordionOpen] = useState(null);
  const resultadoRef = useRef(null);
  const formCnpjRef = useRef(null);
  const formMassaRef = useRef(null);
  const [form, setForm] = useState({ cnpj: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPersonData, setModalPersonData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [file, setFile] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [massConsultaMessage, setMassConsultaMessage] = useState("");
  const [massLoading, setMassLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeCard === "cnpj" && formCnpjRef.current) {
      setTimeout(() => {
        formCnpjRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
    if (activeCard === "massa" && formMassaRef.current) {
      setTimeout(() => {
        formMassaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
    if (activeCard === "conteudo" && formConteudoRef.current) {
      setTimeout(() => {
        formConteudoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [activeCard]);

  useEffect(() => {
    if (result && resultadoRef.current) {
      setTimeout(() => {
        resultadoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 220);
    }
  }, [result]);

  const handleCardClick = (option) => {
    setActiveCard(option);
    if (option === "conteudo") {
      navigate("/cotacao-conteudo");
    }
  };

  const handleCnpjChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setForm({ cnpj: onlyDigits.slice(0, 14) });
  };

  const handleSearch = async () => {
    setResult(null);
    setError(null);
    if (!form.cnpj) {
      setError("Por favor, digite um CNPJ.");
      return;
    }
    if (form.cnpj.length < 14) {
      setError("O CNPJ deve conter 14 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const { resultado_api } = await ConsultaService.consultarComercial(form.cnpj);
      const empresa = resultado_api?.Result?.[0] || null;
      if (empresa) {
        setResult(empresa);
        setForm({ cnpj: "" });
      } else {
        setError("Nenhum resultado de empresa encontrado para o CNPJ fornecido.");
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao consultar o CNPJ da empresa.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonClick = async (person) => {
    const cpf = person.RelatedEntityTaxIdNumber;
    if (!cpf || person.RelatedEntityTaxIdType !== "CPF") {
      setModalError("CPF não disponível ou tipo de documento inválido.");
      setShowModal(true);
      return;
    }
    setModalLoading(true);
    setModalError(null);
    setModalPersonData(null);
    try {
      const { resultado_api } = await ConsultaService.consultarContatoComercial(cpf);
      const regData = resultado_api?.Result?.[0]?.RegistrationData || null;
      if (regData) setModalPersonData(regData);
      else setModalError("Nenhum dado de contato encontrado para esta pessoa.");
    } catch (err) {
      setModalError(err.message || "Erro ao consultar detalhes de contato.");
    } finally {
      setModalLoading(false);
      setShowModal(true);
    }
  };

  const renderFilteredRelationships = (rels, title) => {
    if (!rels?.length) return null;
    const filtered = rels.filter(
      (r) =>
        r.RelationshipType === "QSA" ||
        r.RelationshipType === "Ownership" ||
        r.RelationshipType === "REPRESENTANTELEGAL"
    );
    if (!filtered.length) return null;
    return (
      <>
        <h6 className="rel-title">{title}:</h6>
        <ul className="rel-list">
          {filtered.map((p, i) => (
            <li
              key={`${p.RelatedEntityTaxIdNumber}-${i}`}
              className="rel-list-item"
            >
              <div className="rel-info">
                <strong>{p.RelatedEntityName || "Nome N/A"}</strong>
                <br />
                <span className="rel-type">Tipo: {p.RelationshipType}</span>
                <br />
                <span className="rel-cpf">
                  CPF: {p.RelatedEntityTaxIdNumber}
                </span>
              </div>
              <button
                className="btn-rel-details"
                onClick={() => handlePersonClick(p)}
                title="Ver Detalhes"
              >
                Ver Detalhes
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setBulkResults([]);
    setMassConsultaMessage("");
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMassConsultaMessage(
        "Por favor, selecione um arquivo Excel (.xlsx ou .xls)."
      );
      return;
    }

    setMassLoading(true);
    setMassConsultaMessage(
      "Lendo arquivo e preparando para consulta em massa..."
    );

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          let cnpjs = [];
          if (jsonSheet.length > 1) {
            cnpjs = jsonSheet
              .slice(1)
              .map((row) => String(row[0]).replace(/\D/g, ""))
              .filter((cnpj) => cnpj.length === 14);
          } else if (jsonSheet.length === 1 && jsonSheet[0].length > 0) {
            cnpjs = [String(jsonSheet[0][0]).replace(/\D/g, "")].filter(
              (cnpj) => cnpj.length === 14
            );
          }

          if (cnpjs.length === 0) {
            setMassConsultaMessage(
              "Nenhum CNPJ válido encontrado na planilha. Verifique se a coluna de CNPJs é a primeira e não há cabeçalhos inesperados ou dados inválidos."
            );
            setMassLoading(false);
            return;
          }

          setMassConsultaMessage(
            `Encontrados ${cnpjs.length} CNPJs. Iniciando consulta em massa...`
          );

          const payload = { cnpjs: cnpjs };
          const excelBlob = await ConsultaService.consultarComercialMassa(
            payload
          );

          const url = window.URL.createObjectURL(excelBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "resultados_consulta_massa_cpf.xlsx";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          setMassConsultaMessage(
            "Consulta em massa concluída! Planilha de resultados baixada."
          );
          setFile(null);
        } catch (readError) {
          console.error("Erro ao ler o arquivo Excel:", readError);
          setMassConsultaMessage(
            "Erro ao processar o arquivo. Certifique-se de que é um Excel válido e no formato esperado."
          );
        } finally {
          setMassLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (serviceError) {
      console.error("Erro na consulta em massa:", serviceError);
      setMassConsultaMessage(
        `Erro na consulta em massa: ${serviceError.message || "Verifique o console para mais detalhes."
        }`
      );
      setMassLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    setMassLoading(true);
    setMassConsultaMessage("Baixando modelo...");
    try {
      const response = await ConsultaService.baixarPlanilhaModeloCNPJ();
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "modelo-cnpj.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMassConsultaMessage("Download do modelo concluído.");
    } catch {
      setMassConsultaMessage("Erro ao baixar modelo.");
    } finally {
      setMassLoading(false);
    }
  };

  return (
    <div className="comercial-page">
      <h1 className="comercial-title">
        <i className="bi bi-clipboard2-check"></i> Consultas Disponíveis
      </h1>

      <div className="card-options-accordion">
        {/* Accordion Relacionamentos */}
        <div className="accordion-card">
          <button
            className="accordion-header"
            onClick={() =>
              setAccordionOpen(accordionOpen === "relacionamentos" ? null : "relacionamentos")
            }
            aria-expanded={accordionOpen === "relacionamentos"}
          >
            <i className="bi bi-people-fill icon-categoria"></i>
            <span>Relacionamentos</span>
            <span className="accordion-arrow">
              {accordionOpen === "relacionamentos" ? "▲" : "▼"}
            </span>
          </button>
          {accordionOpen === "relacionamentos" && (
            <div className="accordion-body">
              <div className="subcard-option" onClick={() => setActiveCard("cnpj")}>
                <FaBriefcase size={25} className="subcard-icon" />
                <span>Consulta CNPJ</span>
              </div>
              <div className="subcard-option" onClick={() => setActiveCard("massa")}>
                <FaFileExcel size={25} className="subcard-icon" />
                <span>Consulta em Massa</span>
              </div>
              <div
                className="subcard-option"
                onClick={() => navigate("/comercial-regiao")}
              >
                <MapPin size={25} className="subcard-icon" />
                <span>Consulta por Região</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Operacional */}
        <div className="accordion-card">
          <button
            className="accordion-header"
            onClick={() =>
              setAccordionOpen(accordionOpen === "operacional" ? null : "operacional")
            }
            aria-expanded={accordionOpen === "operacional"}
          >
            <i className="bi bi-gear-fill icon-categoria"></i>
            <span>Operacional</span>
            <span className="accordion-arrow">
              {accordionOpen === "operacional" ? "▲" : "▼"}
            </span>
          </button>
          {accordionOpen === "operacional" && (
            <div className="accordion-body">
              <div
                className="subcard-option"
                onClick={() => navigate("/cotacao-conteudo")}
              >
                <FaSearch size={25} className="subcard-icon" />
                <span>Estudo Conteúdo</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Painéis - NOVO */}
        <div className="accordion-card">
          <button
            className="accordion-header"
            onClick={() =>
              setAccordionOpen(accordionOpen === "paineis" ? null : "paineis")
            }
            aria-expanded={accordionOpen === "paineis"}
          >
            <i className="bi bi-columns-gap icon-categoria"></i>
            <span>Painéis</span>
            <span className="accordion-arrow">
              {accordionOpen === "paineis" ? "▲" : "▼"}
            </span>
          </button>
          {accordionOpen === "paineis" && (
            <div className="accordion-body">
             
              <div
                className="subcard-option"
                onClick={() => navigate("/agenda-comercial")}
              >
                <FaBriefcase size={23} className="subcard-icon" />
                <span>Agenda Comercial</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeCard === "cnpj" && (
        <div className="form-container" ref={formCnpjRef}>
          <label>Digite o CNPJ:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite apenas os 14 dígitos do CNPJ"
            value={form.cnpj}
            onChange={handleCnpjChange}
          />
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Consultando..." : <><FaSearch className="btn-icon" /> Consultar</>}
          </button>
          {error && <div className="alert-erro mt-3">{error}</div>}
        </div>
      )}

      {activeCard === "massa" && (
        <div className="form-massa-container" ref={formMassaRef}>
          <label className="form-label">Consulta em massa:</label>
          <input
            type="file"
            id="input-massa-cnpj"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleImportFile}
            disabled={massLoading}
          />
          <button
            className="btn-primary"
            type="button"
            onClick={() => document.getElementById("input-massa-cnpj").click()}
            disabled={loading}
          >
            Importar Planilha de CNPJs
          </button>
          <button
            className="btn-primary mt-2"
            type="button"
            onClick={handleDownloadModel}
            disabled={loading}
          >
            Baixar Planilha Modelo
          </button>

          {massLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>{massConsultaMessage || "Processando..."}</p>
            </div>
          )}

          {!massLoading && massConsultaMessage && (
            <div className={
              massConsultaMessage.toLowerCase().includes("erro") ||
                massConsultaMessage.toLowerCase().includes("falha")
                ? "error-message"
                : "success-message"
            }>
              {massConsultaMessage}
            </div>
          )}

          {bulkResults.length > 0 && (
            <div className="bulk-results mt-3">
              <h5>Resultados:</h5>
              <ul>
                {bulkResults.map((item, idx) => (
                  <li
                    key={idx}
                    className={
                      item.erro
                        ? "bulk-result-error"
                        : "bulk-result-success"
                    }
                  >
                    <strong>{item.cnpj}:</strong> {item.erro ? "Erro ao consultar" : `Empresa ${item.empresa ? "encontrada" : "não encontrada"}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeCard === "conteudo" && (
        <div className="form-container">
          <label>Digite o endereço:</label>
          <input type="text" placeholder="Rua, número, bairro..." />
          <button>Pesquisar Conteúdo</button>
        </div>
      )}

      {result && (
        <div className="form-card mt-4" ref={resultadoRef}>
          <div className="card-body">
            {renderFilteredRelationships(
              result.Relationships.CurrentRelationships,
              "Sócios, Administradores e Representantes Legais"
            )}
            {!result.Relationships.CurrentRelationships?.length && (
              <p className="no-rel-msg">
                Nenhum sócio, administrador ou representante legal encontrado para este CNPJ.
              </p>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn-icon modal-close" onClick={() => setShowModal(false)} title="Fechar">×</button>
            <h2 className="modal-titulo-central">Informações Básicas</h2>
            {modalLoading && (
              <div className="modal-loading">
                <div className="spinner"></div>
                <p>Buscando detalhes de contato...</p>
              </div>
            )}
            {modalError && <div className="alert-erro">{modalError}</div>}

            {(() => {
              function exibirValor(valor, fallback = "Não localizado") {
                if (
                  valor === undefined ||
                  valor === null ||
                  valor === "" ||
                  valor === "undefined" ||
                  valor === "null"
                ) {
                  return fallback;
                }
                return valor;
              }

              return (
                modalPersonData && !modalLoading && !modalError && (
                  <div className="modal-dados-grid">
                    <div className="modal-coluna">
                      <p>
                        <strong>Nome:</strong> {exibirValor(modalPersonData.BasicData?.Name)}
                      </p>
                      <p>
                        <strong>CPF:</strong> {exibirValor(modalPersonData.BasicData?.TaxIdNumber)}
                      </p>
                      <p>
                        <strong>Gênero:</strong> {exibirValor(modalPersonData.BasicData?.Gender)}
                      </p>
                      <p>
                        <strong>Data de Nascimento:</strong>{" "}
                        {modalPersonData.BasicData?.BirthDate
                          ? new Date(modalPersonData.BasicData.BirthDate).toLocaleDateString()
                          : "Não localizado"}
                      </p>
                      <p>
                        <strong>Nome da Mãe:</strong> {exibirValor(modalPersonData.BasicData?.MotherName)}
                      </p>
                      <p>
                        <strong>Status do CPF:</strong> {exibirValor(modalPersonData.BasicData?.TaxIdStatus)}
                      </p>
                    </div>
                    <div className="modal-coluna">
                      <p>
                        <strong>E-mail Principal:</strong>{" "}
                        <span style={{ wordBreak: "break-all" }}>
                          {exibirValor(modalPersonData.Emails?.Primary?.EmailAddress)}
                        </span>
                      </p>
                      <p>
                        <strong>E-mail Secundário:</strong>{" "}
                        <span style={{ wordBreak: "break-all" }}>
                          {exibirValor(modalPersonData.Emails?.Secondary?.EmailAddress)}
                        </span>
                      </p>
                      <p>
                        <strong>Endereço Principal:</strong>{" "}
                        {modalPersonData.Addresses?.Primary &&
                          (modalPersonData.Addresses.Primary.AddressMain ||
                            modalPersonData.Addresses.Primary.Number)
                          ? `${exibirValor(modalPersonData.Addresses.Primary.AddressMain)}${modalPersonData.Addresses.Primary.Number
                            ? ", " + exibirValor(modalPersonData.Addresses.Primary.Number)
                            : ""}`
                          : "Não localizado"}
                      </p>
                      <p>
                        <strong>Endereço Secundário:</strong>{" "}
                        {modalPersonData.Addresses?.Secondary &&
                          (modalPersonData.Addresses.Secondary.AddressMain ||
                            modalPersonData.Addresses.Secondary.Number)
                          ? `${exibirValor(modalPersonData.Addresses.Secondary.AddressMain)}${modalPersonData.Addresses.Secondary.Number
                            ? ", " + exibirValor(modalPersonData.Addresses.Secondary.Number)
                            : ""}`
                          : "Não localizado"}
                      </p>
                      <p>
                        <strong>Telefone Principal:</strong>{" "}
                        {modalPersonData.Phones?.Primary &&
                          (modalPersonData.Phones.Primary.AreaCode ||
                            modalPersonData.Phones.Primary.Number)
                          ? `${exibirValor(modalPersonData.Phones.Primary.AreaCode)} ${exibirValor(
                            modalPersonData.Phones.Primary.Number
                          )}`
                          : "Não localizado"}
                      </p>
                      <p>
                        <strong>Telefone Secundário:</strong>{" "}
                        {modalPersonData.Phones?.Secondary &&
                          (modalPersonData.Phones.Secondary.AreaCode ||
                            modalPersonData.Phones.Secondary.Number)
                          ? `${exibirValor(modalPersonData.Phones.Secondary.AreaCode)} ${exibirValor(
                            modalPersonData.Phones.Secondary.Number
                          )}`
                          : "Não localizado"}
                      </p>
                    </div>
                  </div>
                )
              );
            })()}

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConsultaComercial;

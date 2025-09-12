import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Consulta.css";
import { ConsultaService } from "../../services/consultaService";

function traduzirErroApi(mensagem) {
    if (!mensagem) return "Erro inesperado. Por favor, tente novamente.";

    if (typeof mensagem === "string" && mensagem.startsWith('<!DOCTYPE')) {
        return "Erro temporário de conexão com o servidor. Tente novamente em instantes.";
    }
    if (mensagem.toLowerCase().includes("proxy error")) {
        return "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
    }
    if (mensagem.toLowerCase().includes("502") || mensagem.toLowerCase().includes("bad gateway")) {
        return "Não foi possível se conectar ao servidor. Por favor, tente novamente mais tarde.";
    }
    if (mensagem.toLowerCase().includes("timeout")) {
        return "A requisição demorou muito. Verifique sua conexão e tente novamente.";
    }
    if (mensagem.toLowerCase().includes("network error")) {
        return "Falha de comunicação com a API. Verifique sua conexão de internet.";
    }
    if (mensagem.toLowerCase().includes("pelo menos um dos campos")) {
        return mensagem;
    }
    return "Erro ao realizar a consulta. Por favor, revise os dados e tente novamente.";
}

const ConsultaSegurado = () => {
    const [activeForm, setActiveForm] = useState("vida");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [administradoraSuggestions, setAdministradoraSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const suggestionsRef = useRef(null);
    const debounceTimeout = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);

    const [expandedIndex, setExpandedIndex] = useState(null);

    const resultadoRef = useRef(null);

    const initialFormData = {
        cpf: "",
        nome: "",
        posto: "",
        administradora: "",
        endereco: "",
        cnpj: "",
        certificado: "",
        fatura: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const resetFormAndState = useCallback(() => {
        setFormData(initialFormData);
        setError(null);
        setResultado(null);
        setAdministradoraSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
        setCurrentPage(1);
        setTotalPages(1);
        setExpandedIndex(null); 
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    }, [initialFormData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === "cpf") {
            formattedValue = value.replace(/\D/g, "").substring(0, 11);
        } else if (name === "cnpj") {
            formattedValue = value.replace(/\D/g, "").substring(0, 14);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const handleAdmFormChange = useCallback((e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            administradora: value,
        }));
        setActiveIndex(-1);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.length > 0) {
            debounceTimeout.current = setTimeout(async () => {
                try {
                    const suggestions = await ConsultaService.getAdms(value);

                    if (Array.isArray(suggestions)) {
                        setAdministradoraSuggestions(suggestions);
                        setShowSuggestions(suggestions.length > 0);
                    } else {
                        setAdministradoraSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (err) {
                    setAdministradoraSuggestions([]);
                    setShowSuggestions(false);
                }
            }, 300);
        } else {
            setAdministradoraSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        setFormData((prev) => ({
            ...prev,
            administradora: suggestion.NOME,
        }));
        setAdministradoraSuggestions([]);
        setShowSuggestions(false);
        setActiveIndex(-1);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (!showSuggestions || administradoraSuggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((prevIndex) =>
                    prevIndex < administradoraSuggestions.length - 1 ? prevIndex + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : administradoraSuggestions.length - 1
                );
                break;
            case "Enter":
                if (activeIndex >= 0) {
                    e.preventDefault();
                    handleSuggestionClick(administradoraSuggestions[activeIndex]);
                } else {
                    handleSubmit(e);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;
            default:
                break;
        }
    }, [showSuggestions, administradoraSuggestions, activeIndex, handleSuggestionClick]);

    const performConsulta = async (page = 1) => {
        setLoading(true);
        setError(null);
        setResultado(null);
        setCurrentPage(page);

        let parametroConsultaObj = {};

        if (activeForm === "vida") {
            parametroConsultaObj = {
                ...(formData.cpf && { cpf_cnpj: formData.cpf.replace(/\D/g, "") }),
                ...(formData.nome && { nome_segurado: formData.nome.toUpperCase() }),
                ...(formData.posto && { posto: formData.posto.toUpperCase() }),
                ...(formData.administradora && { administradora_nome: formData.administradora.toUpperCase() }),
            };

            const vidaFields = ['cpf', 'nome', 'posto', 'administradora'];
            const isVidaFormEmpty = vidaFields.every(field => !formData[field]);
            if (isVidaFormEmpty) {
                setError("Pelo menos um dos campos (CPF, Nome, Posto ou Administradora) é obrigatório para Consulta Vida.");
                setLoading(false);
                return;
            }

        } else if (activeForm === "imoveis") {
            parametroConsultaObj = {
                ...(formData.cpf && { cpf_cnpj: formData.cpf.replace(/\D/g, "") }),
                ...(formData.cnpj && { cpf_cnpj: formData.cnpj.replace(/\D/g, "") }),
                ...(formData.nome && { nome: formData.nome.toUpperCase() }),
                ...(formData.endereco && { endereco: formData.endereco.toUpperCase() }),
                ...(formData.certificado && { certificado: formData.certificado }),
                ...(formData.administradora && { administradora_nome: formData.administradora.toUpperCase() }),
                ...(formData.fatura && { fatura: formData.fatura.replace(/\D/g, "") }),
            };

            const imoveisFields = ['cpf', 'cnpj', 'nome', 'endereco', 'certificado', 'administradora', 'fatura'];
            const isImoveisFormEmpty = imoveisFields.every(field => !formData[field]);
            if (isImoveisFormEmpty) {
                setError("Pelo menos um dos campos (CPF, CNPJ, Nome, Endereço, Certificado, fatura ou Administradora) é obrigatório para Consulta Imóveis.");
                setLoading(false);
                return;
            }
        }

        for (const key in parametroConsultaObj) {
            if (parametroConsultaObj[key] === null || parametroConsultaObj[key] === '') {
                delete parametroConsultaObj[key];
            }
        }

        const parametroConsultaJsonString = JSON.stringify(parametroConsultaObj);

        let payload = {
            tipo_consulta: activeForm === "vida" ? "vida" : "incendio",
            parametro_consulta: parametroConsultaJsonString,
            page: page,
            page_size: pageSize,
            origem: "manual",
        };

        try {
            const response = await ConsultaService.consultarSegurados(payload);
            setResultado(response.resultado_api);

            if (response.total_pages) {
                setTotalPages(response.total_pages);
                setCurrentPage(response.current_page || page);
            } else if (response.resultado_api && response.resultado_api.length > 0) {
                setTotalPages(page + 1);
            } else {
                setTotalPages(page);
            }
        } catch (err) {
            let mensagem =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Erro ao realizar a consulta.";
            setError(traduzirErroApi(mensagem));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await performConsulta(1);
    };

    const handlePageChange = (newPage) => {
        if (totalPages > 1 && newPage > 0 && newPage <= totalPages) {
            performConsulta(newPage);
        } else if (totalPages === 1 && newPage > currentPage && resultado && resultado.length === pageSize) {
            performConsulta(newPage);
        } else if (newPage < currentPage && newPage > 0) {
            performConsulta(newPage);
        }
    };

    function formatarDataBR(data) {
        if (!data || typeof data !== 'string') return data;

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;

        const match = data.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
        if (match) {
            const [_, ano, mes, dia] = match;
            return `${dia}/${mes}/${ano}`;
        }

        if (/^\d{8}$/.test(data)) {
            return `${data.substr(6, 2)}/${data.substr(4, 2)}/${data.substr(0, 4)}`;
        }
        return data;
    }

    function formataChave(texto) {
        return texto
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    function traduzirStatus(status) {
        switch (status) {
            case "R":
                return "Renovado";
            case "C":
                return "Cancelado";
            case "A":
                return "Ativo";
            default:
                return status;
        }
    }

    function formatarMoedaBR(valor) {
        if (valor == null || valor === "") return <i>não informado</i>;
        let numero = valor;
        if (typeof valor === "string") {
            numero = valor.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
        }
        numero = Number(numero);
        if (isNaN(numero)) return valor;
        return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function SeguradoItem({ segurado, idx }) {
        const uniqueId = segurado.MATRICULA || idx;
        const isExpanded = expandedIndex === uniqueId;

        const ignoreKeys = [
            "NOME_SEGURADO", "NOME", "CPF_CNPJ", "FUNCAO",
            "ADMINISTRADORA", "ADMINISTRADORA_NOME", "STATUS", "STATUS_SEG"
        ];

        const dateKeys = [
            "NASCIMENTO", "INICIO_VIG", "FINAL_VIG",
            "DT_INCLUSAO", "DT_CANCEL"
        ];

        const camposMoeda = ["PREMIO", "PREMIO_LIQ", "INC_PREDIO", "INC_CONTEUDO", "ALUGUEL"];

        return (
            <li className={`item-segurado${isExpanded ? " expanded" : ""}`}>
                <button
                    className="seg-titulo"
                    onClick={() => setExpandedIndex(isExpanded ? null : uniqueId)}
                    aria-expanded={isExpanded}
                    type="button"
                >
                    <span style={{ display: "flex", flexDirection: "column", textAlign: "start" }}>
                        <b>
                            {
                                segurado.NOME_SEGURADO ||
                                segurado.NOME ||
                                segurado.Nome ||
                                segurado.nome ||
                                segurado.nome_segurado ||
                                "Nome não informado"
                            }
                        </b>
                        {segurado.CPF_CNPJ && (
                            <span className="cpf-label">
                                CPF/CNPJ: <span className="cpf">{segurado.CPF_CNPJ}</span>
                            </span>
                        )}
                    </span>
                    <span className="icon">{isExpanded ? "▲" : "▼"}</span>
                </button>
                {isExpanded && (
                    <div className="seg-detalhes">
                        <ul>
                            {(segurado.ADMINISTRADORA || segurado.ADMINISTRADORA_NOME) && (
                                <li>
                                    <strong>Administradora:</strong>{" "}
                                    {segurado.ADMINISTRADORA_NOME || segurado.ADMINISTRADORA}
                                </li>
                            )}
                            {(segurado.STATUS || segurado.STATUS_SEG) && (
                                <li>
                                    <strong>Status:</strong>{" "}
                                    {traduzirStatus(segurado.STATUS_SEG || segurado.STATUS)}
                                </li>
                            )}
                            {Object.entries(segurado).map(([chave, valor]) => {
                                if (ignoreKeys.includes(chave)) {
                                    return null;
                                }
                                const isMoeda = camposMoeda.includes(chave);
                                return (
                                    <li key={chave}>
                                        <strong>{formataChave(chave)}:</strong>{" "}
                                        {dateKeys.includes(chave)
                                            ? formatarDataBR(valor)
                                            : isMoeda
                                                ? formatarMoedaBR(valor)
                                                : valor || <i>não informado</i>
                                        }
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </li>
        );
    }

    useEffect(() => {
        if (resultado && resultadoRef.current) {
            resultadoRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [resultado]);

    return (
        <div className="consulta-container04">
            <h1 className="consultas-title">
                <i className="bi-clipboard-data"></i> Consultas Disponíveis
            </h1>

            <div className="card-options-wrapper01">
                <div
                    className={`card card-option ${activeForm === "vida" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("vida");
                        resetFormAndState();
                    }}
                >
                    <div className="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        </svg>
                    </div>
                    <h5>Consulta Vida</h5>
                </div>

                <div
                    className={`card card-option ${activeForm === "imoveis" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("imoveis");
                        resetFormAndState();
                    }}
                >
                    <div className="icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
                            <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 8H2v6.5a.5.5 0 0 0 .5.5H6v-4h4v4h3.5a.5.5 0 0 0 .5-.5V8h.5a.5.5 0 0 0 .354-.854l-6-6z" />
                        </svg>
                    </div>
                    <h5>Consulta Imóveis</h5>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                {activeForm === "vida" && (
                    <>
                        <label htmlFor="cpf">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            id="cpf"
                            value={formData.cpf}
                            onChange={handleFormChange}
                            placeholder="Digite o CPF"
                            disabled={loading}
                            maxLength="14"
                        />

                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            name="nome"
                            id="nome"
                            value={formData.nome}
                            onChange={handleFormChange}
                            placeholder="Digite o nome"
                            disabled={loading}
                        />

                        <label htmlFor="posto">Posto</label>
                        <input
                            type="text"
                            name="posto"
                            id="posto"
                            value={formData.posto}
                            onChange={handleFormChange}
                            placeholder="Digite o posto"
                            disabled={loading}
                        />

                        <label htmlFor="administradora">Administradora</label>
                        <div
                            className="autocomplete-wrapper"
                            ref={suggestionsRef}
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-expanded={showSuggestions && administradoraSuggestions.length > 0}
                        >
                            <input
                                type="text"
                                name="administradora"
                                id="administradora"
                                value={formData.administradora}
                                onChange={handleAdmFormChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite a administradora"
                                disabled={loading}
                                onFocus={() => formData.administradora.length > 0 && setShowSuggestions(true)}
                                autoComplete="off"
                                aria-autocomplete="list"
                                aria-controls="administradora-suggestions"
                                aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
                            />
                            {showSuggestions && administradoraSuggestions.length > 0 && (
                                <ul className="suggestions-list" id="administradora-suggestions" role="listbox">
                                    {administradoraSuggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.NOME || index}
                                            id={`suggestion-item-${index}`}
                                            className={index === activeIndex ? "active" : ""}
                                            onMouseDown={() => handleSuggestionClick(suggestion)}
                                            role="option"
                                            aria-selected={index === activeIndex}
                                        >
                                            {suggestion.NOME}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                {activeForm === "imoveis" && (
                    <>
                        <label htmlFor="CPF/CNPJ">CPF / CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                            placeholder="Digite o CPF / CNPJ"
                            disabled={loading}
                        />

                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            name="nome"
                            id="nome"
                            value={formData.nome}
                            onChange={handleFormChange}
                            placeholder="Digite o nome"
                            disabled={loading}
                        />

                        <label htmlFor="endereco">Endereço</label>
                        <input
                            type="text"
                            name="endereco"
                            id="endereco"
                            value={formData.endereco}
                            onChange={handleFormChange}
                            placeholder="Digite o endereço"
                            disabled={loading}
                        />

                        <label htmlFor="certificado">Certificado</label>
                        <input
                            type="text"
                            name="certificado"
                            id="certificado"
                            value={formData.certificado}
                            onChange={handleFormChange}
                            placeholder="Digite o certificado"
                            disabled={loading}
                        />

                        <label htmlFor="fatura">Fatura</label>
                        <input
                            type="text"
                            name="fatura"
                            id="fatura"
                            value={formData.fatura}
                            onChange={handleFormChange}
                            placeholder="Digite o fatura"
                            disabled={loading}
                        />

                        <label htmlFor="administradora">Administradora</label>
                        <div
                            className="autocomplete-wrapper"
                            ref={suggestionsRef}
                            role="combobox"
                            aria-haspopup="listbox"
                            aria-expanded={showSuggestions && administradoraSuggestions.length > 0}
                        >
                            <input
                                type="text"
                                name="administradora"
                                id="administradora"
                                value={formData.administradora}
                                onChange={handleAdmFormChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite a administradora"
                                disabled={loading}
                                onFocus={() => formData.administradora.length > 0 && setShowSuggestions(true)}
                                autoComplete="off"
                                aria-autocomplete="list"
                                aria-controls="administradora-suggestions"
                                aria-activedescendant={activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined}
                            />
                            {showSuggestions && administradoraSuggestions.length > 0 && (
                                <ul className="suggestions-list" id="administradora-suggestions" role="listbox">
                                    {administradoraSuggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || suggestion.NOME || index}
                                            id={`suggestion-item-${index}`}
                                            className={index === activeIndex ? "active" : ""}
                                            onMouseDown={() => handleSuggestionClick(suggestion)}
                                            role="option"
                                            aria-selected={index === activeIndex}
                                        >
                                            {suggestion.NOME}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Consultando..." : "Consultar"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>

            {resultado && Array.isArray(resultado) && (
                <div className="card-resultado mt-4" ref={resultadoRef}>
                    <h4>Resultado da Consulta</h4>
                    <ul className="lista-segurados">
                        {resultado.map((seg, idx) => (
                            <SeguradoItem key={seg.MATRICULA || idx} segurado={seg} idx={idx} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ConsultaSegurado;

import React, { useState } from "react";
import "../styles/CotacaoConteudo.css";
import { FaHome } from "react-icons/fa";

const CotacaoConteudo = () => {
  const [incendio, setIncendio] = useState("");
  const [aluguel, setAluguel] = useState("");
  const [premio, setPremio] = useState("");
  const [repasse, setRepasse] = useState(""); // agora repasse
  const [showResultado, setShowResultado] = useState(false);

  const desformatarMoeda = (valor) => {
    return Number(valor.replace(/\D/g, "")) / 100;
  };

  const formatarMoeda = (valor) => {
    const num = Number(valor.replace(/\D/g, "")) / 100;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Para %: mantém só números, e limita a 2 dígitos decimais
  const formatarPorcentagem = (valor) => {
    let num = valor.replace(/[^0-9.,]/g, "").replace(",", ".");
    if (num === "") return "";
    num = parseFloat(num);
    if (isNaN(num)) return "";
    return num.toString().replace(".", ",") + "%";
  };

  const handleChange = (setter, type = "money") => (e) => {
    const valor = e.target.value;
    if (type === "percent") {
      setter(formatarPorcentagem(valor));
    } else {
      setter(formatarMoeda(valor));
    }
    setShowResultado(false);
  };

  // Valor monetário dos campos
  const isTotal = desformatarMoeda(incendio || "0") + desformatarMoeda(aluguel || "0");
  const premioValor = desformatarMoeda(premio || "0");
  const repassePercent = Number(repasse.replace("%", "").replace(",", ".") || 0);
  const valorRepasse = (premioValor * repassePercent) / 100;
  const valorFedcorp = premioValor - valorRepasse;

  return (
    <div className="cotacao-container">
      <div className="icone-cabecalho">
        <FaHome size={32} />
      </div>
      <h2 className="titulo-pagina">Cotação – Incêndio Conteúdo</h2>

      <div className="input-grid">
        <div className="campo">
          <label>Incêndio Conteúdo (R$)</label>
          <input
            type="text"
            value={incendio}
            onChange={handleChange(setIncendio)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo">
          <label>Perda de Aluguel (R$)</label>
          <input
            type="text"
            value={aluguel}
            onChange={handleChange(setAluguel)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo readonly">
          <label>IS Total (R$)</label>
          <input
            type="text"
            value={isTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            readOnly
          />
        </div>

        <div className="campo">
          <label>Prêmio Bruto (R$)</label>
          <input
            type="text"
            value={premio}
            onChange={handleChange(setPremio)}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="campo">
          <label>Repasse (%)</label>
          <input
            type="text"
            value={repasse}
            onChange={handleChange(setRepasse, "percent")}
            placeholder="Ex: 20%"
            maxLength={6}
          />
        </div>

        <div className="campo readonly">
          <label>Repasse Administradora</label>
          <input
            type="text"
            value={valorRepasse.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            readOnly
          />
        </div>
      </div>

      <button
        className="btn-resultado"
        style={{ marginTop: 24, padding: "10px 36px" }}
        onClick={() => setShowResultado(true)}
      >
        Gerar Resultado
      </button>

      {showResultado && (
  <div className="resultado-fedcorp-linha">
    <div className="campo readonly">
      <label>Resultado Fedcorp</label>
      <input
        type="text"
        value={valorFedcorp.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
        readOnly
      />
    </div>
    <div className="campo readonly">
      <label>Repasse Fedcorp (%)</label>
      <span className="ferramenta-em-breve">
        Em Produção
      </span>
    </div>
  </div>
)}

    </div>
  );
};

export default CotacaoConteudo;

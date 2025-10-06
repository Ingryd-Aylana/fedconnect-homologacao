import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import "../styles/CotacaoConteudo.css";
import cotacaoService from "../../services/cotacaoService";

const CotacaoConteudo = () => {
  const [tipoImovel, setTipoImovel] = useState("residencial");
  const [assistencia, setAssistencia] = useState("basica");

  const [incendio, setIncendio] = useState("");
  const [aluguel, setAluguel] = useState("");
  const [premioProposto, setPremioProposto] = useState("");
  const [repasse, setRepasse] = useState("");

  const [premioLiquido, setPremioLiquido] = useState(0);
  const [comissaoAdministradora, setComissaoAdministradora] = useState(0);
  const [assistenciaBasica, setAssistenciaBasica] = useState(0);
  const [premioLiquidoSeguradora, setPremioLiquidoSeguradora] = useState(0);
  const [premioBrutoSeguradora, setPremioBrutoSeguradora] = useState(0);
  const [repasseSeguradoraBruto, setRepasseSeguradoraBruto] = useState(0);
  const [imposto, setImposto] = useState(0);
  const [repasseLiquido, setRepasseLiquido] = useState(0);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [resultado, setResultado] = useState(0);
  const [percentual, setPercentual] = useState(0);
  const [showResultado, setShowResultado] = useState(false);

  const desformatarMoeda = (valor) => Number(String(valor).replace(/\D/g, "")) / 100;

  const formatarMoeda = (valor) => {
    const num = Number(String(valor).replace(/\D/g, "")) / 100;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatarPorcentagem = (valor) => {
    let num = String(valor).replace(/[^0-9.,]/g, "").replace(",", ".");
    if (num === "") return "";
    num = parseFloat(num);
    if (isNaN(num)) return "";
    return num.toString().replace(".", ",") + "%";
  };

  const formatarValorParaMoeda = (valor) => {
    if (typeof valor !== "number") return "R$ 0,00";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarValorParaPorcentagem = (valor) => {
    if (typeof valor !== "number") return "0%";
    return `${Number(valor).toFixed(2).replace(".", ",")}%`;
  };

  const handleChange =
    (setter, type = "money") =>
      (e) => {
        const valor = e.target.value;
        if (type === "percent") setter(formatarPorcentagem(valor));
        else setter(formatarMoeda(valor));
        setShowResultado(false);
      };

  const handleGerarResultado = async () => {
    const dadosParaEnvio = {
      tipo_imovel: tipoImovel,
      assistencia_tipo: assistencia,
      incendio_conteudo: desformatarMoeda(incendio),
      perda_aluguel: desformatarMoeda(aluguel),
      premio_proposto: desformatarMoeda(premioProposto),
      repasse_percentual: Number(
        String(repasse).replace("%", "").replace(",", ".") || 0
      ),
    };

    try {
      const response = await cotacaoService.cotacaoIncendio(dadosParaEnvio);
      console.log("Resposta da API:", response);

      setPremioLiquido(response.premio_liquido);
      setComissaoAdministradora(response.comissao_administradora);
      setAssistenciaBasica(response.assistencia_basica);
      setPremioLiquidoSeguradora(response.premio_liquido_seguradora);
      setPremioBrutoSeguradora(response.premio_bruto_seguradora);
      setRepasseSeguradoraBruto(response.repasse_seguradora_bruto);
      setImposto(response.imposto);
      setRepasseLiquido(response.repasse_liquido);
      setEntradas(response.entradas);
      setSaidas(response.saidas);
      setResultado(response.resultado);
      setPercentual(response.percentual);

      setShowResultado(true);
    } catch (error) {
      console.error("Erro ao calcular a cotação:", error);
      alert("Ocorreu um erro ao gerar o resultado. Verifique os dados e tente novamente.");
    }
  };

  const isTotal = desformatarMoeda(incendio) + desformatarMoeda(aluguel);
  const repasseAdministradora =
    desformatarMoeda(premioProposto) *
    (Number(String(repasse).replace("%", "").replace(",", ".")) / 100);

  const labelAssistencia =
    assistencia === "faz_tudo_lar" ? "Assistência Faz Tudo Lar (R$)" : "Assistência Básica (R$)";

  return (
    <div className="cotacao-container">
      <div className="icone-cabecalho">
        <FaHome size={32} />
      </div>
      <h2 className="titulo-pagina">Estudo – Incêndio Conteúdo</h2>

      {/* Flags lado a lado */}
      <div className="flags-grid">
        <div className="campo">
          <label>Tipo do Imóvel</label>
          <div className="opcoes-tipo">
            <label>
              <input
                type="radio"
                name="tipoImovel"
                value="residencial"
                checked={tipoImovel === "residencial"}
                onChange={() => { setTipoImovel("residencial"); setShowResultado(false); }}
              />
              Residencial
            </label>
            <label>
              <input
                type="radio"
                name="tipoImovel"
                value="comercial"
                checked={tipoImovel === "comercial"}
                onChange={() => { setTipoImovel("comercial"); setShowResultado(false); }}
              />
              Comercial
            </label>
          </div>
        </div>

        <div className="campo">
          <label>Assistência</label>
          <div className="opcoes-tipo">
            <label>
              <input
                type="radio"
                name="assistencia"
                value="basica"
                checked={assistencia === "basica"}
                onChange={() => { setAssistencia("basica"); setShowResultado(false); }}
              />
              Básica
            </label>
            <label>
              <input
                type="radio"
                name="assistencia"
                value="faz_tudo_lar"
                checked={assistencia === "faz_tudo_lar"}
                onChange={() => { setAssistencia("faz_tudo_lar"); setShowResultado(false); }}
              />
              Faz Tudo Lar
            </label>
          </div>
        </div>
      </div>


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
          <input type="text" value={formatarValorParaMoeda(isTotal)} readOnly />
        </div>

        <div className="campo">
          <label>Prêmio Proposto (R$)</label>
          <input
            type="text"
            value={premioProposto}
            onChange={handleChange(setPremioProposto)}
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
          <label>Repasse Administradora (R$)</label>
          <input
            type="text"
            value={formatarValorParaMoeda(repasseAdministradora)}
            readOnly
          />
        </div>
      </div>

      <button
        className="btn-resultado"
        style={{ marginTop: 24, padding: "10px 36px" }}
        onClick={handleGerarResultado}
      >
        Gerar Resultado
      </button>

      {showResultado && (
        <div className="resultados-container">
          <div className="linha-resultado">
            <div className="campo readonly">
              <label>Prêmio Líquido (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(premioLiquido)}
                readOnly
              />
            </div>
            <div className="campo readonly">
              <label>Comissão Administradora (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(comissaoAdministradora)}
                readOnly
              />
            </div>
          </div>

          <div className="linha-resultado">
            <div className="campo readonly">
              <label>{labelAssistencia}</label>
              <input
                type="text"
                value={formatarValorParaMoeda(assistenciaBasica)}
                readOnly
              />
            </div>
            <div className="campo readonly">
              <label>Prêmio Líquido Seguradora (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(premioLiquidoSeguradora)}
                readOnly
              />
            </div>
          </div>

          <div className="linha-resultado">
            <div className="campo readonly">
              <label>Prêmio Bruto Seguradora (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(premioBrutoSeguradora)}
                readOnly
              />
            </div>
            <div className="campo readonly">
              <label>Repasse Seguradora Bruto (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(repasseSeguradoraBruto)}
                readOnly
              />
            </div>
          </div>

          <div className="linha-resultado">
            <div className="campo readonly">
              <label>Repasse Líquido (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(repasseLiquido)}
                readOnly
              />
            </div>
            <div className="campo readonly">
              <label>Entradas (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(entradas)}
                readOnly
              />
            </div>
          </div>

          <div className="linha-resultado">
            <div className="campo readonly">
              <label>Saídas (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(saidas)}
                readOnly
              />
            </div>
            <div className="campo readonly">
              <label>Resultado (R$)</label>
              <input
                type="text"
                value={formatarValorParaMoeda(resultado)}
                readOnly
              />
            </div>
          </div>

          <div className="resultado-final-linha">
            <div className="campo readonly">
              <label>Resultado Final (%)</label>
              <input
                type="text"
                value={formatarValorParaPorcentagem(percentual)}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotacaoConteudo;

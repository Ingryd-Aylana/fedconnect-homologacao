import React, { useState, useRef, useEffect } from "react";
import "../styles/ComercialRegiao.css";
import * as XLSX from "xlsx";

const mockResults = [
  {
    nome: "Administradora A",
    tipo: "Administradora de Condomínios",
    endereco: "Rua das Palmeiras, 123 - Centro, Rio de Janeiro - RJ",
    telefone: "(21) 99999-0001",
  },
  {
    nome: "Imobiliária B",
    tipo: "Imobiliária",
    endereco: "Rua da Quitanda, 23 -  Centro, Rio de Janeiro - RJ",
    telefone: " (21) 3333-1234",
  },
  {
    nome: "Administradora C",
    tipo: "Administradora de Condomínios",
    endereco: "Av. Rio Branco, 109 -  Centro, Rio de Janeiro - RJ",
    telefone: "(21) 4002-8922",
  }
];

const ComercialRegiao = () => {
  const [form, setForm] = useState({
    uf: "",
    cidade: "",
    bairro: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const resultadosRef = useRef(null);

  useEffect(() => {
    if (resultados.length > 0 && resultadosRef.current) {
      setTimeout(() => {
        resultadosRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 180);
    }
  }, [resultados]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    setResultados([]);
    setHasSearched(true);

    if (!form.uf || !form.cidade) {
      setErro("UF e Cidade são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      setTimeout(() => {
        setResultados(mockResults);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setErro("Erro ao buscar empresas. Tente novamente.");
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    if (!resultados.length) return;

    const data = resultados.map(item => ({
      Nome: item.nome,
      Tipo: item.tipo,
      Endereço: item.endereco,
      Telefone: item.telefone,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "empresas-regiao.xlsx");
  };

  return (
    <div className="comercial-regiao-container">
      <h2 className="comercial-title">
        <i className="bi bi-geo-alt-fill"></i>
        Buscar por Região
      </h2>
      <form className="regiao-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>UF *</label>
          <input name="uf" value={form.uf} onChange={handleChange} maxLength={2} required />
        </div>
        <div className="form-row">
          <label>Cidade *</label>
          <input name="cidade" value={form.cidade} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label>Bairro</label>
          <input name="bairro" value={form.bairro} onChange={handleChange} />
        </div>
        <button type="submit" className="consulta-btn" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
        {erro && <p className="error-message">{erro}</p>}
      </form>

      <div className="resultados-regiao" ref={resultadosRef}>
        {resultados.length > 0 && (
          <>
            <h3 className="result-title">Empresas encontradas:</h3>
            <ul className="regiao-list">
              {resultados.map((item, i) => (
                <li key={i} className="regiao-card-mock">
                  <div className="mock-title-row">
                    <span className="mock-icon">{item.tipo === "Imobiliária" ? "🏠" : "🏢"}</span>
                    <strong className="mock-title">{item.nome}</strong>
                  </div>
                  <div className="mock-endereco">{item.endereco}</div>
                  <div className="mock-telefone-site">
                    <a href={`tel:${item.telefone.replace(/\D/g, "")}`} className="mock-phone">
                      📞 {item.telefone}
                    </a>
                  </div>
                  <div className="mock-tipo">{item.tipo}</div>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button className="btn-exportar-excel" onClick={exportarExcel}>Exportar para Excel</button>
            </div>
          </>
        )}
        {!loading && hasSearched && resultados.length === 0 && (
          <p className="no-results-message">Nenhum resultado para os filtros informados.</p>
        )}
      </div>
    </div>
  );
};

export default ComercialRegiao;

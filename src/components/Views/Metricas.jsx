import React from "react";
import "../styles/Ferramentas.css";

const ferramentas = [
  {
    nome: "Dashboard Peaga",
    url: "",
    descricao: "Acompanhe as métricas da organização de forma única.",
    logo: "/imagens/Logo-Peaga.jpg",
  },
  {
    nome: "Dashboard FedCorp Adm",
    url: "",
    descricao: "Acompanhe as métricas da organização de forma única.",
    logo: "/imagens/LOGO.png",
  },
  {
    nome: "Dashboard Condomed",
    url: "",
    descricao: "Acompanhe as métricas da organização de forma única.",
    logo: "/imagens/logo-Condomed.png",
  },
];

const Metricas = () => (
  <div className="ferramentas-container">
    <h1 className="ferramentas-title">
      <i className="bi bi-bar-chart-fill"></i>
      Métricas da FedCorp
    </h1>
    <p className="ferramentas-desc">
      Acesse rapidamente as principais métricas e resultados do Grupo FedCorp. Escolha uma opção abaixo:
    </p>
    <div className="ferramentas-grid">
      {ferramentas.map((ferramenta, idx) => (
        <div className="ferramenta-card" key={idx}>
          {ferramenta.logo && (
            <img
              src={ferramenta.logo}
              alt={ferramenta.nome}
              className="ferramenta-logo"
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
                marginBottom: 12,
                borderRadius: "1.1rem",
                display: "block",
                background: "#f8fafc",
                marginLeft: "auto",
                marginRight: "auto",
                boxShadow: "0 1px 8px rgba(24,88,214,0.09)"
              }}
            />
          )}
          <div className="ferramenta-nome">
            <i className="bi bi-link-45deg"></i> {ferramenta.nome}
          </div>
          <div className="ferramenta-desc">{ferramenta.descricao}</div>
          {ferramenta.url ? (
            <a
              href={ferramenta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ferramenta-btn"
            >
              Acessar
            </a>
          ) : (
            <span className="ferramenta-em-breve">Em Produção</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default Metricas;

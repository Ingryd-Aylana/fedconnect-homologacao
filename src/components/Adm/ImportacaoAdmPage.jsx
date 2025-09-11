import React from "react";
import "../styles/AdminHome.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminHome = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const currentUserType = user?.nivel_acesso;

  if (loading) {
    return (
      <div className="home-container02">
        <p>Carregando informações do usuário...</p>
      </div>
    );
  }

  if (!isAuthenticated || (currentUserType !== "admin" && currentUserType !== "master")) {
    return (
      <div className="home-container02">
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="home-container02">
      <main>
        <div className="container">
          <div className="cards-container">

            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h2>Total Corporativo Vida</h2>
                <p>
                  Importe os dados de apólices de seguros de vida e segurados vinculados.
                </p>
                <Link to="/upload" className="btn-primary">
                  Importar em massa
                </Link>
                <Link to="/importacao-vida" className="btn-primary">
                  Importar individual
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-file-earmark-text-fill"></i>
                </div>
                <h2>Total Conteúdo</h2>
                <p>
                  Importe os dados referentes aos bens assegurados dentro de imóveis.
                </p>
                <Link to="/upload" className="btn-primary">
                  Importar em massa
                </Link>

                <button className="btn-primary" onClick={() => alert("Importar Conteúdo")}>
                  Importar individual
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <h2>Garantia Cota</h2>
                <p>
                  Importe garantias financeiras com base em cotas de consórcio ou valores agregados.
                </p>
                <Link to="/upload" className="btn-primary">
                  Importar em massa
                </Link>

                <button className="btn-primary" onClick={() => alert("Importar Garantia Cota")}>
                  Importar individual
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-house-door-fill"></i>
                </div>
                <h2>Alug</h2>
                <p>
                  Importe informações relacionadas a seguros de locação e alug.
                </p>
                <Link to="/upload" className="btn-primary">
                  Importar em massa
                </Link>
                <Link to="/importacao-alug" className="btn-primary">
                  Importar individual
                </Link>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i className="bi bi-credit-card-2-front-fill"></i>
                </div>
                <h2>Vale Refeição</h2>
                <p>
                  Importe as bases de dados de colaboradores para geração de benefícios VR/VA.
                </p>
                <Link to="/upload" className="btn-primary">
                  Importar em massa
                </Link>
                <button className="btn-primary" onClick={() => alert("Importar VR")}>
                  Importar individual
                </button>
              </div>
            </div>
  
            <div className="card">
              <div className="card-body">
                <div className="feature-icon">
                  <i class="bi bi-card-checklist"></i>
                </div>
                <h2>Manual da API</h2>
                <p>
                  Importe as bases de dados de colaboradores para geração de benefícios VR/VA.
                </p>
                <button className="btn-primary" onClick={() => alert("Importar VR")}>
                  Baixar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;

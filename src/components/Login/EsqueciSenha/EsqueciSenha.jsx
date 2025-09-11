import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/EsqueciSenha.css";

const EsqueciSenha = () => {
  const navigate = useNavigate();

  const handleVoltarLogin = () => {
    navigate("/login"); 
  };
  
  return (
    <div className="gradient-bg">
    <div className="esqueci-wrapper">
      <div className="esqueci-card">
        <img
          src="../public/imagens/logo.png"
          alt="Logo FedCorp"
          className="esqueci-logo"
        />
        <h2 className="esqueci-titulo">Entre em contato com suporte!</h2>
        <p className="esqueci-texto">
          Para solicitar a sua senha entre em contato com a manutenção do sistema.
        </p>
        <button className="senha-btn" onClick={handleVoltarLogin}>
          Lembrei minha senha
        </button>
      </div>
    </div>
    </div>
  );
};

export default EsqueciSenha;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../styles/EsqueciSenha.css";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVoltarLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!email) {
      setErro("Preencha o campo de e-mail.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/solicitar-reset-senha/", { email });
      setMensagem(
        "Se o e-mail estiver cadastrado, você receberá uma mensagem para redefinir sua senha."
      );
      setEmail("");
    } catch (err) {
      setErro(
        err.response?.data?.detail ||
          "Não foi possível enviar o e-mail de redefinição. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esqueci-gradient-bg">
      <div className="esqueci-wrapper">
        <div className="esqueci-card">
          <img
            src="public/imagens/logo.png"
            alt="Logo FedCorp"
            className="esqueci-logo"
          />
          <h2 className="esqueci-titulo">Esqueceu sua senha?</h2>
          <p className="esqueci-texto">
            Digite seu e-mail cadastrado abaixo e enviaremos um link para redefinir sua senha.
          </p>
          <form className="esqueci-form" onSubmit={handleSubmit}>
            <div className="esqueci-input-group">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                id="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            {erro && <p className="esqueci-error-message">{erro}</p>}
            {mensagem && <p className="esqueci-success-message">{mensagem}</p>}
            <button
              type="submit"
              className="esqueci-senha-btn"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar e-mail"}
            </button>
          </form>
          <button
            className="esqueci-voltar-btn"
            type="button"
            onClick={handleVoltarLogin}
          >
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../styles/EsqueciSenha.css"; 

const RedefinirSenha = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!token) {
      setErro("Token inválido ou ausente. Utilize o link do e-mail.");
      return;
    }
    if (!novaSenha || !confirmaSenha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/redefinir-senha/", {
        token,
        nova_senha: novaSenha,
      });
      setMensagem("Senha redefinida com sucesso! Faça login com a nova senha.");
      setNovaSenha("");
      setConfirmaSenha("");
    } catch (err) {
      setErro(
        err.response?.data?.detail ||
          "Não foi possível redefinir a senha. Tente novamente ou solicite um novo link."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarLogin = () => {
    navigate("/login");
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
          <h2 className="esqueci-titulo">Redefinir senha</h2>
          <p className="esqueci-texto">
            Escolha uma nova senha para sua conta.
          </p>
          <form className="esqueci-form" onSubmit={handleSubmit}>
            <div className="esqueci-input-group">
              <label htmlFor="novaSenha">Nova senha:</label>
              <input
                type="password"
                id="novaSenha"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>
            <div className="esqueci-input-group">
              <label htmlFor="confirmaSenha">Confirmar nova senha:</label>
              <input
                type="password"
                id="confirmaSenha"
                placeholder="Confirme a nova senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                required
              />
            </div>
            {erro && <p className="esqueci-error-message">{erro}</p>}
            {mensagem && <p className="esqueci-success-message">{mensagem}</p>}
            <button
              type="submit"
              className="esqueci-senha-btn"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Redefinir senha"}
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

export default RedefinirSenha;

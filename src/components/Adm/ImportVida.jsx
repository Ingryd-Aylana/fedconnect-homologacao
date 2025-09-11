import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ImportVida.css";
import { useAuth } from "../../context/AuthContext";

export default function ImportacaoVida() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const nivel = user?.nivel_acesso;

  const [form, setForm] = useState({
    administradora: "",
    codigoPosto: "",
    posto: "",
    matricula: "",
    segurado: "",
    nascimento: "",
    documento: "",
    sexo: "",
    produto: "",
    inicioVig: "",
    finalVig: "",
    apolice: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    for (let key in form) {
      if (!form[key]) {
        setError("Preencha todos os campos.");
        return;
      }
    }

    try {
      console.log("Dados enviados:", form);
      setSuccess(true);
    } catch (err) {
      setError("Erro ao enviar dados. Tente novamente.");
    }
  };

  return (
    <section className="import-vida-container">
      <h1>Importação Individual - Vida</h1>
      <form className="import-vida-form" onSubmit={handleSubmit}>
       
        <div className="form-row">
          <label>Posto</label>
          <input
            type="text"
            name="posto"
            value={form.posto}
            onChange={handleChange}
             placeholder="Digite o nome do posto"
          />
        </div>

        <div className="form-row">
          <label>Matrícula</label>
          <input
            type="text"
            name="matricula"
            value={form.matricula}
            onChange={handleChange}
            placeholder="Digite a matrícula para o segurado"
          />
        </div>

        <div className="form-row">
          <label>Segurado</label>
          <input
            type="text"
            name="segurado"
            value={form.segurado}
            onChange={handleChange}
            placeholder="Digite o nome do segurado"
          />
        </div>

        
        <div className="form-row">
          <label>Data de Nascimento</label>
          <input
            type="date"
            name="dataNascimento"
            value={form.nascimento}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Documento</label>
          <input
            type="number"
            name="documento"
            value={form.documento}
            onChange={handleChange}
            placeholder="Digite o CPF do segurado"
          />
        </div>
       
        <div className="form-row">
          <label>Sexo</label>
          <input
            type="text"
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            placeholder="Digite o sexo do segurado"
          />
        </div>
        <div className="form-row">
          <label>Produto</label>
          <input
            type="text"
            name="produto"
            value={form.produto}
            onChange={handleChange}
            placeholder="Digite o produto para ser importado"
          />
        </div>

        <div className="form-row full-width">
          <button type="submit" className="btn-enviar">Enviar</button>
        </div>
        {error && <p className="error-alert">{error}</p>}
        {success && <p className="success-alert">Dados importados com sucesso!</p>}
      </form>
    </section>
  );
}

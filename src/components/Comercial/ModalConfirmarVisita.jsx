import React, { useState } from "react";
import "../styles/DashboardComercial.css";

export default function ModalConfirmarVisita({ visita, onClose, onConfirm }) {
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({ comentario, resultado });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-confirmar">
        <h3>Confirmar Visita - {visita.empresa}</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Resultado:</label>
            <select value={resultado} onChange={e => setResultado(e.target.value)} required>
              <option value="">Selecione</option>
              <option value="proposta">Proposta enviada</option>
              <option value="negociacao">Em negociação</option>
              <option value="sem-interesse">Sem interesse</option>
            </select>
          </div>
          <div>
            <label>Comentários:</label>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={3}
              placeholder="Detalhe o que aconteceu na visita..."
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button type="submit">Confirmar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

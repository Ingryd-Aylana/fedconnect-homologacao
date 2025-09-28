import React, { useState } from "react";
import "../styles/DashboardComercial.css";

export default function ModalConfirmarVisita({ visita, onClose, onConfirm, onCancelar }) {
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({ comentario, resultado });
  }

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-fedconnect" autoComplete="off">
        <button className="modal-close" onClick={onClose} title="Fechar modal" type="button">×</button>
        <h2>Confirmar Visita</h2>
        <div className="modal-subtitulo">{visita.empresa}</div>
        <label htmlFor="resultado-visita">Resultado:</label>
        <select
          id="resultado-visita"
          value={resultado}
          onChange={e => setResultado(e.target.value)}
          required
        >
          <option value="">Selecione</option>
          <option value="proposta">Proposta enviada</option>
          <option value="negociacao">Em negociação</option>
          <option value="sem-interesse">Sem interesse</option>
        </select>
        <label htmlFor="comentario-visita">Comentários:</label>
        <textarea
          id="comentario-visita"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Detalhe o que aconteceu na visita..."
        />
        <div className="modal-actions">
          <button type="submit" className="btn-primary">Confirmar</button>
          <button type="button" className="btn-secondary" onClick={onClose}>Fechar</button>
          
        </div>
      </form>
    </div>
  );
}

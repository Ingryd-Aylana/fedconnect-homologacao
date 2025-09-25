import React, { useState } from "react";
import "../styles/DashboardComercial.css";

export default function ModalConfirmarVisita({ visita, onClose, onConfirm, onCancelar }) {
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({ comentario, resultado });
  }

  function handleCancelarVisita(e) {
    e.preventDefault();
    if (window.confirm("Tem certeza que deseja cancelar esta visita?")) {
      onCancelar();
    }
  }

  return (
    <div className="modal-overlay">
      
        <button className="modal-close" onClick={onClose} title="Fechar modal">×</button>
        
        <form onSubmit={handleSubmit} className="modal-content">
          <h2>Confirmar Visita</h2>
        <div className="modal-subtitulo">{visita.empresa}</div>
          <label>Resultado:</label>
          <select value={resultado} onChange={e => setResultado(e.target.value)} required>
            <option value="">Selecione</option>
            <option value="proposta">Proposta enviada</option>
            <option value="negociacao">Em negociação</option>
            <option value="sem-interesse">Sem interesse</option>
          </select>
          <label>Comentários:</label>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={3}
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

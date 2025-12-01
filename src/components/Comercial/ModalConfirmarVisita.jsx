import React, { useState, useRef } from "react";
import "../styles/AgendaComercial.css";

export default function ModalConfirmarVisita({ visita, onClose, onConfirm, onCancelar }) {
  const [comentario, setComentario] = useState("");
  const [resultado, setResultado] = useState("");
  const [erroComentario, setErroComentario] = useState("");
  const comentarioRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const comentarioTrim = (comentario || "").trim();

    if (!comentarioTrim) {
      setErroComentario("Informe um comentário sobre a visita.");
            comentarioRef.current?.focus();
      return;
    }

    setErroComentario("");
    onConfirm({ comentario: comentarioTrim, resultado });
  }

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-fedconnect" autoComplete="off" noValidate>
        <button className="modal-close" onClick={onClose} title="Fechar modal" type="button">×</button>

        <h2>Confirmar Visita</h2>
        <div className="modal-subtitulo">{visita?.empresa}</div>

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

        <label htmlFor="comentario-visita">Comentários <span style={{color:"#dc2626"}}>*</span></label>
        <textarea
          id="comentario-visita"
          ref={comentarioRef}
          value={comentario}
          onChange={e => {
            setComentario(e.target.value);
            if (erroComentario) setErroComentario("");
          }}
          placeholder="Detalhe o que aconteceu na visita..."
          required
          aria-invalid={!!erroComentario}
          aria-describedby={erroComentario ? "erro-comentario" : undefined}
        />

        {erroComentario && (
          <div id="erro-comentario" className="field-error">
            {erroComentario}
          </div>
        )}

        <div className="modal-actions">
          <button type="submit" className="btn-primary">Confirmar</button>
          <button type="button" className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </form>
    </div>
  );
}

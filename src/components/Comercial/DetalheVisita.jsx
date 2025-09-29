import React from "react";

// Função para formatar data ISO em DD/MM/AAAA
function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DetalheVisita({ visita, onClose }) {
  if (!visita) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detalhe-visita" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalhes da Reunião</h3>
          <button className="icon-btn" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div><strong>Empresa:</strong> {visita.empresa}</div>
          <div><strong>Data:</strong> {formatDateBR(visita.data)}</div>
          <div><strong>Status:</strong> {visita.status}</div>
          <div><strong>Responsável:</strong> {visita.responsavel?.nome_completo || visita.responsavel?.username || "-"}</div>
          {visita.hora && <div><strong>Hora:</strong> {visita.hora}</div>}
          {visita.obs && <div><strong>Observação:</strong> {visita.obs}</div>}
          {visita.motivo_cancelamento && (
            <div style={{ color: "#e53939", marginTop: 8 }}>
              <strong>Motivo do Cancelamento:</strong> {visita.motivo_cancelamento}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import "../styles/DashboardComercial.css";

const statusLabels = {
  agendado: "Agendadas",
  realizada: "Realizadas",
  cancelada: "Canceladas"
};

// Função para formatar data ISO (AAAA-MM-DD) para DD/MM/AAAA
function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function KanbanVisitas({ visitas, onConfirmar, onStatusChange, onCardClick }) {
  const statusValues = ["agendado", "realizada", "cancelada"];

  return (
    <div className="kanban-visitas">
      {statusValues.map(status => (
        <div key={status} className="kanban-col">
          <h4>{statusLabels[status]}</h4>
          {visitas.filter(v => v.status === status).map(v => (
            <div
              key={v.id}
              className="kanban-card"
              style={{ cursor: "pointer" }}
              onClick={() => onCardClick && onCardClick(v)}
            >
              <div><b>{v.empresa}</b></div>
              <div>Data: {formatDateBR(v.data)}</div>
              {v.hora && <div>Hora: {v.hora.substring(0, 5)}</div>}
              <div>
                Responsável: {v.responsavel ? v.responsavel.nome_completo : "N/A"}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

import React from "react";
import "../styles/DashboardComercial.css";

const statusLabels = {
  agendado: "Agendadas",
  realizada: "Realizadas",
  cancelada: "Canceladas"
};

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function KanbanVisitas({ visitas, onConfirmar, onStatusChange, onCardClick }) {
  const statusValues = ["agendado", "realizada", "cancelada"];

  return (
    <div className="kanban-visitas">
      {statusValues.map(status => {
        const statusVisitas = visitas.filter(v => v.status === status);

        return (
          <div key={status} className="kanban-col">
            <div className="kanban-col-header">
              <h4>
                {statusLabels[status]}
              </h4>
            </div>

            <div className="kanban-col-body">
              {statusVisitas.map(v => (
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

              {statusVisitas.length === 0 && (
                <div className="empty-col">Nenhuma visita neste status.</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
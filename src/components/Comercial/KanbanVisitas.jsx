import React from "react";
import "../styles/DashboardComercial.css";

const statusLabels = {
  agendada: "Agendadas",
  realizada: "Realizadas",
  cancelada: "Canceladas"
};

export default function KanbanVisitas({ visitas, onConfirmar, onStatusChange }) {
  return (
    <div className="kanban-visitas">
      {["agendada", "realizada", "cancelada"].map(status => (
        <div key={status} className="kanban-col">
          <h4>{statusLabels[status]}</h4>
          {visitas.filter(v => v.status === status).map(v => (
            <div key={v.id} className="kanban-card">
              <div><b>{v.empresa}</b></div>
              <div>Data: {v.data}</div>
              <div>Responsável: {v.responsavel}</div>
              {status === "agendada" && (
                <button onClick={() => onConfirmar(v)}>Confirmar Visita</button>
              )}
              {status === "agendada" && (
                <button onClick={() => onStatusChange(v.id, "cancelada")}>Cancelar</button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

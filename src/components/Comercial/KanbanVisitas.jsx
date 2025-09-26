import React from "react";
import "../styles/DashboardComercial.css";

const statusLabels = {
  agendado: "Agendadas",
  realizada: "Realizadas",
  cancelada: "Canceladas"
};

export default function KanbanVisitas({ visitas, onConfirmar, onStatusChange }) {
  const statusValues = ["agendado", "realizada", "cancelada"];

  return (
    <div className="kanban-visitas">
      {statusValues.map(status => (
        <div key={status} className="kanban-col">
          <h4>{statusLabels[status]}</h4>
          {visitas.filter(v => v.status === status).map(v => (
            <div key={v.id} className="kanban-card">
              <div><b>{v.empresa}</b></div>
              <div>Data: {v.data}</div>
              {/* Adicionado o campo de hora */}
              {v.hora && <div>Hora: {v.hora.substring(0, 5)}</div>}
              {/* Ajuste para pegar o nome completo do objeto responsavel */}
              <div>
                Responsável: {v.responsavel ? v.responsavel.nome_completo : "N/A"}
              </div>
              {status === "agendado" && (
                <button onClick={() => onConfirmar(v)}>Confirmar Visita</button>
              )}
              {status === "agendado" && (
                <button onClick={() => onStatusChange(v.id, "cancelada")}>
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
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
      {statusValues.map(status => {
        const statusVisitas = visitas.filter(v => v.status === status);

        return (
          <div key={status} className="kanban-col">
            {/* 1. Cabeçalho Fixo (usa a classe kanban-col-header) */}
            <div className="kanban-col-header">
              <h4>
                {statusLabels[status]}
              </h4>
            </div>

            {/* 2. Corpo Rolável (USA A CLASSE CRUCIAL: kanban-col-body) */}
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

              {/* Adicionado o empty-col para o caso de coluna vazia (opcional) */}
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
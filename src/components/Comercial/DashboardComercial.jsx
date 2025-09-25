import React, { useState } from "react";
import KanbanVisitas from "./KanbanVisitas";
import GraficoVisitas from "./GraficoVisitas";
import ModalConfirmarVisita from "./ModalConfirmarVisita";
import "../styles/DashboardComercial.css";

export default function DashboardComercial() {
  const [visitas, setVisitas] = useState([
    // Exemplo de visitas (substituir por API)
    { id: 1, empresa: "Acme Ltda", data: "2025-09-20", status: "agendada", responsavel: "João" },
    { id: 2, empresa: "BigCorp", data: "2025-09-19", status: "realizada", responsavel: "Ana" }
  ]);
  const [modal, setModal] = useState(null);

  function atualizarStatus(id, novoStatus) {
    setVisitas(visitas =>
      visitas.map(v => v.id === id ? { ...v, status: novoStatus } : v)
    );
  }

  function abrirModalConfirmacao(visita) {
    setModal(visita);
  }

  function confirmarVisita(id, dados) {
    // Aqui atualizaria no backend e no state local
    atualizarStatus(id, "realizada");
    setModal(null);
  }

  return (
    <div className="fedconnect-dashboard">
      <div className="dashboard-topo">
      
        <h2>Dashboard Comercial</h2>
      </div>

      {/* Linha: gráfico à esquerda + agenda à direita */}
      <div className="dashboard-top-linha">
        <div className="dashboard-grafico-box">
          <GraficoVisitas visitas={visitas} />
        </div>
        
      </div>

      {/* Kanban abaixo */}
      <KanbanVisitas visitas={visitas} onConfirmar={abrirModalConfirmacao} onStatusChange={atualizarStatus} />
    </div>
  );
}
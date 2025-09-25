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
    setVisitas(vs => vs.map(v => (v.id === id ? { ...v, status: novoStatus } : v)));
  }

  function abrirModalConfirmacao(visita) {
    setModal(visita);
  }

  function confirmarVisita(dados) {
    // Exemplo: confirma e move para "realizada"
    if (!modal) return;
    atualizarStatus(modal.id, "realizada");
    setModal(null);
  }

  function cancelarVisita() {
    if (!modal) return;
    atualizarStatus(modal.id, "cancelada");
    setModal(null);
  }

  return (
  <div className="fedconnect-dashboard">
  <div className="dashboard-topo">
    <h2>Dashboard Comercial</h2>
  </div>

 <section className="dashboard-graph-container">
  <div className="graph-wrapper">
    <GraficoVisitas visitas={visitas} />
  </div>
  <button className="btn-exportar-relatorio">
    Exportar Relatório
  </button>
</section>

  <KanbanVisitas
    visitas={visitas}
    onConfirmar={abrirModalConfirmacao}
    onStatusChange={atualizarStatus}
  />

  {modal && (
    <ModalConfirmarVisita
      visita={modal}
      onClose={() => setModal(null)}
      onConfirm={confirmarVisita}
      onCancelar={cancelarVisita}
    />
  )}
</div>

  );
}

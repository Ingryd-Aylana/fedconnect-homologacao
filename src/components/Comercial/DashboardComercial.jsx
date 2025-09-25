import React, { useState } from "react";
import KanbanVisitas from "./KanbanVisitas";
import GraficoVisitas from "./GraficoVisitas";
import ModalConfirmarVisita from "./ModalConfirmarVisita";
import "../styles/DashboardComercial.css";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DashboardComercial() {

function exportarRelatorioExcel() {
  
  const dadosParaExportar = visitas.map(v => ({
    Empresa: v.empresa,
    Data: v.data,
    Status: v.status,
    Responsável: v.responsavel,
    
  }));

  const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Visitas");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, "Relatorio_Visitas.xlsx");
}

  const [visitas, setVisitas] = useState([
    
    { id: 1, empresa: "Acme Ltda", data: "20/09/2025", status: "agendada", responsavel: "João" },
    { id: 2, empresa: "BigCorp", data: "19/09/2025", status: "realizada", responsavel: "Ana" }
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
  <button className="btn-exportar-relatorio" onClick={exportarRelatorioExcel}>
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

import React, { useEffect, useState } from "react";
import KanbanVisitas from "./KanbanVisitas";
import GraficoVisitas from "./GraficoVisitas";
import DetalheVisita from "./DetalheVisita"; // <- Importa o modal de detalhes
import { AgendaComercialService } from "../../services/agenda_comercial";
import "../styles/DashboardComercial.css";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DashboardComercial() {
  const [visitas, setVisitas] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [visitaDetalhe, setVisitaDetalhe] = useState(null); // <- Novo: controla modal de detalhes

  async function fetchVisitas() {
    try {
      setLoading(true);
      setErro("");
      const response = await AgendaComercialService.getVisitas();
      setVisitas(response.results);
      // console.log(response.results); // Debug se quiser
    } catch (e) {
      console.error("Erro ao carregar visitas:", e);
      setErro("Falha ao carregar as visitas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVisitas();
  }, []);

  function exportarRelatorioExcel() {
    const dadosParaExportar = visitas.map(v => ({
      Empresa: v.empresa,
      Data: v.data,
      Status: v.status,
      Responsável: v.responsavel
        ? v.responsavel.nome_completo || v.responsavel.username || "N/A"
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(dadosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitas");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "Relatorio_Visitas.xlsx");
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      await AgendaComercialService.updateVisitaStatus(id, novoStatus);
      fetchVisitas();
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      setErro("Não foi possível atualizar o status.");
    }
  }

  function abrirModalConfirmacao(visita) {
    setModal(visita);
  }

  // Renderização da tela principal
  if (loading) {
    return (
      <div className="fedconnect-dashboard">
        <p>Carregando visitas...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="fedconnect-dashboard">
        <p className="alert error">{erro}</p>
      </div>
    );
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
        onCardClick={setVisitaDetalhe} // <- Novo: prop para abrir modal de detalhes
      />

      {/* Modal de detalhes da visita */}
      {visitaDetalhe && (
        <DetalheVisita
          visita={visitaDetalhe}
          onClose={() => setVisitaDetalhe(null)}
        />
      )}
    </div>
  );
}

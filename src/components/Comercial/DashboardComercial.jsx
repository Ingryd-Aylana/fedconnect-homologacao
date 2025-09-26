import React, { useEffect, useState } from "react";
import KanbanVisitas from "./KanbanVisitas";
import GraficoVisitas from "./GraficoVisitas";
import ModalConfirmarVisita from "./ModalConfirmarVisita";
import { AgendaComercialService } from "../../services/agenda_comercial";
import "../styles/DashboardComercial.css";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DashboardComercial() {
  const [visitas, setVisitas] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function fetchVisitas() {
    try {
      setLoading(true);
      setErro("");
      const response = await AgendaComercialService.getVisitas();
      setVisitas(response.results);
      console.log(visitas)
    } catch (e) {
      console.error("Erro ao carregar visitas:", e);
      setErro("Falha ao carregar as visitas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Carrega as visitas quando o componente é montado
  useEffect(() => {
    fetchVisitas();
  }, []);

  function exportarRelatorioExcel() {
    const dadosParaExportar = visitas.map(v => ({
      Empresa: v.empresa,
      Data: v.data,
      Status: v.status,
      // Se 'responsavel' for um objeto, pegue o nome do usuário
      Responsável: v.responsavel ? v.responsavel.username : "N/A",
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

  async function confirmarVisita(dados) {
    if (!modal) return;
    try {
      // Aqui você pode chamar um serviço específico de confirmação se houver
      // Ou apenas usar o atualizarStatus como antes
      await AgendaComercialService.updateVisitaStatus(modal.id, "realizada");
      setModal(null);
      fetchVisitas();
    } catch (e) {
      console.error("Erro ao confirmar visita:", e);
      setErro("Não foi possível confirmar a visita.");
    }
  }

  async function cancelarVisita() {
    if (!modal) return;
    try {
      await AgendaComercialService.updateVisitaStatus(modal.id, "cancelada");
      setModal(null);
      fetchVisitas();
    } catch (e) {
      console.error("Erro ao cancelar visita:", e);
      setErro("Não foi possível cancelar a visita.");
    }
  }

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
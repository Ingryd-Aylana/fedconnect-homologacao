import React, { useEffect, useMemo, useState } from "react";
import "../styles/AgendaComercial.css";
import { AgendaComercialService } from "../../services/agenda_comercial";

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const EMPTY_FORM = {
  empresa: "",
  data: "",
  hora: "",
  endereco: "",
  contato: "",
  observacao: "",
  status: "agendado",
};

export default function AgendaComercial() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [filters, setFilters] = useState({ text: "", date: "", status: "all" });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const isEditing = editId !== null;

  // Novo: modal e controle para cancelar visita
  const [cancelarModal, setCancelarModal] = useState({ aberto: false, visita: null });
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [erroCancelamento, setErroCancelamento] = useState("");

  async function fetchVisitas(f = filters) {
    try {
      setLoading(true);
      setErro("");
      const response = await AgendaComercialService.getVisitas();
      const visitasDaAPI = response.results;

      let visitasFiltradas = Array.isArray(visitasDaAPI) ? visitasDaAPI : [];

      if (f.text) {
        const t = f.text.toLowerCase();
        visitasFiltradas = visitasFiltradas.filter(v =>
          (v.empresa || "").toLowerCase().includes(t)
        );
      }
      if (f.date) visitasFiltradas = visitasFiltradas.filter(v => v.data === f.date);
      if (f.status !== "all") visitasFiltradas = visitasFiltradas.filter(v => v.status === f.status);

      setVisitas(visitasFiltradas);
    } catch (e) {
      console.error("Erro ao carregar a agenda:", e);
      setErro("Falha ao carregar a agenda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchVisitas(); }, []);
  useEffect(() => { fetchVisitas(filters); }, [filters]);

  const grouped = useMemo(() => {
    if (!Array.isArray(visitas)) {
      return [];
    }
    const byDate = {};
    visitas.forEach(v => {
      byDate[v.data] = byDate[v.data] || [];
      byDate[v.data].push(v);
    });
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
  }, [visitas]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(v) {
    setEditId(v.id);
    setForm({
      empresa: v.empresa || "",
      data: v.data || "",
      hora: v.hora || "",
      observacao: v.obs || "",
      status: v.status || "agendado",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!form.empresa || !form.data) {
      setErro("Preencha cliente/empresa e data.");
      return;
    }
    try {
      setErro("");
      const payload = {
        empresa: form.empresa,
        data: form.data,
        hora: form.hora,
        obs: form.observacao,
        status: form.status,
      };

      if (isEditing) {
        await AgendaComercialService.confirmarVisita(editId, payload);
      } else {
        await AgendaComercialService.criarVisita(payload);
      }
      closeModal();
      fetchVisitas();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setErro("Não foi possível salvar. Tente novamente.");
    }
  }

  async function toggleStatus(v) {
    const novoStatus = v.status === "agendado" ? "realizada" : "agendado";
    await AgendaComercialService.updateVisitaStatus(v.id, novoStatus);
    fetchVisitas();
  }

  function openCancelarModal(visita) {
    setCancelarModal({ aberto: true, visita });
    setMotivoCancelamento("");
    setErroCancelamento("");
  }
  function closeCancelarModal() {
    setCancelarModal({ aberto: false, visita: null });
    setMotivoCancelamento("");
    setErroCancelamento("");
  }
  async function handleCancelarVisita() {
    if (!motivoCancelamento.trim()) {
      setErroCancelamento("Motivo obrigatório.");
      return;
    }
    try {
      setErroCancelamento("");
      // Ajuste o payload conforme seu backend. Aqui mandamos o motivo junto.
      await AgendaComercialService.updateVisitaStatus(
        cancelarModal.visita.id,
        "cancelada",
        { motivo_cancelamento: motivoCancelamento }
      );
      closeCancelarModal();
      fetchVisitas();
    } catch (err) {
      setErroCancelamento("Erro ao cancelar a visita.");
    }
  }

  return (
    <div className="agenda-page">
      <header className="agenda-header">
        <h2>Agenda Comercial</h2>
        <button className="btn-primary" onClick={openCreate}>+ Nova Visita</button>
      </header>
      <div className="agenda-filtros">
        <input
          type="text"
          placeholder="Buscar por empresa…"
          value={filters.text}
          onChange={(e) => setFilters({ ...filters, text: e.target.value })}
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Todos</option>
          <option value="agendado">Agendado</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <button className="btn-light" onClick={() => setFilters({ text: "", date: "", status: "all" })}>
          Limpar
        </button>
      </div>
      {erro && <div className="alert error">{erro}</div>}
      {loading ? (
        <div className="skeleton">Carregando visitas…</div>
      ) : grouped.length === 0 ? (
        <div className="empty">Nenhuma visita encontrada.</div>
      ) : (
        <div className="agenda-lista">
          {grouped.map(([data, items]) => (
            <section key={data} className="agenda-grupo">
              <h3 className="grupo-titulo">📆 {formatDateBR(data)}</h3>
              <div className="cards">
                {items.map(v => (
                  <article key={v.id} className={`card ${v.status}`}>
                    <div className="card-head">
                      <span className="hora">{v.hora}</span>
                      <span className={`status ${v.status}`}>
                        {v.status === "agendado"
                          ? "Agendado"
                          : v.status === "realizada"
                            ? "Realizada"
                            : v.status === "cancelada"
                              ? "Cancelada"
                              : v.status}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="linha"><strong>Cliente/Empresa:</strong> {v.empresa}</div>
                      <div className="linha"><strong>Responsável:</strong> {v.responsavel?.nome_completo || ""}</div>
                      {v.obs && <div className="obs">{v.obs}</div>}
                      {v.status === "cancelada" && v.motivo_cancelamento && (
                        <div className="obs-cancelada">
                          <strong>Motivo do cancelamento:</strong> {v.motivo_cancelamento}
                        </div>
                      )}
                    </div>
                    <div className="card-actions">
                      
                      <div className="spacer" />
                      <button className="btn-light" onClick={() => openEdit(v)}>Editar</button>
                      {v.status === "agendado" && (
                        <button className="btn-danger" onClick={() => openCancelarModal(v)}>
                          Cancelar
                        </button>
                      )}
                    </div>

                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="agenda-modal-title">{isEditing ? "Editar Visita" : "Nova Visita"}</h3>
              <button className="icon-btn" aria-label="Fechar" onClick={closeModal}>×</button>
            </div>
            <form className="agenda-form" onSubmit={handleSubmit} noValidate>
              <div className="grid">
                <label>
                  Cliente/Empresa*
                  <input
                    name="empresa"
                    type="text"
                    value={form.empresa}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    placeholder="Ex.: Cond. Jardim das Flores"
                    required
                  />
                </label>
                <label>
                  Data*
                  <input
                    name="data"
                    type="date"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Hora
                  <input
                    name="hora"
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  />
                </label>
                <label>
                  Status*
                  <select
                    name="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    required
                  >
                    <option value="agendado">Agendado</option>
                    <option value="realizada">Realizada</option>
                  </select>
                </label>
                <label className="full">
                  Observação
                  <textarea
                    name="observacao"
                    rows={4}
                    value={form.observacao}
                    onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                    placeholder="Detalhes da visita, objetivos, etc."
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-light" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {isEditing ? "Salvar alterações" : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelarModal.aberto && (
        <div className="modal-overlay" onClick={closeCancelarModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancelar visita</h3>
              <button className="icon-btn" aria-label="Fechar" onClick={closeCancelarModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Informe o motivo do cancelamento:</p>
              <textarea
                rows={4}
                style={{ width: "100%" }}
                value={motivoCancelamento}
                onChange={e => setMotivoCancelamento(e.target.value)}
                placeholder="Motivo do cancelamento (obrigatório)"
              />
              {erroCancelamento && <div className="alert error">{erroCancelamento}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn-light" onClick={closeCancelarModal}>Voltar</button>
              <button
                className="btn-danger"
                onClick={handleCancelarVisita}
              >Confirmar cancelamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

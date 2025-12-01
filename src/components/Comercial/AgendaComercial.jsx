import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../styles/AgendaComercial.css";
import { AgendaComercialService } from "../../services/agenda_comercial";
import ModalConfirmarVisita from "./ModalConfirmarVisita";

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function formatHour(h) { return h?.slice(0, 5) || "--:--"; }
function getMonthLabel(date) { return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }); }
function addMonths(date, delta) { const d = new Date(date.getTime()); d.setMonth(d.getMonth() + delta, 1); return d; }

const EMPTY_FORM = { empresa: "", data: "", hora: "", observacao: "", status: "agendado", motivo_cancelamento: "" };
const STATUS_ORDER = ["agendado", "realizada", "cancelada"];
const STATUS_LABEL = { agendado: "Agendado", realizada: "Realizada", cancelada: "Cancelada" };
const DND_MIME = "application/x-visita-id";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia(`(max-width:${breakpoint}px)`).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const onChange = e => setIsMobile(e.matches);
    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange);
    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);
    };
  }, [breakpoint]);
  return isMobile;
}

function AccordionVisitas({ columns, onEdit, onCancelar, onConfirmar }) {
  const [openKey, setOpenKey] = useState("agendado");

  const sections = [
    { key: "agendado", title: `Agendadas (${columns.agendado?.length || 0})` },
    { key: "realizada", title: `Realizadas (${columns.realizada?.length || 0})` },
    { key: "cancelada", title: `Canceladas (${columns.cancelada?.length || 0})` },
  ];

  return (
    <>
      <section className="dashboard-totalizador">
        <div className="totals">
          <span><strong>Agendadas:</strong> {columns.agendado?.length || 0}</span>
          <span className="sep">|</span>
          <span><strong>Realizadas:</strong> {columns.realizada?.length || 0}</span>
          <span className="sep">|</span>
          <span><strong>Canceladas:</strong> {columns.cancelada?.length || 0}</span>
        </div>
      </section>

      <div className="accordion">
        {sections.map(sec => (
          <div key={sec.key} className="accordion-item">
            <button
              className="accordion-header"
              aria-expanded={openKey === sec.key}
              onClick={() => setOpenKey(k => (k === sec.key ? "" : sec.key))}
            >
              <span>{sec.title}</span>
              <span className="chevron" aria-hidden>▾</span>
            </button>

            <div className={`accordion-content ${openKey === sec.key ? "open" : ""}`}>
              {(columns[sec.key] || []).length === 0 ? (
                <div className="empty">Sem registros</div>
              ) : (
                <ul className="accordion-list">
                  {columns[sec.key].map(v => (
                    <li key={v.id} className="accordion-card">
                      <button className="card-main" type="button">
                        <div className="card-title"><strong>{v.empresa}</strong></div>
                        <div className="card-meta">
                          <span>{formatDateBR(v.data)}</span>
                          <span>•</span>
                          <span>{formatHour(v.hora)}</span>
                          {v.responsavel?.nome_completo && (
                            <>
                              <span>•</span>
                              <span>{v.responsavel.nome_completo}</span>
                            </>
                          )}
                        </div>
                        {v.obs && <div className="kobs" style={{ marginTop: 8 }}>{v.obs}</div>}
                        {v.status === "cancelada" && v.motivo_cancelamento && (
                          <div className="kobs-cancelada" style={{ marginTop: 8 }}>
                            <strong>Motivo:</strong> {v.motivo_cancelamento}
                          </div>
                        )}
                      </button>

                      {v.status === "agendado" && (
                        <div className="card-actions">
                          <button className="btn-ghost" onClick={() => onEdit?.(v)}>Editar</button>

                          <button className="btn-ghost danger" onClick={() => onCancelar?.(v)}>Cancelar</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AgendaComercial() {
  const [currentMonth, setCurrentMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const monthLabel = useMemo(() => getMonthLabel(currentMonth), [currentMonth]);
  const [filters, setFilters] = useState({ empresa: "" });
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const isEditing = editId !== null;

  const [cancelarModal, setCancelarModal] = useState({ aberto: false, visita: null });
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [erroCancelamento, setErroCancelamento] = useState("");

  const [confirmarModal, setConfirmarModal] = useState({ aberto: false, visita: null });

  const isMobile = useIsMobile(768);

  const fetchVisitas = useCallback(async () => {
    try {
      setLoading(true); setErro("");
      const ano = currentMonth.getFullYear();
      const mes = currentMonth.getMonth() + 1;
      const response = await AgendaComercialService.getVisitas(ano, mes);

      let visitasDoMes = Array.isArray(response?.results) ? response.results
        : Array.isArray(response) ? response
          : [];

      if (filters.empresa) {
        const t = filters.empresa.toLowerCase();
        visitasDoMes = visitasDoMes.filter(v => (v.empresa || "").toLowerCase().includes(t));
      }
      visitasDoMes.sort((a, b) => a.data === b.data ? (a.hora || "").localeCompare(b.hora || "") : a.data.localeCompare(b.data));
      setVisitas(visitasDoMes);
    } catch (e) {
      console.error("Erro ao carregar a agenda:", e);
      setErro("Falha ao carregar a agenda. Tente novamente.");
    } finally { setLoading(false); }
  }, [currentMonth, filters.empresa]);

  useEffect(() => { fetchVisitas(); }, [fetchVisitas]);

  const columns = useMemo(() => {
    const map = { agendado: [], realizada: [], cancelada: [] };
    for (const v of visitas) {
      const s = (v.status || "agendado").toLowerCase();
      if (map[s]) map[s].push(v); else map.agendado.push(v);
    }
    return map;
  }, [visitas]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }
  function openEdit(v) {
    if ((v.status || "").toLowerCase() !== "agendado") return;
    setEditId(v.id);
    setForm({
      empresa: v.empresa || "",
      data: v.data || "",
      hora: v.hora || "",
      observacao: v.obs || "",
      status: v.status || "agendado",
      motivo_cancelamento: v.motivo_cancelamento || ""
    });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    try {
      setLoading(true); setErro("");
      const payload = {
        empresa: form.empresa?.trim(),
        data: form.data,
        hora: form.hora,
        obs: form.observacao?.trim() || "",
        status: "agendado",
      };

      if (!payload.empresa || !payload.data || !payload.hora) {
        setErro("Preencha empresa, data e hora.");
        return;
      }

      if (isEditing) {
        await AgendaComercialService.updateVisita?.(editId, payload)
          ?? AgendaComercialService.confirmarVisita(editId, payload);
      } else {
        await AgendaComercialService.createVisita?.(payload)
          ?? AgendaComercialService.criarVisita(payload);
      }
      closeModal();
      await fetchVisitas();
    } catch (e2) {
      console.error("Erro ao salvar visita:", e2);
      setErro("Falha ao salvar visita.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, novoStatus, extraPayload = {}) {
    try {
      setLoading(true); setErro("");

      const S = AgendaComercialService;
      const payload = { status: novoStatus, ...extraPayload };

      if (typeof S.updateVisitaStatus === "function") {
        await S.updateVisitaStatus(id, novoStatus, extraPayload);
      }
      else if (novoStatus === "realizada" && typeof S.marcarRealizada === "function") {
        await S.marcarRealizada(id);
      } else if (novoStatus === "cancelada" && typeof S.cancelarVisita === "function") {
        const motivo =
          payload.motivo_cancelamento ||
          extraPayload.motivo ||
          extraPayload.motivoCancelamento ||
          "";
        await S.cancelarVisita(id, { motivo_cancelamento: motivo });
      }
      else if (typeof S.alterarStatus === "function") {
        await S.alterarStatus(id, payload);
      } else if (typeof S.update === "function") {
        await S.update(id, payload);
      } else if (typeof S.patchVisita === "function") {
        await S.patchVisita(id, payload);
      } else if (typeof S.saveVisita === "function") {
        await S.saveVisita(id, payload);
      } else if (typeof S.updateVisita === "function") {
        await S.updateVisita(id, payload);
      } else {
        throw new Error("Nenhum método de atualização encontrado no AgendaComercialService");
      }

      await fetchVisitas();
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      setErro("Falha ao atualizar status.");
    } finally {
      setLoading(false);
    }
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
  function openConfirmarModal(visita) {
    setConfirmarModal({ aberto: true, visita });
  }
  function closeConfirmarModal() {
    setConfirmarModal({ aberto: false, visita: null });
  }

  async function handleCancelarVisita() {
    if (!cancelarModal.visita) return;
    if (!motivoCancelamento.trim()) {
      setErroCancelamento("Informe o motivo do cancelamento.");
      return;
    }
    try {
      await updateStatus(
        cancelarModal.visita.id,
        "cancelada",
        { motivo_cancelamento: motivoCancelamento.trim() }
      );
      closeCancelarModal();
    } catch { }
  }

  async function handleConfirmarVisita(dadosConfirmacao) {
    if (!confirmarModal.visita) return;
    await updateStatus(confirmarModal.visita.id, "realizada", dadosConfirmacao || {});
    closeConfirmarModal();
  }

  function onDragStart(e, visita) {
    if ((visita.status || "").toLowerCase() !== "agendado") return;
    e.dataTransfer.setData(DND_MIME, String(visita.id));
    e.dataTransfer.setData("text/plain", String(visita.id));
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onDrop(e, targetStatus) {
    e.preventDefault();
    const idStr = e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData("text/plain");
    const id = Number(idStr);
    if (!id || !STATUS_ORDER.includes(targetStatus)) return;

    const visita = visitas.find(v => v.id === id);
    if (!visita) return;
    if ((visita.status || "agendado") === targetStatus) return;

    if (targetStatus === "cancelada") {
      openCancelarModal(visita);
      return;
    }
    if (targetStatus === "realizada") {
      openConfirmarModal(visita); 
    }
  }

  function handleMonthInput(e) {
    const value = e.target.value;
    if (!value) return;
    const [y, m] = value.split("-").map(Number);
    if (y && m) setCurrentMonth(new Date(y, m - 1, 1));
  }

  return (
    <div className="agenda-page">
      <header className="agenda-header">
        <div className="agenda-header-left"><h2>Agenda Comercial</h2></div>
        <div className="agenda-header-right">
          <button className="btn-primary" onClick={openCreate}>+ Nova Visita</button>
        </div>
      </header>

      <div className="dashboard-filtros agenda-filtros">
        <input
          type="text"
          placeholder="Buscar por empresa…"
          value={filters.empresa}
          onChange={e => setFilters(f => ({ ...f, empresa: e.target.value }))}
        />
        <div className="dashboard-mes-controls">
          <input
            type="month"
            className="month-input"
            onChange={handleMonthInput}
            aria-label="Selecionar mês"
            value={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`}
          />
        </div>
        <button className="btn-light" onClick={() => setFilters({ empresa: "" })}>Limpar</button>
      </div>

      {erro && <div className="alert error">{erro}</div>}

      {loading ? (
        <div className="skeleton">Carregando visitas…</div>
      ) : isMobile ? (
        <AccordionVisitas
          columns={columns}
          onEdit={openEdit}
          onCancelar={openCancelarModal}
          onConfirmar={openConfirmarModal}
        />
      ) : (
        <div className="kanban" role="list">
          {STATUS_ORDER.map(status => (
            <section
              key={status}
              className={`kanban-col ${status}`}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, status)}
              aria-label={`Coluna ${STATUS_LABEL[status]}`}
            >
              <header className="kanban-col-header">
                <h3>{STATUS_LABEL[status]}</h3>
                <span className="badge">{(columns[status] || []).length}</span>
              </header>
              <div className="kanban-col-body">
                {(columns[status] || []).length === 0 ? (
                  <div className="empty-col">Sem registros</div>
                ) : (
                  columns[status].map(v => (
                    <article
                      key={v.id}
                      className={`kcard ${v.status} ${v.status === "agendado" ? "is-draggable" : "is-locked"}`}
                      draggable={v.status === "agendado"}
                      onDragStart={v.status === "agendado" ? (e) => onDragStart(e, v) : undefined}
                      role="listitem"
                    >
                      <div className="kcard-head">
                        <span className="kcard-date">{formatDateBR(v.data)}</span>
                        <span className="kcard-hour">{formatHour(v.hora)}</span>
                      </div>
                      <div className="kcard-body">
                        <div className="kline"><strong>Empresa:</strong> {v.empresa}</div>
                        {v.responsavel?.nome_completo && (
                          <div className="kline"><strong>Responsável:</strong> {v.responsavel.nome_completo}</div>
                        )}
                        {v.obs && <div className="kobs">{v.obs}</div>}
                        {v.status === "cancelada" && v.motivo_cancelamento && (
                          <div className="kobs-cancelada"><strong>Motivo:</strong> {v.motivo_cancelamento}</div>
                        )}
                      </div>
                      <div className="kcard-actions">
                        {v.status === "agendado" && (
                          <>
                            <button className="btn-light" onClick={() => openEdit(v)}>Editar</button>

                            <button className="btn-danger" onClick={() => openCancelarModal(v)}>Cancelar</button>
                          </>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? "Editar visita" : "Nova visita"}</h3>
              <button className="icon-btn" aria-label="Fechar" onClick={closeModal}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="field">
                <label>Empresa</label>
                <input
                  type="text"
                  value={form.empresa}
                  onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                  required
                />
              </div>
              <div className="row">
                <div className="field">
                  <label>Data</label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Observação</label>
                <textarea
                  rows={4}
                  value={form.observacao}
                  onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                  placeholder="Informações adicionais"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-light" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary">{isEditing ? "Salvar" : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelarModal.aberto && (
        <div className="modal-overlay" onClick={closeCancelarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Motivo do cancelamento (obrigatório)"
              />
              {erroCancelamento && <div className="alert error">{erroCancelamento}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn-light" onClick={closeCancelarModal}>Voltar</button>
              <button className="btn-danger" onClick={handleCancelarVisita}>Confirmar cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {confirmarModal.aberto && (
        <ModalConfirmarVisita
          open={confirmarModal.aberto}
          visita={confirmarModal.visita}
          onClose={closeConfirmarModal}
          onConfirm={handleConfirmarVisita}
        />
      )}
    </div>
  );
}

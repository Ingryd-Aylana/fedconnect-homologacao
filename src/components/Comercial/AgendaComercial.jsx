import React, { useEffect, useMemo, useState } from "react";
import "../styles/AgendaComercial.css";

const STORAGE_KEY = "agenda_comercial_visitas";

function readLS() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function writeLS(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function delay(ms = 200) { return new Promise(r => setTimeout(r, ms)); }

const mockService = {
  async list({ text = "", date = "", status = "all" } = {}) {
    await delay();
    let data = readLS();

    if (text) {
      const t = text.toLowerCase();
      data = data.filter(v =>
        (v.cliente || "").toLowerCase().includes(t) ||
        (v.endereco || "").toLowerCase().includes(t) ||
        (v.observacao || "").toLowerCase().includes(t) ||
        (v.contato || "").toLowerCase().includes(t)
      );
    }
    if (date) data = data.filter(v => v.data === date);
    if (status !== "all") data = data.filter(v => v.status === status);

    return data.sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
  },
  async create(payload) {
    await delay();
    const data = readLS();
    const now = Date.now();
    const novo = { id: now, criadoEm: now, status: "agendado", ...payload };
    data.push(novo);
    writeLS(data);
    return novo;
  },
  async update(id, payload) {
    await delay();
    const data = readLS();
    const idx = data.findIndex(v => v.id === id);
    if (idx === -1) throw new Error("Visita não encontrada");
    data[idx] = { ...data[idx], ...payload, atualizadoEm: Date.now() };
    writeLS(data);
    return data[idx];
  },
  async remove(id) {
    await delay();
    writeLS(readLS().filter(v => v.id !== id));
    return true;
  }
};

let ADAPTER = "mock";
const AgendaService = {
  list: (filters) => mockService.list(filters),
  create: (p) => mockService.create(p),
  update: (id, p) => mockService.update(id, p),
  remove: (id) => mockService.remove(id),
};

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const EMPTY_FORM = {
  cliente: "",
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

  async function fetchVisitas(f = filters) {
    try {
      setLoading(true);
      setErro("");
      const data = await AgendaService.list(f);
      setVisitas(data);
    } catch (e) {
      setErro("Falha ao carregar a agenda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchVisitas(); }, []);
  useEffect(() => { fetchVisitas(filters); }, [filters]);

  const grouped = useMemo(() => {
    const byDate = {};
    visitas.forEach(v => {
      byDate[v.data] = byDate[v.data] || [];
      byDate[v.data].push(v);
    });
    return Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b));
  }, [visitas]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }
  function openEdit(v) {
    setEditId(v.id);
    setForm({
      cliente: v.cliente || "",
      data: v.data || "",
      hora: v.hora || "",
      endereco: v.endereco || "",
      contato: v.contato || "",
      observacao: v.observacao || "",
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
    if (!form.cliente || !form.data || !form.hora) {
      setErro("Preencha cliente, data e hora.");
      return;
    }
    try {
      setErro("");
      if (isEditing) {
        await AgendaService.update(editId, form);
      } else {
        await AgendaService.create(form);
      }
      closeModal();
      fetchVisitas();
    } catch (err) {
      setErro("Não foi possível salvar. Tente novamente.");
    }
  }

  async function toggleStatus(v) {
    const novo = v.status === "agendado" ? "concluido" : "agendado";
    await AgendaService.update(v.id, { status: novo });
    fetchVisitas();
  }

  async function removeVisita(id) {
    if (!confirm("Confirmar exclusão da visita?")) return;
    await AgendaService.remove(id);
    fetchVisitas();
  }

  return (
    <div className="agenda-page">
      <header className="agenda-header">
        <h2>Agenda Comercial</h2>
        <button className="btn-primary" onClick={openCreate}>+ Nova Visita</button>
      </header>

      {/* Filtros (embutidos) */}
      <div className="agenda-filtros">
        <input
          type="text"
          placeholder="Buscar por cliente, endereço, observação…"
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
          <option value="concluido">Concluído</option>
        </select>
        <button
          className="btn-light"
          onClick={() => setFilters({ text: "", date: "", status: "all" })}
        >
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
                        {v.status === "agendado" ? "Agendado" : "Concluído"}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="linha"><strong>Cliente/Empresa:</strong> {v.cliente}</div>
                      {v.endereco && <div className="linha"><strong>Endereço:</strong> {v.endereco}</div>}
                      {v.contato && <div className="linha"><strong>Contato:</strong> {v.contato}</div>}
                      {v.observacao && <div className="obs">{v.observacao}</div>}
                    </div>
                    <div className="card-actions">
                      <button className="btn-ghost" onClick={() => toggleStatus(v)}>
                        {v.status === "agendado" ? "Marcar como concluída" : "Voltar para agendada"}
                      </button>
                      <div className="spacer" />
                      <button className="btn-light" onClick={() => openEdit(v)}>Editar</button>
                      <button className="btn-danger" onClick={() => removeVisita(v.id)}>Excluir</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Modal (embutido) */}
      {modalOpen && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? "Editar Visita" : "Nova Visita"}</h3>
              <button className="icon-btn" aria-label="Fechar" onClick={closeModal}>×</button>
            </div>

            <div className="modal-content">
              <form className="agenda-form" onSubmit={handleSubmit}>
                <div className="grid">
                  <label>
                    Cliente/Empresa*
                    <input
                      type="text"
                      value={form.cliente}
                      onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                      placeholder="Ex.: Cond. Jardim das Flores"
                      required
                    />
                  </label>
                  <label>
                    Data*
                    <input
                      type="date"
                      value={form.data}
                      onChange={(e) => setForm({ ...form, data: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Hora*
                    <input
                      type="time"
                      value={form.hora}
                      onChange={(e) => setForm({ ...form, hora: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Endereço
                    <input
                      type="text"
                      value={form.endereco}
                      onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                      placeholder="Rua, número, bairro, cidade - UF"
                    />
                  </label>
                  <label>
                    Contato
                    <input
                      type="text"
                      value={form.contato}
                      onChange={(e) => setForm({ ...form, contato: e.target.value })}
                      placeholder="Nome do contato / telefone"
                    />
                  </label>
                  <label className="full">
                    Observação
                    <textarea
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
        </div>
      )}
    </div>
  );
}

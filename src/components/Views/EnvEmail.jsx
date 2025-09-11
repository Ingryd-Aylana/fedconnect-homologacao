import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../styles/EnvEmail.css";
import { Mail, History, Settings, FileSpreadsheet } from "lucide-react";

const EnvioEmail = () => {
    const [activeForm, setActiveForm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");

    const [assunto, setAssunto] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [listaManual, setListaManual] = useState("");
    const [planilhaInfo, setPlanilhaInfo] = useState(null);
    const [destinatariosPlanilha, setDestinatariosPlanilha] = useState([]);

    const [historico, setHistorico] = useState([]);
    const [historicoLoading, setHistoricoLoading] = useState(false);

    const navigate = useNavigate();

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    const parseEmailsManuais = (texto) => {
        if (!texto) return [];
        const tokens = texto
            .split(/[\n,;]+/g)
            .map((t) => t.trim())
            .filter(Boolean);

        return tokens
            .map((t) => {
                const m = t.match(/(.*)<([^>]+)>/);
                if (m && m[2]) {
                    return { email: m[2].trim(), nome: m[1].trim() || undefined };
                }
                return { email: t };
            })
            .filter((x) => emailRegex.test(x.email));
    };

    const dedupEmails = (arr) => {
        const seen = new Set();
        const out = [];
        for (const it of arr) {
            const key = it.email.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                out.push(it);
            }
        }
        return out;
    };

    const handleUploadPlanilha = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLoading(true);
        setError(null);
        setMessage("Lendo planilha…");

        try {
            const data = new Uint8Array(await file.arrayBuffer());
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const ws = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(ws);
            const rows = json.map((r) => {
                const email =
                    r.Email || r.EMAIL || r.email || r.eMail || r.mail || r["E-mail"];
                const nome = r.Nome || r.nome || r.Name || r.name;
                return { email: String(email || "").trim(), nome: nome ? String(nome).trim() : undefined };
            });

            const validos = rows.filter((r) => emailRegex.test(r.email));
            setDestinatariosPlanilha(validos);
            setPlanilhaInfo({ total: rows.length, validos: validos.length });
            setMessage(`Planilha carregada. ${validos.length}/${rows.length} e-mails válidos.`);
        } catch (err) {
            console.error(err);
            setError("Não foi possível ler a planilha. Verifique o arquivo e as colunas (Email, Nome).");
        } finally {
            setLoading(false);
            if (event.target) event.target.value = null;
        }
    };

    const handleEnviarEmails = async () => {
        setLoading(true);
        setError(null);
        setMessage("");

        const manuais = parseEmailsManuais(listaManual);
        const todos = dedupEmails([...manuais, ...destinatariosPlanilha]);

        if (!assunto.trim()) {
            setError("Informe o assunto.");
            setLoading(false);
            return;
        }
        if (!mensagem.trim()) {
            setError("Informe a mensagem.");
            setLoading(false);
            return;
        }
        if (todos.length === 0) {
            setError("Adicione pelo menos um destinatário (manual ou planilha).");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                assunto,
                mensagem,
                destinatarios: todos,
                origem: {
                    manual: manuais.length,
                    planilha: destinatariosPlanilha.length,
                },
            };

            const resp = await EmailService.enviarEmailsMassa(payload);

            if (resp instanceof Blob) {
                const url = window.URL.createObjectURL(new Blob([resp]));
                const a = document.createElement("a");
                a.href = url;
                a.setAttribute("download", "relatorio-envio-emails.xlsx");
                document.body.appendChild(a);
                a.click();
                a.remove();
                setMessage("Envio disparado! Baixamos o relatório do lote.");
            } else {
                setMessage("Envio disparado com sucesso!");
            }

            setListaManual("");
            setDestinatariosPlanilha([]);
            setPlanilhaInfo(null);
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Erro ao enviar os e-mails.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchHistorico = async () => {
            if (activeForm !== "historico") return;
            setHistoricoLoading(true);
            setError(null);
            try {
                const list = await EmailService.listarHistoricoEmails();
                setHistorico(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar o histórico de envios.");
            } finally {
                setHistoricoLoading(false);
            }
        };
        fetchHistorico();
    }, [activeForm]);

    const handleDownloadRelatorio = async (loteId) => {
        try {
            setLoading(true);
            const blob = await EmailService.baixarRelatorioEnvio(loteId);
            if (blob) {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement("a");
                a.href = url;
                a.setAttribute("download", `relatorio-lote-${loteId}.xlsx`);
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (err) {
            console.error(err);
            setError("Não foi possível baixar o relatório do lote.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="consulta-container03">
            <h1 className="email-title">
            <i className="bi bi-envelope-fill"></i> Escolha a opção desejada
            </h1>


            <div className="card-options-wrapper">
                <div
                    className={`card card-option ${activeForm === "envio" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("envio");
                        setError(null);
                        setMessage("");
                    }}
                >
                    <div className="icon-container">
                        <Mail size={28} color="white" />
                    </div>
                    <h5>Envio de E-mail</h5>
                </div>

                <div
                    className={`card card-option ${activeForm === "historico" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("historico");
                        setError(null);
                        setMessage("");
                    }}
                >
                    <div className="icon-container">
                        <History size={28} color="white" />
                    </div>
                    <h5>Histórico</h5>
                </div>

                <div
                    className={`card card-option ${activeForm === "config" ? "active" : ""}`}
                    onClick={() => {
                        setActiveForm("config");
                        setError(null);
                        setMessage("");
                    }}
                >
                    <div
                        onClick={() => navigate("/config-email")}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="icon-container">
                            <Settings size={28} color="white" />
                        </div>
                        <h5>Configurações</h5>
                    </div>
                </div>
            </div>

            {activeForm === "envio" && (
                <div className="form-container">
                    <div className="assunto-container">
                        <label htmlFor="assunto" className="assunto">Tipo de Envio</label>

                        <select
                            id="tipoEnvio"
                            value={assunto}
                            className="select-tipo-envio"
                            onChange={(e) => setAssunto(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Selecione</option>
                            <option value="Vida">Vida</option>
                            <option value="Conteúdo">Conteúdo</option>
                            <option value="SST">SST</option>
                            <option value="VR">VR</option>
                            <option value="Boat">Boat</option>
                        </select>
                    </div>
                    <div className="upload-planilha-box">
                        <input
                            type="file"
                            id="planilha-emails"
                            accept=".xlsx, .xls"
                            style={{ display: "none" }}
                            onChange={handleUploadPlanilha}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="btn-upload"
                            onClick={() => document.getElementById("planilha-emails").click()}
                            disabled={loading}
                        >
                            <span className="btn-upload-content">
                                <FileSpreadsheet size={18} /> Importar Planilha Envio
                            </span>
                        </button>

                        {planilhaInfo && (
                            <p className="upload-info">
                                Planilha: {planilhaInfo.validos}/{planilhaInfo.total} e-mails válidos.
                            </p>
                        )}
                    </div>


                    <button
                        type="button"
                        className={`consulta-btn ${loading ? "loading" : ""}`}
                        onClick={handleEnviarEmails}
                        disabled={loading}
                        style={{ marginTop: 12 }}
                    >
                        {loading ? "Enviando..." : "Enviar"}
                    </button>

                    {message && <p className="message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}

            {activeForm === "historico" && (
                <div className="card-resultado">
                    <h4>Histórico de envios</h4>

                    {historicoLoading && <p>Carregando histórico…</p>}

                    {!historicoLoading && historico.length === 0 && (
                        <p className="message">Nenhum envio encontrado.</p>
                    )}

                    {!historicoLoading && historico.length > 0 && (
                        <table className="historico-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Assunto</th>
                                    <th>Status</th>
                                    <th>Destinatário</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historico.map((lote, idx) => (
                                    <tr key={idx}>
                                        <td>{lote.data || "—"}</td>
                                        <td>{lote.assunto || "—"}</td>
                                        <td>{lote.status || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {message && <p className="message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default EnvioEmail;

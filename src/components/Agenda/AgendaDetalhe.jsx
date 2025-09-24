import React from "react";
import { format, isDate } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { FaTimes, FaTrash } from "react-icons/fa";
import "../styles/AgendaSala.css";
import { useAuth } from "../../context/AuthContext";

export default function AgendaDetalhe({ reserva, onClose, onDelete }) {
  const { user } = useAuth();

  const access = String(user?.nivel_acesso || user?.role || user?.perfil || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const canSeeSensitive = ["admin", "gestor", "coordenador"].includes(access);
  const canManage = canSeeSensitive && typeof onDelete === "function";

  if (!reserva) return null;

  const dataObj = isDate(reserva?.data)
    ? reserva.data
    : new Date(reserva?.data);
  const dataFmt =
    reserva?.data && !isNaN(dataObj)
      ? format(dataObj, "dd/MM/yyyy", { locale: ptBR })
      : "-";

  const participantesArray = Array.isArray(reserva?.participantes)
    ? reserva.participantes
    : typeof reserva?.participantes === "string"
    ? reserva.participantes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="agenda-detalhe-overlay">
      <div className="agenda-detalhe-modal">
        <button
          className="agenda-detalhe-close"
          onClick={onClose}
          title="Fechar"
        >
          <FaTimes size={22} />
        </button>

        <h2 className="agenda-detalhe-titulo">Detalhes da Reserva</h2>

        <div className="agenda-detalhe-info">
          {canSeeSensitive && (
            <>
              <p>
                <strong>Tema:</strong> {reserva?.tema ?? "-"}
              </p>
              <p>
                <strong>Participantes:</strong>{" "}
                {participantesArray.length > 0
                  ? participantesArray.join(", ")
                  : "-"}
              </p>
            </>
          )}

          <p>
            <strong>Data:</strong> {dataFmt}
          </p>
          <p>
            <strong>Horário:</strong> {reserva?.horario ?? "-"}
          </p>
          <p>
            <strong>Duração:</strong> {reserva?.duracao ?? "-"} min
          </p>
        </div>

        <div className="agenda-detalhe-actions">
          {canManage && (
            <button
              className="btn-secondary"
              onClick={() => onDelete(reserva)}
              title="Excluir reserva"
            >
              <FaTrash style={{ marginRight: 5 }} />
              Excluir
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}AgendaDetalhe

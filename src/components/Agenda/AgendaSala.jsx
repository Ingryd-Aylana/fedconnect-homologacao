import React, { useEffect, useState, forwardRef } from "react";
import {
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  format,
  addDays,
  startOfWeek,
  startOfMonth,
  getDay,
  parseISO,
  startOfDay,
} from "date-fns";

import ptBR from "date-fns/locale/pt-BR";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/AgendaSala.css";
import AgendaReservaForm from "./AgendaReservaForm";
import AgendaDetalhe from "./AgendaDetalhe";
import { useAuth } from "../../context/AuthContext";
import { AgendaService } from "../../services/agendaService";

function getFirstMondayOfMonth(date) {
  const firstDay = startOfMonth(date);
  const weekDay = getDay(firstDay);
  return weekDay === 1 ? firstDay : addDays(firstDay, (8 - weekDay) % 7);
}

const HORARIOS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const MonthButton = forwardRef(function MonthButton({ value, onClick }, ref) {
  return (
    <button
      ref={ref}
      className="agenda-calendar-btn"
      title={value || "Escolher mês"}
      onClick={onClick}
    >
      <FaCalendarAlt size={22} />
    </button>
  );
});

export default function AgendaSala() {
  const [startDate, setStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const [showDeletedPopup, setShowDeletedPopup] = useState(false);

  const { user } = useAuth();
  const userRole = String(user?.nivel_acesso || "").toLowerCase();

  const fetchReservas = async (dataInicio, dataFim) => {
    try {
      const response = await AgendaService.getReservas(dataInicio, dataFim);
      let data;
      if (response && response.results) {
        data = response.results;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        data = [];
      }
      const formattedReservas = data.map((reserva) => ({
        ...reserva,
        data: parseISO(reserva.data),
      }));
      setReservas(formattedReservas);
    } catch (error) {
      setReservas([]);
    }
  };

  useEffect(() => {
    const dataInicio = format(startDate, "yyyy-MM-dd");
    const dataFim = format(addDays(startDate, 4), "yyyy-MM-dd");
    fetchReservas(dataInicio, dataFim);
  }, [startDate]);

  const handleWeekChange = (inc) => setStartDate(addDays(startDate, inc * 7));

  const handleNewReserva = (dia, hora) => {
    setSelectedSlot({ dia, hora });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };

  const handleSaveReserva = async (novaReserva) => {
    try {
      const payload = {
        ...novaReserva,
        data: format(novaReserva.data, "yyyy-MM-dd"),
        participantes: novaReserva.participantes?.join(", "),
        criado_por: user.id,
      };
      await AgendaService.createReserva(payload);
      closeModal();
      fetchReservas();
    } catch (error) {}
  };

  const handleDeleteReserva = async (reservaParaDeletar) => {
    try {
      await AgendaService.deleteReserva(reservaParaDeletar.id);
      setReservaSelecionada(null);
      fetchReservas();
      setShowDeletedPopup(true);
      setTimeout(() => setShowDeletedPopup(false), 2600);
    } catch (error) {
      console.error("Erro ao excluir reserva:", error);
    }
  };

  const renderGrid = () => (
    <table className="agenda-grid">
      <thead>
        <tr>
          <th>Horário</th>
          {diasSemana.map((_, idx) => {
            const dia = addDays(startDate, idx);
            return (
              <th key={idx}>
                <span className="agenda-dia">
                  {format(dia, "EEE", { locale: ptBR })}
                </span>{" "}
                <span className="agenda-data">{format(dia, "dd/MM")}</span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {HORARIOS.map((hora) => (
          <tr key={hora}>
            <td className="agenda-horario">{hora}</td>
            {diasSemana.map((_, dIdx) => {
              const dia = addDays(startDate, dIdx);
              const reservasSlot = reservas.filter(
                (r) =>
                  format(r.data, "yyyy-MM-dd") === format(dia, "yyyy-MM-dd") &&
                  r.horario === hora
              );
              const isLivre = reservasSlot.length === 0;
              return (
                <td
                  key={dIdx}
                  className={`agenda-cell ${isLivre ? "livre" : "ocupado"}`}
                >
                  {isLivre && dia >= startOfDay(new Date()) ? (
                    <button
                      className="agenda-slot-btn"
                      title="Reservar"
                      onClick={() => handleNewReserva(dia, hora)}
                    >
                      <FaPlus size={15} />
                    </button>
                  ) : isLivre ? (
                    <span style={{ color: "#f37171ff" }}></span>
                  ) : (
                    <button
                      className="agenda-reservado-pill"
                      title="Ver detalhes"
                      onClick={() => setReservaSelecionada(reservasSlot[0])}
                    >
                      Reservado
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="agenda-sala-page">
      <h1 className="agenda-titulo">
        <i className="bi bi-calendar-event" /> Agenda da Sala de Reunião
      </h1>
      <div className="agenda-toolbar">
        <button className="agenda-week-btn" onClick={() => handleWeekChange(-1)}>
          <FaChevronLeft />
        </button>
        <span className="agenda-semana">
          Semana de {format(startDate, "dd/MM/yyyy")} a{" "}
          {format(addDays(startDate, 4), "dd/MM/yyyy")}
        </span>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(getFirstMondayOfMonth(date))}
          dateFormat="MMMM/yyyy"
          showMonthYearPicker
          locale={ptBR}
          customInput={<MonthButton />}
        />
        <button className="agenda-week-btn" onClick={() => handleWeekChange(1)}>
          <FaChevronRight />
        </button>

        <button
          className="btn-primary agenda-nova-btn"
          onClick={() => handleNewReserva(null, null)}
        >
          <FaPlus className="agenda-plus-icon" /> Nova Reserva
        </button>
      </div>

      <div className="agenda-grid-container">{renderGrid()}</div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content agenda-modal-content">
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <h2 className="agenda-modal-titulo">Nova Reserva</h2>
            <AgendaReservaForm
              initialData={{
                data: selectedSlot?.dia || startDate,
                horario: selectedSlot?.hora || "09:00",
              }}
              userRole={userRole}
              onSave={handleSaveReserva}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {reservaSelecionada && (
        <AgendaDetalhe
          reserva={reservaSelecionada}
          userRole={userRole}
          onClose={() => setReservaSelecionada(null)}
          onDelete={handleDeleteReserva}
        />
      )}

      {showDeletedPopup && (
        <div className="agenda-toast agenda-toast-sucesso">
          Reserva excluída com sucesso!
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState, forwardRef } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  startOfMonth,
  getDay,
} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/AgendaSala.css";
import AgendaReservaForm from "./AgendaReservaForm";
import AgendaDetalhe from "./AgendaDetalhe";


function getFirstMondayOfMonth(date) {
  const firstDay = startOfMonth(date);
  const weekDay = getDay(firstDay); 
  return weekDay === 1 ? firstDay : addDays(firstDay, (8 - weekDay) % 7);
}

const HORARIOS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const getUserRole = () => "recepcionista"; 

function mockReservas(startDate) {
  return [
    {
      id: 1,
      tema: "Reunião Financeiro",
      participantes: ["Ana", "Carlos"],
      data: addDays(startDate, 0), 
      horario: "10:00",
      duracao: 60,
    },
    {
      id: 2,
      tema: "Projetos TI",
      participantes: ["Lucas", "Paula"],
      data: addDays(startDate, 2), 
      horario: "15:00",
      duracao: 30,
    },
  ];
}

const MonthButton = forwardRef(function MonthButton({ value, onClick }, ref) {
  return (
    <button ref={ref} className="agenda-calendar-btn" title={value || "Escolher mês"} onClick={onClick}>
      <FaCalendarAlt size={22} />
    </button>
  );
});

export default function AgendaSala() {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);
  const userRole = getUserRole();

  useEffect(() => {
    setReservas(mockReservas(startDate));
  }, [startDate]);

  const handleWeekChange = (inc) => setStartDate(addDays(startDate, inc * 7));

  const handleNewReserva = (dia, hora) => {
    setSelectedSlot({ dia, hora });
    setShowModal(true);
  };

  const handleSaveReserva = (reserva) => {
    setReservas((prev) => [
      ...prev,
      {
        ...reserva,
        id: Date.now(),
      },
    ]);
    setShowModal(false);
    setSelectedSlot(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
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
                <span className="agenda-dia">{format(dia, "EEE", { locale: ptBR })}</span> {" "}
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
                (r) => isSameDay(r.data, dia) && r.horario === hora
              );

              const isLivre = reservasSlot.length === 0;

              return (
                <td key={dIdx} className={`agenda-cell ${isLivre ? "livre" : "ocupado"}`}>
                  {isLivre ? (
                    userRole === "recepcionista" ? (
                      <button
                        className="agenda-slot-btn"
                        title="Reservar"
                        onClick={() => handleNewReserva(dia, hora)}
                      >
                        <FaPlus size={15} />
                      </button>
                    ) : (
                      <span className="agenda-livre">Livre</span>
                    )
                  ) : (
               
                    <button
                      className="agenda-reservado-pill"
                      title={userRole === "recepcionista" ? "Ver detalhes" : "Indisponível"}
                      onClick={() => {
                        if (userRole === "recepcionista") {
                          setReservaSelecionada(reservasSlot[0]);
                        }
                      }}
                      disabled={userRole !== "recepcionista"}
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
          Semana de {format(startDate, "dd/MM/yyyy")} a {format(addDays(startDate, 4), "dd/MM/yyyy")}
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
        {userRole === "recepcionista" && (
          <button className="btn-primary agenda-nova-btn" onClick={() => handleNewReserva(null, null)}>
            <FaPlus className="agenda-plus-icon" /> Nova Reserva
          </button>
        )}
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
              onSave={handleSaveReserva}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {reservaSelecionada && userRole === "recepcionista" && (
        <AgendaDetalhe
          reserva={reservaSelecionada}
          onClose={() => setReservaSelecionada(null)}
          onDelete={(reserva) => {
            setReservas((prev) => prev.filter((r) => r.id !== reserva.id));
            setReservaSelecionada(null);
          }}
        />
      )}
    </div>
  );
}

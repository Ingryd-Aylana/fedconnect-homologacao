import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/AgendaSala.css";

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

export default function AgendaReservaForm({
  initialData = {},
  onSave,
  onCancel,
}) {
  const [tema, setTema] = useState(initialData.tema || "");
  const [participantes, setParticipantes] = useState(
    initialData.participantes?.join(", ") || ""
  );
  const [data, setData] = useState(initialData.data || new Date());
  const [horario, setHorario] = useState(initialData.horario || "08:00");
  const [duracao, setDuracao] = useState(initialData.duracao || 60);
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!tema.trim()) return setErro("Informe o tema da reunião.");
    if (!participantes.trim())
      return setErro("Informe ao menos um participante.");
    if (!data) return setErro("Selecione a data.");
    if (!horario) return setErro("Selecione o horário.");
    if (!duracao || duracao < 15) return setErro("Duração mínima: 15 minutos.");

    onSave({
      tema,
      participantes: participantes
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      data,
      horario,
      duracao: Number(duracao),
    });
  }

  return (
    <form className="agenda-form" onSubmit={handleSubmit}>
      <div className="agenda-form-group">
        <label>Tema da reunião:</label>
        <input
          className="agenda-form-input"
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          maxLength={60}
        />
      </div>
      <div className="agenda-form-group">
        <label>
          Participantes:{" "}
          <span className="agenda-form-hint">(Separe por vírgula)</span>
        </label>
        <input
          className="agenda-form-input"
          type="text"
          value={participantes}
          onChange={(e) => setParticipantes(e.target.value)}
          placeholder="Ex: Ana, João, Maria"
        />
      </div>
      <div className="agenda-form-row">
        <div className="agenda-form-group">
          <label>Data:</label>
          <DatePicker
            selected={data}
            onChange={(date) => setData(date)}
            dateFormat="dd/MM/yyyy"
            className="agenda-form-input"
            minDate={new Date()}
            placeholderText="Selecione a data"
          />
        </div>
        <div className="agenda-form-group">
          <label>Horário:</label>
          <select
            className="agenda-form-input"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          >
            {HORARIOS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div className="agenda-form-group">
          <label>Duração (min):</label>
          <input
            className="agenda-form-input"
            type="number"
            value={duracao}
            min={15}
            max={240}
            step={15}
            onChange={(e) => setDuracao(e.target.value)}
          />
        </div>
      </div>
      {erro && <div className="agenda-form-erro">{erro}</div>}

      <div className="agenda-form-actions">
        <button className="btn-primary" type="submit">
          Salvar
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

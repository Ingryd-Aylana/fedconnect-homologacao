import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/DashboardComercial.css";

export default function GraficoVisitas({ visitas }) {
  
  const dados = [
    { nome: "Agendadas", valor: visitas.filter(v => v.status === "agendada").length },
    { nome: "Realizadas", valor: visitas.filter(v => v.status === "realizada").length },
    { nome: "Canceladas", valor: visitas.filter(v => v.status === "cancelada").length },
  ];

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={dados}>
          <XAxis dataKey="nome" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="valor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

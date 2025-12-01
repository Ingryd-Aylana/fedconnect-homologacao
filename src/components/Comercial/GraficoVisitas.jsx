import React, { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function GraficoVisitas({ visitas }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;
    const update = () => setWidth(el.clientWidth);

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

 const dados = [
  { nome: "Agendadas", valor: visitas.filter(v => v.status && v.status.toLowerCase() === "agendado").length },
  { nome: "Realizadas", valor: visitas.filter(v => v.status && v.status.toLowerCase() === "realizada").length },
  { nome: "Canceladas", valor: visitas.filter(v => v.status && v.status.toLowerCase() === "cancelada").length },
];

  const chartWidth = Math.max(width, 320);  
  const chartHeight = 160;                  

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <BarChart width={chartWidth} height={chartHeight} data={dados}>
        <XAxis dataKey="nome" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="valor" />
      </BarChart>
    </div>
  );
}

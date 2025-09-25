import React, { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function GraficoVisitas({ visitas }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);

  // Medir largura do container e reagir ao resize
  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;
    const update = () => setWidth(el.clientWidth);

    update(); // mede já no mount

    // ResizeObserver (nativo nos browsers modernos)
    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    // fallback no resize da janela
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const dados = [
    { nome: "Agendadas", valor: visitas.filter(v => v.status === "agendada").length },
    { nome: "Realizadas", valor: visitas.filter(v => v.status === "realizada").length },
    { nome: "Canceladas", valor: visitas.filter(v => v.status === "cancelada").length },
  ];

  // Evita render antes de medir
  const chartWidth = Math.max(width, 320);  // largura mínima
  const chartHeight = 160;                  // baixo como no mock

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

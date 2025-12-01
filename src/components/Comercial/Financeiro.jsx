import React, { useMemo, useState } from "react";
import { Download, DollarSign, TrendingUp, Users } from "lucide-react";
import * as XLSX from "xlsx";
import "../styles/Financeiro.css";

const CommissionControl = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2025-10");
  const [selectedCommercial, setSelectedCommercial] = useState("todos");

  const commissionsData = [
    { id: 1, date: "2025-10-15", adm: "Protest", product: "BOAT", value: 5000, commission: 500, commercial: "João Silva" },
    { id: 2, date: "2025-10-12", adm: "Protest", product: "Total Vida", value: 8000, commission: 800, commercial: "Maria Santos" },
    { id: 3, date: "2025-10-10", adm: "Protest", product: "BAPS", value: 2000, commission: 200, commercial: "João Silva" },
    { id: 4, date: "2025-10-08", adm: "Protest", product: "Total Funeral", value: 3000, commission: 300, commercial: "Pedro Costa" },
    { id: 5, date: "2025-10-05", adm: "Protest", product: "Incêndio Conteúdo", value: 5000, commission: 500, commercial: "Maria Santos" },
    { id: 6, date: "2025-10-03", adm: "Protest", product: "Incêndio Conteúdo", value: 4000, commission: 400, commercial: "Pedro Costa" },
    { id: 7, date: "2025-10-28", adm: "Protest", product: "Incêndio Locação", value: 5000, commission: 500, commercial: "João Silva" },
    { id: 8, date: "2025-10-25", adm: "Protest", product: "BAPS", value: 3000, commission: 300, commercial: "Maria Santos" },
  ];

  const commercials = ["João Silva", "Maria Santos", "Pedro Costa"];

  // Filtragem (somente período e comercial)
  const filteredData = useMemo(() => {
    return commissionsData.filter((item) => {
      const periodMatch = item.date.startsWith(selectedPeriod);
      const commercialMatch =
        selectedCommercial === "todos" || item.commercial === selectedCommercial;
      return periodMatch && commercialMatch;
    });
  }, [commissionsData, selectedPeriod, selectedCommercial]);

  // KPIs: Total Comissões, Total Vendas
  const totals = useMemo(() => {
    const totalCommission = filteredData.reduce((s, i) => s + i.commission, 0);
    const totalSales = filteredData.reduce((s, i) => s + i.value, 0);
    const avgCommission =
      filteredData.length > 0 ? totalCommission / filteredData.length : 0;
    return { totalCommission, totalSales, avgCommission };
  }, [filteredData]);

  // Divisão por comercial 
  const commissionByCommercial = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      if (!acc[item.commercial]) {
        acc[item.commercial] = { total: 0, sales: 0, count: 0 };
      }
      acc[item.commercial].total += item.commission;
      acc[item.commercial].sales += item.value;
      acc[item.commercial].count += 1;
      return acc;
    }, {});
  }, [filteredData]);

  // Exportar para Excel 
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        Data: new Date(item.date).toLocaleDateString("pt-BR"),
        Administradora: item.adm,
        Produto: item.product,
        Comercial: item.commercial,
        "Valor Venda": item.value,
        Comissão: item.commission,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comissões");

    // Resumo por Comercial
    const summaryData = Object.entries(commissionByCommercial).map(
      ([name, data]) => ({
        Comercial: name,
        "Total Vendas": data.sales,
        "Total Comissões": data.total,
        "Qtd. Lançamentos": data.count,
      })
    );
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo por Comercial");

    // KPIs
    const kpisSheet = XLSX.utils.json_to_sheet([
      { KPI: "Total Comissões (geral)", Valor: totals.totalCommission },
      { KPI: "Total Vendas", Valor: totals.totalSales },
      { KPI: "Média Comissão", Valor: totals.avgCommission },
      { Filtro: "Período", Valor: selectedPeriod },
      { Filtro: "Comercial", Valor: selectedCommercial },
    ]);
    XLSX.utils.book_append_sheet(workbook, kpisSheet, "KPIs");

    XLSX.writeFile(workbook, `comissoes_${selectedPeriod}.xlsx`);
  };

  return (
    <div className="cc-page">
      <div className="cc-container">
                <div className="cc-header">
          <h1>Controle de Comissões</h1>
        </div>

        {/* Filtros */}
        <div className="cc-card cc-filters">
          <div className="cc-filters-grid">
            <div className="cc-field">
              <label>Período</label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="cc-input"
              />
            </div>

            <div className="cc-field">
              <label>Comercial</label>
              <select
                value={selectedCommercial}
                onChange={(e) => setSelectedCommercial(e.target.value)}
                className="cc-input"
              >
                <option value="todos">Todos</option>
                {commercials.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="cc-actions">
              <button onClick={exportToExcel} className="cc-btn cc-btn-export">
                <Download size={18} />
                Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="cc-grid-2 cc-kpis">
          <div className="cc-card">
            <div className="cc-card-head">
              <span>Total Comissões</span>
              <DollarSign className="cc-icon cc-icon-green" size={22} />
            </div>
            <p className="cc-kpi">
              R$ {totals.totalCommission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="cc-kpi-sub">{filteredData.length} lançamentos</p>
          </div>

          <div className="cc-card">
            <div className="cc-card-head">
              <span>Total Vendas</span>
              <TrendingUp className="cc-icon cc-icon-blue" size={22} />
            </div>
            <p className="cc-kpi">
              R$ {totals.totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="cc-kpi-sub">Valor bruto</p>
          </div>

        </div>

        {/* Divisão por Comercial */}
        <div className="cc-card">
          <div className="cc-section-title">
            <Users size={20} />
            <h2>Divisão por Comercial</h2>
          </div>

          <div className="cc-grid-3">
            {Object.entries(commissionByCommercial).map(([name, data]) => (
              <div key={name} className="cc-box">
                <h3>{name}</h3>
                <div className="cc-box-rows">
                  <div>
                    <span>Vendas:</span>
                    <b>R$ {data.sales.toLocaleString("pt-BR")}</b>
                  </div>
                  <div>
                    <span>Comissões:</span>
                    <b className="cc-green">R$ {data.total.toLocaleString("pt-BR")}</b>
                  </div>
                  <div>
                    <span>Transações:</span>
                    <b>{data.count}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela */}
        {/* <div className="cc-card">
          <div className="cc-table-head">
            <h2>Histórico de Comissões</h2>
          </div>
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Administradora</th>
                  <th>Produto</th>
                  <th>Comercial</th>
                  <th className="cc-right">Valor Venda</th>
                  <th className="cc-right">Comissão</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.date).toLocaleDateString("pt-BR")}</td>
                    <td>{item.adm}</td>
                    <td>{item.product}</td>
                    <td>{item.commercial}</td>
                    <td className="cc-right">R$ {item.value.toLocaleString("pt-BR")}</td>
                    <td className="cc-right cc-green">R$ {item.commission.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="cc-empty">
                Nenhuma comissão encontrada para o período selecionado
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CommissionControl;

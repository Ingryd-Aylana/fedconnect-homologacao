import React, { useState, useMemo } from 'react';
import {
    DollarSign,
    Filter,
    X,
    FileText,
    CheckCircle
} from 'lucide-react';
import '../styles/ComissaoComercial.css';
import * as XLSX from 'xlsx'

// Dados mockados
const comissoesData = {
    mesAtual: {
        total: 4550.0,
        vendas: 28,
        status: 'em_andamento',
    },
    mesAnterior: {
        total: 5230.0,
        vendas: 32,
        status: 'pago',
    },
    historico: [
        { mes: 'Out/2025', valor: 5230, vendas: 32, status: 'pago' },
        { mes: 'Set/2025', valor: 4890, vendas: 29, status: 'pago' },
        { mes: 'Ago/2025', valor: 5120, vendas: 31, status: 'pago' },
        { mes: 'Jul/2025', valor: 4760, vendas: 28, status: 'pago' },
    ],
};

const handleExportMes = (item) => {
    // monta uma planilha apenas com o mês selecionado
    const rows = [{
        Período: item.mes,
        Valor: item.valor,
        Vendas: item.vendas,
        Status: item.status,
    }];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mês');

    const slug = item.mes.replace(/\//g, '-').toLowerCase(); 
    XLSX.writeFile(wb, `comissao_${slug}.xlsx`);
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        em_andamento: { label: 'Em Andamento', class: 'status-warning' },
        pago: { label: 'Pago', class: 'status-success' },
        aguardando: { label: 'Aguardando', class: 'status-info' },
        em_analise: { label: 'Em Análise', class: 'status-warning' },
    };
    const config = statusConfig[status] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
};

const DashboardCard = ({ title, value, subtitle, icon: Icon, colorClass, onClick, badge }) => {
    return (
        <div className={`card ${onClick ? 'card-clickable' : ''}`} onClick={onClick}>
            <div className="card-header">
                <div className={`card-icon ${colorClass}`}>
                    <Icon size={24} />
                </div>
                {badge && <StatusBadge status={badge} />}
            </div>

            <div className="card-body">
                <h3 className="card-title">{title}</h3>
                <div className="card-value">{value}</div>
                {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
        </div>
    );
};

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasFilters = Boolean(filters.periodo || filters.status);

    return (
        <div className="filter-wrapper">
            <button
                className={`filter-btn ${hasFilters ? 'filter-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <Filter size={18} />
                <span>Filtros</span>
                {hasFilters && <span className="filter-indicator" />}
            </button>

            {isOpen && (
                <>
                    <div className="filter-overlay" onClick={() => setIsOpen(false)} />
                    <div className="filter-panel">
                        <div className="filter-header">
                            <h3>Filtros</h3>
                            <button onClick={() => setIsOpen(false)} className="close-btn" type="button">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="filter-body">
                            <div className="filter-group">
                                <label>Período</label>
                                <select
                                    value={filters.periodo}
                                    onChange={(e) => onFilterChange('periodo', e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="mes_atual">Mês Atual</option>
                                    <option value="mes_anterior">Mês Anterior</option>
                                    <option value="trimestre">Último Trimestre</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => onFilterChange('status', e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="pago">Pago</option>
                                    <option value="em_andamento">Em Andamento</option>
                                </select>
                            </div>

                            {hasFilters && (
                                <button onClick={onClearFilters} className="clear-btn" type="button">
                                    Limpar Filtros
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default function DashboardComissoes() {
    const [filters, setFilters] = useState({ periodo: '', status: '' });
    const [selectedView, setSelectedView] = useState(null);

    const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
    const handleClearFilters = () => setFilters({ periodo: '', status: '' });
    const handleCardClick = (view) => setSelectedView(view);

    const filteredData = useMemo(() => comissoesData, [filters]);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard de Comissões</h1>
                <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            </div>

            <div className="cards-grid">
                <DashboardCard
                    title="Comissão Mês Atual"
                    value={filteredData.mesAtual.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    subtitle={`${filteredData.mesAtual.vendas} vendas realizadas`}
                    icon={DollarSign}
                    colorClass="icon-green"
                    badge="em_andamento"
                    onClick={() => handleCardClick('/detalhes-comissao')}
                />

                <DashboardCard
                    title="Comissão Anterior"
                    value={filteredData.mesAnterior.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    subtitle={`${filteredData.mesAnterior.vendas} vendas • Out/2025`}
                    icon={CheckCircle}
                    colorClass="icon-blue"
                    badge="pago"
                    onClick={() => handleCardClick('/historico-comissao')}
                />
            </div>

            <div className="tables-grid">
                <div className="table-section">
                    <div className="table-header">
                        <div className="table-icon">
                            <FileText size={20} />
                        </div>
                        <h3 className="table-title">Histórico Recente</h3>
                    </div>

                    <div className="table">
                        {filteredData.historico.map((item, idx) => (
                            <div key={idx} className="table-row table-row--with-action">
                                <div className="table-cell">
                                    <span className="table-cell-label">Período</span>
                                    <span className="table-cell-value">{item.mes}</span>
                                </div>

                                <div className="table-cell">
                                    <span className="table-cell-label">Valor</span>
                                    <span className="table-cell-value">
                                        {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>

                                <div className="table-cell">
                                    <span className="table-cell-label">Vendas</span>
                                    <span className="table-cell-value">{item.vendas}</span>
                                </div>

                                <div className="table-cell table-cell-action">
                                    <button
                                        type="button"
                                        className="btn-row-export"
                                        onClick={() => handleExportMes(item)}
                                    >
                                        Baixar Excel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {selectedView && (
                <div className="modal-overlay" onClick={() => setSelectedView(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                      
                    </div>
                </div>
            )}
        </div>
    );
}

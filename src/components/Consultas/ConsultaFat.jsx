import React, { useState } from 'react';
import "../styles/ConsultaFat.css";
import { ConsultaService } from '../../services/consultaService';

const ConsultaFatura = () => {
    const [fatura, setFatura] = useState('');
    const [resultado, setResultado] = useState(null);
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConsulta = async (e) => {
        e.preventDefault();
        setErro('');
        setResultado(null);

        if (!fatura) {
            setErro('Preencha o número da fatura para consultar.');
            return;
        }

        setLoading(true);

        const payload = {
            tipo_consulta: "faturas",
            parametro_consulta: JSON.stringify({ fatura_id: fatura }),
            origem: "manual"
        };

        try {
            const resposta = await ConsultaService.getfatura(payload);

            if (resposta.resultado_api && resposta.resultado_api.length > 0) {
                setResultado(resposta.resultado_api[0]);
            } else {
                setErro('Nenhuma fatura encontrada com o ID fornecido.');
            }
        } catch (err) {
            const msgErro = err.response?.data?.detail || 'Erro ao consultar faturas. Tente novamente.';
            setErro(msgErro);
        } finally {
            setLoading(false);
        }
    };

    const formatarValor = (valor) => {
        return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatarData = (dataString) => {
    if (!dataString) return '-';
    let datePart;
    if (dataString.includes('T')) {
        [datePart] = dataString.split('T');
    } else {
        datePart = dataString;
    }
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) {
        return '-';
    }
    const localDate = new Date(year, month - 1, day);
    if (isNaN(localDate.getTime())) {
        return '-';
    }

    return localDate.toLocaleDateString('pt-BR');
};

    return (
        <div className="consulta-fatura-container">
            <h1 className="consultas-title">
                <i className="bi-clipboard-data"></i> Consulta de Faturas
            </h1>
            <form className="form-fatura" onSubmit={handleConsulta}>
                <div className="form-group">
                    <label htmlFor="fatura"
                        id="fatura">
                        Fatura:
                    </label>
                    <input
                        type="text"
                        id="fatura"
                        name="fatura"
                        value={fatura}
                        onChange={(e) => setFatura(e.target.value)}
                        placeholder="Digite o número da fatura"
                    />
                </div>
                {erro && <div className="erro-msg">{erro}</div>}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Consultando...' : 'Consultar'}
                </button>
            </form>
            {resultado && (
                <div className="resultado-fatura">
                    <h3 className='title-consulta'>Fatura #{resultado.FATURA}</h3>
                    <div className="resultado-dados">
                        <div className="campo longo">
                            <strong>Administradora:</strong>
                            <span>{resultado.ADMINISTRADORA_NOME ||
                                resultado.ADMINISTRADORA || "Não encontrado"}</span>
                        </div>

                        <div className="campo"><strong>Apólice:</strong> {resultado.APOLICE}</div>
                        <div className="campo"><strong>Prêmio Bruto:</strong> R$ {formatarValor(resultado.PREMIO_BRUTO)}</div>
                        <div className="campo"><strong>Devolução:</strong> R$ {formatarValor(resultado.DEVOLUCAO)}</div>
                        <div className="campo longo">
                            <strong>Corretor:</strong>
                            <span>{resultado.CORRETOR_NOME || "Não encontrado"}</span>
                        </div>
                        <div className="campo"><strong>Comissão:</strong> {formatarValor(resultado.COMISSAO)}%</div>
                        <div className="campo longo">
                            <strong>Corretor 2:</strong>
                            <span>{resultado.CORRETOR2_NOME || "Não encontrado"}</span>
                        </div>
                        <div className="campo"><strong>Comissão 2:</strong> {(resultado.COMISSAO2)} %</div>
                        <div className="campo"><strong>Data da Fatura:</strong> {formatarData(resultado.DATA_FAT)}</div>
                        <div className="campo">
                            <strong>Status: </strong>
                            <span className="status-badge">
                                {resultado.STATUS ? resultado.STATUS : 'Indefinido'}
                            </span>
                        </div>
                        <div className="campo"><strong>Início Vigência:</strong> {formatarData(resultado.DT_INI_VIG)}</div>
                        <div className="campo"><strong>Fim Vigência:</strong> {formatarData(resultado.DT_FIM_VIG)}</div>

                        
                        {resultado.DT_CANCEL && (
                            <div>
                                <strong>Data Cancelamento:</strong> {formatarData(resultado.DT_CANCEL)}
                                {resultado.OBS_CANCEL && (
                                    <span style={{ marginLeft: 8, color: "#d21a1a" }}>
                                        ({resultado.OBS_CANCEL})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultaFatura;
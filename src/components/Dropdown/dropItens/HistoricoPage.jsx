import React, { useState, useEffect } from 'react';
import '../../styles/HistoricoPage.css';
import { ConsultaService } from '../../../services/consultaService';
import { useAuth } from '../../../context/AuthContext';

const HistoricoConsulta = () => {
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConsultaId, setSelectedConsultaId] = useState(null);
  const [detalhesConsulta, setDetalhesConsulta] = useState(null);
  const [detalhesLoading, setDetalhesLoading] = useState(false);
  const [detalhesError, setDetalhesError] = useState('');
  const { user } = useAuth();
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(20); 
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);

  useEffect(() => {
    const fetchHistorico = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        if (
          user &&
          (user.nivel_acesso === "admin" ||
            user.nivel_acesso === "moderador" ||
            user.nivel_acesso === "usuario" ||
            user.nivel_acesso === "comercial")
        ) {
          data = await ConsultaService.getConsultaHistory(pagina, porPagina);
        } else {
          setError('Usuário não autenticado ou sem permissão para ver o histórico.');
          setLoading(false);
          return;
        }
        setConsultas(data.results || data);
        setTotalResultados(data.count || (data.results ? data.results.length : 0));
        if (data.count) {
          setTotalPaginas(Math.max(1, Math.ceil(data.count / porPagina)));
        } else {
          setTotalPaginas(1);
        }
      } catch (err) {
        setError('Não foi possível carregar o histórico de consultas.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistorico();
  }, [user, pagina, porPagina]);

  const handleItemClick = async (consultaId) => {
    if (selectedConsultaId === consultaId) {
      setSelectedConsultaId(null);
      setDetalhesConsulta(null);
      return;
    }

    setSelectedConsultaId(consultaId);
    setDetalhesLoading(true);
    setDetalhesError('');
    setDetalhesConsulta(null);
    try {
      const data = await ConsultaService.getHistoryByID(consultaId);
      setDetalhesConsulta(data);
    } catch (err) {
      setDetalhesError('Não foi possível carregar os detalhes desta consulta.');
    } finally {
      setDetalhesLoading(false);
    }
  };

  const consultasFiltradas = consultas.filter((consulta) => {
    const termo = filtro.toLowerCase();
    return (
      (consulta.tipo_consulta_display || consulta.tipo_consulta || '').toLowerCase().includes(termo) ||
      (consulta.parametro_consulta || '').toLowerCase().includes(termo) ||
      (consulta.usuario_email || '').toLowerCase().includes(termo)
    );
  });

  function getParametroDisplay(consulta, detalhes = null) {
    const tiposChave = [
      'cpf_alternativa',
      'cnpj_razao_social',
      'cep_rua_cidade'
    ];
    if (tiposChave.includes(consulta.tipo_consulta)) {
      if (detalhes && detalhes.resultado && detalhes.resultado.Result && detalhes.resultado.Result.length > 0) {
        if (detalhes.resultado.Result[0].BasicData && detalhes.resultado.Result[0].BasicData.Name) {
          return detalhes.resultado.Result[0].BasicData.Name;
        }
        if (detalhes.resultado.Result[0].BasicData && detalhes.resultado.Result[0].BasicData.OfficialName) {
          return detalhes.resultado.Result[0].BasicData.OfficialName;
        }
      }
      if (detalhes && detalhes.resultado && detalhes.resultado.resultados_viacep && detalhes.resultado.resultados_viacep.length > 0) {
        return detalhes.resultado.resultados_viacep[0].logradouro || detalhes.resultado.resultados_viacep[0].cep || 'Endereço encontrado';
      }
      if (
        detalhes &&
        ((detalhes.resultado &&
          ((detalhes.resultado.Result && detalhes.resultado.Result.length === 0) ||
            (detalhes.resultado.resultados_viacep && detalhes.resultado.resultados_viacep.length === 0))) ||
          !detalhes.resultado)
      ) {
        return 'Pesquisa falhou';
      }
      try {
        const param = typeof consulta.parametro_consulta === 'string'
          ? JSON.parse(consulta.parametro_consulta)
          : consulta.parametro_consulta;
        if (param && param.q) return param.q;
        if (param && param.name) return param.name;
        return 'Chaves alternativas';
      } catch {
        return 'Chaves alternativas';
      }
    }
    return consulta.parametro_consulta;
  }

  const renderPagination = () => (
    <div className="pagination-bar">
      <button
        onClick={() => setPagina(p => Math.max(1, p - 1))}
        disabled={pagina === 1}
      >Anterior</button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button
        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
        disabled={pagina === totalPaginas}
      >Próxima</button>
      <span className="total-registros">Total: {totalResultados}</span>
    </div>
  );

  return (
    <div className="historico-container">
      <h1 className="historico-title">
        <i className="bi bi-search"></i> Histórico de Consultas
      </h1>

      <input
        type="text"
        placeholder='Buscar por tipo, parâmetro ou email...'
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className='input-pesquisa'
      />

      {loading && <p className="loading-message">Carregando histórico...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && consultas.length === 0 && (
        <p className="sem-consultas">Nenhuma consulta encontrada no histórico.</p>
      )}

      {!loading && !error && consultas.length > 0 && (
        <>
          {consultasFiltradas.length === 0 ? (
            <p className="sem-consultas">Nenhum resultado encontrado para esse filtro.</p>
          ) : (
            <table className="historico-table">
              <thead>
                <tr>
                  <th>Tipo de Consulta</th>
                  <th>Parâmetro</th>
                  <th>Realizada por</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {consultasFiltradas.map((consulta) => (
                  <React.Fragment key={consulta.id}>
                    <tr
                      className={selectedConsultaId === consulta.id ? 'active-row' : ''}
                      onClick={() => handleItemClick(consulta.id)}
                    >
                      <td data-label="Tipo de Consulta">{consulta.tipo_consulta_display || consulta.tipo_consulta}</td>
                      <td data-label="Parâmetro">{getParametroDisplay(consulta)}</td>
                      <td data-label="Realizada por">{consulta.usuario_email || 'N/A'}</td>
                      <td data-label="Data">{new Date(consulta.data_consulta).toLocaleDateString()}</td>
                      <td data-label="" className="expand-icon">
                        <i className={`bi ${selectedConsultaId === consulta.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </td>
                    </tr>

                    {selectedConsultaId === consulta.id && (
                      <tr>
                        <td colSpan="5">
                          <div className="detalhes-historico-panel">
                            {detalhesLoading && <p className="detalhes-loading">Carregando detalhes...</p>}
                            {detalhesError && <p className="detalhes-error">{detalhesError}</p>}

                            {detalhesConsulta && detalhesConsulta.resultado && detalhesConsulta.resultado.Result && detalhesConsulta.resultado.Result.length > 0 ? (
                              <div className="detalhes-content">
                                <h4>Detalhes da Consulta #{detalhesConsulta.id}</h4>
                                <p><strong>Tipo:</strong> {detalhesConsulta.tipo_consulta_display || detalhesConsulta.tipo_consulta}</p>
                                <p><strong>Parâmetro:</strong> {getParametroDisplay(consultasFiltradas.find(c => c.id === detalhesConsulta.id) || detalhesConsulta, detalhesConsulta)}</p>
                                <p><strong>Data/Hora Completa:</strong> {new Date(detalhesConsulta.data_consulta).toLocaleString()}</p>
                                <p><strong>Realizada por:</strong> {detalhesConsulta.usuario_email || 'N/A'}</p>
                                <p><strong>Origem:</strong> {detalhesConsulta.origem}</p>
                                <p><strong>Tempo de Resposta:</strong> {detalhesConsulta.resultado.ElapsedMilliseconds || 'N/A'} ms</p>

                                <div className="resultado-box">
                                  <h5>Resultado da Consulta:</h5>
                                  {detalhesConsulta.resultado.Result[0].BasicData && (
                                    <>
                                      <p><strong>Nome:</strong> {detalhesConsulta.resultado.Result[0].BasicData.Name || 'N/A'}</p>
                                      <p><strong>Situação Cadastral:</strong> {detalhesConsulta.resultado.Result[0].BasicData.TaxIdStatus || 'N/A'}</p>
                                      <p><strong>Data de Nascimento:</strong> {detalhesConsulta.resultado.Result[0].BasicData.CapturedBirthDateFromRFSource || 'N/A'}</p>
                                      <p><strong>Nome da Mãe:</strong> {detalhesConsulta.resultado.Result[0].BasicData.MotherName || 'N/A'}</p>
                                    </>
                                  )}
                                  {detalhesConsulta.resultado.Result[0].MatchKeys && (
                                    <p><strong>Chave de Correspondência:</strong> {detalhesConsulta.resultado.Result[0].MatchKeys}</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="no-data-message">Nenhum resultado detalhado disponível para esta consulta.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default HistoricoConsulta;

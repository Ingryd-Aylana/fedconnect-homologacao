import React, { useState, useEffect } from 'react';
import '../../styles/Conta.css';
import { Link } from 'react-router-dom';
import { UserService } from '../../../services/userService';

const ConfigConta = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [mostrarModalExclusao, setMostrarModalExclusao] = useState(false);
    const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const [filtroBusca, setFiltroBusca] = useState('');

    const [nomeEditado, setNomeEditado] = useState('');
    const [emailEditado, setEmailEditado] = useState('');
    const [nivelAcessoEditado, setNivelAcessoEditado] = useState('');
    const [empresaEditada, setEmpresaEditada] = useState('');
    const [isFedEditado, setIsFedEditado] = useState(false);

    const [pagina, setPagina] = useState(1);
    const [porPagina, setPorPagina] = useState(15); // Pode mudar o tamanho
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalResultados, setTotalResultados] = useState(0);

    const fetchUsuarios = async () => {
        try {
            const response = await UserService.getAllUsers(pagina, porPagina, filtroBusca);
            setUsuarios(response.results || response);
            setTotalResultados(response.count || (response.results ? response.results.length : 0));
            if (response.count) {
                setTotalPaginas(Math.max(1, Math.ceil(response.count / porPagina)));
            } else {
                setTotalPaginas(1);
            }
        } catch (error) {
            setMensagemErro("Erro ao carregar usuários. Tente novamente.");
            setTimeout(() => setMensagemErro(''), 5000);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        // eslint-disable-next-line
    }, [pagina, porPagina, filtroBusca]); // Atualiza na troca de página, filtro ou limite

    const exibirMensagem = (tipo, mensagem) => {
        if (tipo === 'sucesso') {
            setMensagemSucesso(mensagem);
            setTimeout(() => setMensagemSucesso(''), 4000);
        } else if (tipo === 'erro') {
            setMensagemErro(mensagem);
            setTimeout(() => setMensagemErro(''), 5000);
        }
    };

    const abrirModalExclusao = (usuario) => {
        setUsuarioSelecionado(usuario);
        setMostrarModalExclusao(true);
    };

    const confirmarExclusao = async () => {
        if (!usuarioSelecionado) return;
        try {
            await UserService.deleteUser(usuarioSelecionado.id);
            exibirMensagem('sucesso', `Usuário ${usuarioSelecionado.nome_completo} excluído com sucesso!`);
            setMostrarModalExclusao(false);
            fetchUsuarios();
        } catch (error) {
            exibirMensagem('erro', `Erro ao excluir usuário ${usuarioSelecionado.nome_completo}.`);
            setMostrarModalExclusao(false);
        }
    };

    const abrirModalEdicao = (usuario) => {
        setUsuarioSelecionado(usuario);
        setNomeEditado(usuario.nome_completo);
        setEmailEditado(usuario.email);
        setNivelAcessoEditado(usuario.nivel_acesso);
        setEmpresaEditada(usuario.empresa?.id || '');
        setIsFedEditado(usuario.is_fed);
        setMostrarModalEdicao(true);
    };

    const confirmarEdicao = async () => {
        if (!usuarioSelecionado) return;
        try {
            const dadosAtualizados = {
                nome_completo: nomeEditado,
                email: emailEditado,
                nivel_acesso: nivelAcessoEditado,
                empresa: empresaEditada,
                is_fed: isFedEditado,
            };
            await UserService.updateUser(usuarioSelecionado.id, dadosAtualizados);
            exibirMensagem('sucesso', `Usuário ${nomeEditado} atualizado com sucesso!`);
            setMostrarModalEdicao(false);
            fetchUsuarios();
        } catch (error) {
            const errorData = error.response?.data;
            let errorMessage = "Erro ao atualizar usuário. Verifique os dados.";
            if (errorData) {
                if (errorData.email) errorMessage = `Erro no E-mail: ${errorData.email.join(', ')}`;
                else if (errorData.nome_completo) errorMessage = `Erro no Nome: ${errorData.nome_completo.join(', ')}`;
                else if (errorData.nivel_acesso) errorMessage = `Erro na Função: ${errorData.nivel_acesso.join(', ')}`;
                else if (errorData.empresa) errorMessage = `Erro na Empresa: ${errorData.empresa.join(', ')}`;
                else if (errorData.detail) errorMessage = errorData.detail;
                else if (typeof errorData === 'object') errorMessage = JSON.stringify(errorData);
                else errorMessage = errorData;
            }
            exibirMensagem('erro', errorMessage);
            setMostrarModalEdicao(false);
        }
    };

    const niveisAcesso = ["admin", "usuario", "comercial", "moderador"];

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
        <div className="conta-container">
            <main className="conta-content">
                <div className="config-card-user">
                    <div className="card-header">
                        <h2>
                            <i className="bi bi-people"></i> Gerenciar Usuários
                        </h2>
                        <div className="header-actions">
                            <Link to="/cadastro" className="btn btn-primary">
                                <i className="bi bi-person-plus-fill"></i> Novo Usuário
                            </Link>
                        </div>
                    </div>
                    {mensagemSucesso && (
                        <div className="alert alert-sucesso">{mensagemSucesso}</div>
                    )}
                    {mensagemErro && (
                        <div className="alert alert-erro">{mensagemErro}</div>
                    )}

                    <div className="search-bar">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail"
                            value={filtroBusca}
                            onChange={e => {
                                setPagina(1); // Sempre volta pra página 1 ao buscar
                                setFiltroBusca(e.target.value)
                            }}
                        />
                    </div>

                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Função</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.nome_completo}</td>
                                    <td>{usuario.email}</td>
                                    <td>
                                        <span className="badge">
                                            {usuario.nivel_acesso || 'Usuário'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={() => abrirModalEdicao(usuario)}
                                            title="Editar usuário"
                                        >
                                            <i className="bi bi-pencil-square text-primary"></i>
                                        </button>
                                        {usuario.id !== usuarios[0]?.id && (
                                            <button
                                                className="btn-icon"
                                                onClick={() => abrirModalExclusao(usuario)}
                                                title="Excluir usuário"
                                            >
                                                <i className="bi bi-trash text-danger"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {renderPagination()}
                </div>

                {mostrarModalExclusao && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Confirmar Exclusão</h3>
                            <p>
                                Tem certeza que deseja excluir
                                <strong> {usuarioSelecionado?.nome_completo}</strong>?
                            </p>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setMostrarModalExclusao(false)}>
                                    Cancelar
                                </button>
                                <button className="btn btn-secondary" onClick={confirmarExclusao}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEdicao && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Editar Usuário</h3>
                            <label>Nome completo:</label>
                            <input
                                type="text"
                                value={nomeEditado}
                                onChange={(e) => setNomeEditado(e.target.value)}
                            />
                            <label>E-mail:</label>
                            <input
                                type="email"
                                value={emailEditado}
                                onChange={(e) => setEmailEditado(e.target.value)}
                            />
                            <label>Função:</label>
                            <select
                                value={nivelAcessoEditado}
                                onChange={(e) => setNivelAcessoEditado(e.target.value)}
                            >
                                {niveisAcesso.map(nivel => (
                                    <option key={nivel} value={nivel}>
                                        {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <div className="modal-actions">
                                <button className="btn btn-primary" onClick={() => setMostrarModalEdicao(false)}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={confirmarEdicao}>
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ConfigConta;

import React, { useState, useEffect } from 'react';
import { UserService } from '../../../services/userService';
import { CompanyService } from '../../../services/companyService'; 
import '../../styles/Cadastro.css';
import { Link } from 'react-router-dom';

function Cadastro() {
    const [activeTab, setActiveTab] = useState('cadastro');
    const [novoUsuario, setNovoUsuario] = useState({
        nome_completo: '',
        email: '',
        nivelAcesso: '',
        senha: '',
        empresa: '' 
    });
    const [empresas, setEmpresas] = useState([]); 
    const [erroCadastro, setErroCadastro] = useState('');
    const [sucessoCadastro, setSucessoCadastro] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await CompanyService.getAllCompanies(); 
                setEmpresas(response.results || response);
                if (response.results && response.results.length > 0) {
                    const fedcorp = response.results.find(emp => emp.nome === 'Fedcorp');
                    setNovoUsuario(prev => ({
                        ...prev,
                        empresa: fedcorp ? fedcorp.id : response.results[0].id
                    }));
                }
            } catch (error) {
                console.error('Erro ao carregar empresas:', error);
                setErroCadastro('Erro ao carregar a lista de empresas.');
            }
        };

        fetchCompanies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNovoUsuario(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErroCadastro('');
        setSucessoCadastro('');

        try {
            const payload = {
                nome_completo: novoUsuario.nome_completo,
                email: novoUsuario.email,
                nivel_acesso: novoUsuario.nivelAcesso,
                password: novoUsuario.senha,
                empresa: novoUsuario.empresa, 
                is_fed: true
            };

            const response = await UserService.registerUser(payload);
            console.log('Usuário cadastrado com sucesso:', response);
            setSucessoCadastro(`Usuário "${response.nome_completo || response.email}" cadastrado com sucesso!`);

            setNovoUsuario({
                nome_completo: '',
                email: '',
                nivelAcesso: '',
                senha: '',
                empresa: empresas.length > 0 ? empresas[0].id : ''
            });

            setTimeout(() => setSucessoCadastro(''), 5000);

        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            const errorData = error.response?.data;
            let mensagem = 'Erro ao cadastrar usuário. Verifique os dados e tente novamente.';

            if (errorData) {
                if (errorData.email) {
                    mensagem = `Erro no E-mail: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`;
                } else if (errorData.password) {
                    mensagem = `Erro na Senha: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`;
                } else if (errorData.empresa) {
                    mensagem = `Erro na Empresa: ${Array.isArray(errorData.empresa) ? errorData.empresa.join(', ') : errorData.empresa}`;
                }
                 else if (errorData.detail) {
                    mensagem = `Erro: ${errorData.detail}`;
                } else if (typeof errorData === 'object') {
                  
                    mensagem = `Erro: ${JSON.stringify(errorData)}`;
                } else {
                    mensagem = `Erro: ${errorData}`;
                }
            }
            setErroCadastro(mensagem);
            setTimeout(() => setErroCadastro(''), 7000);
        }
    };

    return (
        <main className="cadastro-container">
            <h1 className="cadastro-title">
            <i className="bi bi-tools"></i> Configurações da Plataforma
            </h1>

            <div className="cadastro-layout">
                <section className="cadastro-card">
                    <h2 className="section-title">
                        <i className="bi bi-person-circle"></i> Cadastrar Usuário
                    </h2>

                    <form className="cadastro-form" onSubmit={handleSubmit} style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="nome_completo">Nome Completo</label>
                            <input
                                type="text"
                                id="nome_completo"
                                name="nome_completo"
                                value={novoUsuario.nome_completo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={novoUsuario.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="senha">Senha</label>
                            <input
                                type="password"
                                id="senha"
                                name="senha"
                                value={novoUsuario.senha}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nivelAcesso">Tipo de usuário</label>
                            <select
                                id="nivelAcesso"
                                name="nivelAcesso"
                                value={novoUsuario.nivelAcesso}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione o tipo de usuário</option>
                                <option value="admin">Administrador</option>
                                <option value="usuario">Usuário</option>
                                <option value="comercial">Comercial</option>
                                <option value="moderador">Moderador</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="empresa">Empresa</label>
                            <select
                                id="empresa"
                                name="empresa"
                                value={novoUsuario.empresa}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione uma empresa</option>
                                {empresas.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {erroCadastro && (
                            <div className="mensagem-erro">
                                <i className="bi bi-exclamation-circle-fill"></i> {erroCadastro}
                            </div>
                        )}
                        {sucessoCadastro && (
                            <div className="mensagem-sucesso">
                                <i className="bi bi-check-circle-fill"></i> {sucessoCadastro}
                            </div>
                        )}

                        <button type="submit" className="btn-submit">
                            <i className="bi bi-save-fill"></i> Salvar
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}

export default Cadastro;
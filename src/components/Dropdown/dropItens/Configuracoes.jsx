import React, { useState, useEffect } from 'react';
import '../../styles/Config.css';
import { UserService } from '../../../services/userService';

const Config = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);

  const [userId, setUserId] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmaSenha, setShowConfirmaSenha] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await UserService.getMe();
        setUserId(data.id);
        setNomeCompleto(data.nome_completo || '');
        setEmail(data.email || '');
        setCpf(data.cpf || '');
      } catch (error) {
        setErrorMessage('Erro ao carregar seus dados. Por favor, tente novamente.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    };
    fetchUserData();
  }, []);

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!userId) {
      setErrorMessage('ID do usuário não encontrado para atualização.');
      return;
    }
    try {
      const updatedData = {
        nome_completo: nomeCompleto,
        cpf: cpf,
        email: email,
      };
      await UserService.updateUser(userId, updatedData);
      setSuccessMessage('Dados da conta atualizados com sucesso!');
      setEditandoPerfil(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorDetail = error.response?.data?.detail || error.response?.data?.email || error.message || 'Erro ao atualizar os dados. Tente novamente.';
      setErrorMessage(`Erro: ${errorDetail}`);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleSalvarSenha = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!userId) {
      setErrorMessage('ID do usuário não encontrado para alteração de senha.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErrorMessage('A nova senha e a confirmação de senha não coincidem.');
      return;
    }
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErrorMessage('Por favor, preencha todos os campos de senha.');
      return;
    }
    try {
      await UserService.changePassword(userId, {
        current_password: senhaAtual,
        new_password: novaSenha,
      });
      setSuccessMessage('Senha alterada com sucesso!');
      setEditandoSenha(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorDetail = error.response?.data?.detail || error.response?.data?.current_password || error.response?.data?.new_password || error.message || 'Erro ao alterar a senha. Verifique a senha atual e tente novamente.';
      setErrorMessage(`Erro: ${errorDetail}`);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className="config-container">
    <h1 className="configuracoes-title">
      <i className="bi bi-tools"></i> Configurações da Conta
    </h1>
      <div className="config-form">
        <div className="tab-abas">
          <button className={activeTab === 'perfil' ? 'tab-aba active' : 'tab-aba'} onClick={() => setActiveTab('perfil')}>
            <i className="bi bi-person-circle"></i> Perfil
          </button>
          <button className={activeTab === 'senha' ? 'tab-aba active' : 'tab-aba'} onClick={() => setActiveTab('senha')}>
            <i className="bi bi-lock"></i> Alterar Senha
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            <i className="bi bi-check-circle-fill"></i> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="error-message">
            <i className="bi bi-exclamation-circle-fill"></i> {errorMessage}
          </div>
        )}

        {activeTab === 'perfil' ? (
          <>
            <h3><i className="bi bi-gear"></i> Editar Conta</h3>
            <form onSubmit={handleSalvarPerfil}>
              <label>Nome Completo:</label>
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                disabled={!editandoPerfil}
                className={editandoPerfil ? 'editando' : ''}
                placeholder="Nome do Usuário"
              />
              <label>CPF:</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                disabled={!editandoPerfil}
                className={editandoPerfil ? 'editando' : ''}
                placeholder="Número do CPF"
              />
              <label>E-mail:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editandoPerfil}
                className={editandoPerfil ? 'editando' : ''}
                placeholder="E-mail do Usuário"
              />
              <div className="button-group">
                <button type="button" className="btn danger" onClick={() => setEditandoPerfil(true)}>
                  <i className="bi bi-pencil"></i> Editar
                </button>
                {editandoPerfil && (
                  <button type="submit" className="btn primary">
                    <i className="bi bi-save"></i> Salvar
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <>
            <h3><i className="bi bi-key"></i> Alterar Senha</h3>
            <form onSubmit={handleSalvarSenha}>
              <label>Senha Atual:</label>
              <div className="input-with-icon">
                <input
                  type={showSenhaAtual ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  disabled={!editandoSenha}
                  className={editandoSenha ? 'editando' : ''}
                  placeholder="Senha Atual"
                />
                <i className={`bi ${showSenhaAtual ? 'bi-eye-slash' : 'bi-eye'}`} onClick={() => setShowSenhaAtual(!showSenhaAtual)} />
              </div>
              <label>Nova Senha:</label>
              <div className="input-with-icon">
                <input
                  type={showNovaSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  disabled={!editandoSenha}
                  className={editandoSenha ? 'editando' : ''}
                  placeholder="Nova Senha"
                />
                <i className={`bi ${showNovaSenha ? 'bi-eye-slash' : 'bi-eye'}`} onClick={() => setShowNovaSenha(!showNovaSenha)} />
              </div>
              <label>Confirmar Senha:</label>
              <div className="input-with-icon">
                <input
                  type={showConfirmaSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={!editandoSenha}
                  className={editandoSenha ? 'editando' : ''}
                  placeholder="Confirmar Nova Senha"
                />
                <i className={`bi ${showConfirmaSenha ? 'bi-eye-slash' : 'bi-eye'}`} onClick={() => setShowConfirmaSenha(!showConfirmaSenha)} />
              </div>
              <div className="button-group">
                <button type="button" className="btn danger" onClick={() => setEditandoSenha(true)}>
                  <i className="bi bi-pencil"></i> Editar
                </button>
                {editandoSenha && (
                  <button type="submit" className="btn primary">
                    <i className="bi bi-save"></i> Salvar
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Config;

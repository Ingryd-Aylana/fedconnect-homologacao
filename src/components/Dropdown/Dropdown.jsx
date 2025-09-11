import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dropdown.css';
import { useAuth } from '../../context/AuthContext';

const Dropdown = ({ sidebarOpen = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const nivelAcesso = user?.nivel_acesso;

  const handleLogout = () => {
    setIsOpen(false);
    logout(); 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((v) => !v);

  return (
    <div className={`dropdown-opcoes sidebar-dropdown${sidebarOpen ? "" : " collapsed"}`} ref={dropdownRef}>
      <button className="dropdown-btn" type="button" onClick={toggleDropdown} title="Opções">
        <i className="bi bi-three-dots-vertical"></i>
        {sidebarOpen && <span>Opções</span>}
      </button>

      <ul className={`dropdown-content${isOpen ? " show" : ""}`}>
        {["admin", "usuario", "moderador", "comercial", "administradora"].includes(nivelAcesso) && (
          <>
            <li>
              <Link to="/config" className="dropdown-item" onClick={() => setIsOpen(false)}>
                <i className="bi bi-person-circle"></i> Conta
              </Link>
            </li>
            <li>
              <Link to="/historico" className="dropdown-item" onClick={() => setIsOpen(false)}>
                <i className="bi bi-clock-history"></i> Histórico
              </Link>
            </li>
          </>
        )}
        {nivelAcesso === 'admin' && (
          <>
            <li>
              <Link to="/conta" className="dropdown-item" onClick={() => setIsOpen(false)}>
                <i className="bi bi-gear"></i> Configurações
              </Link>
            </li>
            <li>
              <Link to="/cadastro" className="dropdown-item" onClick={() => setIsOpen(false)}>
                <i className="bi bi-people-fill"></i> Cadastrar Usuários
              </Link>
            </li>
          </>
        )}
        <li><hr className="dropdown-divider" /></li>
        <li>
          <Link to="/login" className="dropdown-item" onClick={handleLogout}>
            <i className="bi bi-door-open-fill"></i> Sair
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;

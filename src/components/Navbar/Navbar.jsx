import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import Dropdown from "../Dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();

  const nivelAcesso = user?.nivel_acesso;

  useEffect(() => setDropdownOpen(false), [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        (dropdownOpen || (sidebarOpen && window.innerWidth <= 650)) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
        if (window.innerWidth <= 650) setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, sidebarOpen, setSidebarOpen]);

  return (
    <>
      <button
        className="sidebar-hamburger"
        aria-label="Abrir/fechar menu"
        onClick={() => setSidebarOpen((v) => !v)}
      >
        <i className="bi bi-list"></i>
      </button>

      <aside
        className={`sidebar${sidebarOpen ? " open" : " closed"}`}
        aria-label="Menu lateral principal"
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <Link to="/home" className="logo-link">
            
            <img
              src="https://i.postimg.cc/Gh597vbr/LOGO.png"
              alt="Logo"
              className="logo-desktop"
            />
            
            <img
              src="/imagens/Fedcorp-icone01-50x50.png"
              alt="Ícone Fedcorp"
              className="logo-mobile"
            />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={`sidebar-icon-tooltip ${location.pathname === "/home" ? "active" : ""}`}>
              <Link to="/home" className="sidebar-icon-tooltip">
                <i className="bi bi-house-door-fill"></i>
                <span>Início</span>
              </Link>
            </li>

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li className={location.pathname === "/consultas" ? "active" : ""}>
                <Link to="/consultas">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-clipboard2-minus-fill"></i>
                    <span>Consultas</span>
                  </div>
                </Link>
              </li>
            )}

            {["admin", "moderador"].includes(nivelAcesso) && (
              <li className={location.pathname === "/home-adm" ? "active" : ""}>
                <Link to="/home-adm">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-credit-card-2-front-fill"></i>
                    <span>Administradora</span>
                  </div>
                </Link>
              </li>
            )}

            {["admin", "comercial"].includes(nivelAcesso) && (
              <li className={location.pathname === "/consulta-comercial" ? "active" : ""}>
                <Link to="/consulta-comercial">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-ui-checks-grid"></i>
                    <span>Comercial</span>
                  </div>
                </Link>
              </li>
            )}

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li>
                <Link to="/ferramentas">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-tools"></i>
                    <span>Ferramentas</span>
                  </div>
                </Link>
              </li>
            )}

            {["admin", "comercial"].includes(nivelAcesso) && (
              <li>
                <Link to="/metricas">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-bar-chart-fill"></i>
                    <span>Métricas</span>
                  </div>
                </Link>
              </li>
            )}

            {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li className={location.pathname === "/envio-email" ? "active" : ""}>
                <Link to="/envio-email">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-envelope-fill"></i>
                    <span>E-mail</span>
                  </div>
                </Link>
              </li>
            )}

             {["admin", "usuario", "comercial"].includes(nivelAcesso) && (
              <li className={location.pathname === "/agenda" ? "active" : ""}>
                <Link to="/agenda">
                  <div className="sidebar-icon-tooltip">
                    <i className="bi bi-calendar-event"></i>
                    <span>Agenda</span>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <Dropdown sidebarOpen={sidebarOpen} />
      </aside>
    </>
  );
}

export default Sidebar;

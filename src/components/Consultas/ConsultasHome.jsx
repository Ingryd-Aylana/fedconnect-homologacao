import React from "react";
import { Link } from "react-router-dom";
import "../styles/ConsultasHome.css"
import { useAuth } from "../../context/AuthContext";

const consultas = [
    {
        key: "pf",
        icon: <i className="bi bi-person-fill" />,
        title: "Dados Pessoais",
        desc: "Informações sobre pessoas registradas na Receita Federal, incluindo CPF, nome, filiação e data de nascimento.",
        to: "/consulta-pf",
        niveis: ["admin", "usuario", "comercial"],
    },
    {
        key: "cnpj",
        icon: <i className="bi bi-building-fill" />,
        title: "Dados Empresariais",
        desc: "Informações sobre empresas registradas, como razão social, CNPJ, e situação cadastral.",
        to: "/consulta-cnpj",
        niveis: ["admin", "usuario", "comercial"],
    },
    {
        key: "endereco",
        icon: <i className="bi bi-geo-alt-fill" />,
        title: "Endereços",
        desc: "Informações detalhadas sobre logradouros, CEPs, cidades e estados.",
        to: "/consulta-end",
        niveis: ["admin", "usuario", "comercial"],
    },
    {
        key: "segurados",
        icon:<i className="bi bi-shield-check" />,
        title: "Consulta Segurados",
        desc: "Localize informações sobre segurados com base nos registros disponíveis.",
        to: "/consulta-segurados",
        niveis: ["admin", "usuario", "comercial"],
    },
    {
        key: "faturas",
        icon: <i class="bi bi-file-earmark-text"></i>,
        title: "Consultar Faturas",
        desc: "Localize informações sobre faturamento com base nos registros disponíveis.",
        to: "/consulta-faturas",
        niveis: ["admin", "usuario", "comercial"],
    },
    
];

const ConsultasHome = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const currentUserType = user?.nivel_acesso;

    if (loading) {
        return (
            <div className="home-grid">
                <p>Carregando informações do usuário...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="home-grid">
                <p>Você precisa estar logado para acessar esta página.</p>
            </div>
        );
    }

    return (
        <div className="home-grid">
            <main>
                <div className="container02">
                    <h1 className="consultas-title">
                        <i className="bi-clipboard-data"></i> Consultas Disponíveis
                    </h1>
                    <div className="cards-container">
                        {consultas.filter((c) => c.niveis.includes(currentUserType)).map((consulta) => (
                            <div className="card" key={consulta.key}>
                                <div className="card-body">
                                    <div className="feature-icon">{consulta.icon}</div>
                                    <h2>{consulta.title}</h2>
                                    <p>{consulta.desc}</p>
                                    <Link to={consulta.to} className="btn-primary">Pesquisar</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConsultasHome;

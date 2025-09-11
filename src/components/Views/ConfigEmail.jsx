import React, { useState } from "react";
import "../styles/ConfigEmail.css";

const ConfigEmail = () => {
    const [mode, setMode] = useState("cadastro");

    const [nomeRemetente, setNomeRemetente] = useState("");
    const [emailRemetente, setEmailRemetente] = useState("");
    const [emailCopia1, setEmailCopia1] = useState("");
    const [emailCopia2, setEmailCopia2] = useState("");
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);

    const [emailsCadastrados, setEmailsCadastrados] = useState(["teste@email.com"]);
    const [novoEmail, setNovoEmail] = useState("");

    const [produtosCadastrados, setProdutosCadastrados] = useState(["Produto A"]);
    const [produtoSelecionado, setProdutoSelecionado] = useState("");

    const listaProdutosDisponiveis = [
        "Vida", "SST", "Conteúdo", "Documento", "VR",
        "Boat", "Apólice", "Cobrança", "Voucher", "Extra"
    ];

    const toggleProduto = (produto) => {
        if (produtosSelecionados.includes(produto)) {
            setProdutosSelecionados(produtosSelecionados.filter((p) => p !== produto));
        } else {
            setProdutosSelecionados([...produtosSelecionados, produto]);
        }
    };

    const removerEmail = (email) => {
        setEmailsCadastrados(emailsCadastrados.filter((e) => e !== email));
    };

    const adicionarEmail = () => {
        if (novoEmail && !emailsCadastrados.includes(novoEmail)) {
            setEmailsCadastrados([...emailsCadastrados, novoEmail]);
            setNovoEmail("");
        }
    };

    const removerProdutoCadastrado = (produto) => {
        setProdutosCadastrados(produtosCadastrados.filter((p) => p !== produto));
    };

    const adicionarProdutoCadastrado = () => {
        if (
            produtoSelecionado &&
            !produtosCadastrados.includes(produtoSelecionado)
        ) {
            setProdutosCadastrados([
                ...produtosCadastrados,
                produtoSelecionado,
            ]);
            setProdutoSelecionado("");
        }
    };

    const renderCadastroForm = () => (
        <div className="card">
            <div className="email-fields">
                <div className="left-fields">
                    <div className="form-group">
                        <label htmlFor="nomeRemetente">Nome do Remetente</label>
                        <input
                            id="nomeRemetente"
                            type="text"
                            value={nomeRemetente}
                            onChange={(e) => setNomeRemetente(e.target.value)}
                            placeholder="Digite o nome do remetente"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailRemetente">E-mail Principal</label>
                        <input
                            id="emailRemetente"
                            type="email"
                            value={emailRemetente}
                            onChange={(e) => setEmailRemetente(e.target.value)}
                            placeholder="Digite o e-mail do remetente"
                        />
                    </div>
                </div>

                <div className="right-fields">
                    <div className="form-group">
                        <label htmlFor="emailCopia1">E-mail de Cópia (Opcional)</label>
                        <input
                            id="emailCopia1"
                            type="email"
                            value={emailCopia1}
                            onChange={(e) => setEmailCopia1(e.target.value)}
                            placeholder="Digite o e-mail para cópia"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailCopia2">E-mail de Cópia (Opcional)</label>
                        <input
                            id="emailCopia2"
                            type="email"
                            value={emailCopia2}
                            onChange={(e) => setEmailCopia2(e.target.value)}
                            placeholder="Digite o e-mail para cópia"
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="title-produto">Produtos</label>
                <div className="produtos-grid">
                    <div className="produtos-coluna">
                        {listaProdutosDisponiveis.slice(0, 5).map((produto) => (
                             <label key={produto} className="checkbox-item">
                             <input
                               type="checkbox"
                               checked={produtosSelecionados.includes(produto)}
                               onChange={() => toggleProduto(produto)}
                             />
                             {produto}
                           </label>
                        ))}
                    </div>
                    <div className="produtos-coluna">
                        {listaProdutosDisponiveis.slice(5).map((produto) => (
                            <label key={produto} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={produtosSelecionados.includes(produto)}
                                    onChange={() => toggleProduto(produto)}
                                />
                                {produto}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <button className="btn btn-primary">Salvar Configurações</button>
        </div>

    );

    const renderAlterarForm = () => (
        <div className="card">
            <div className="section">
                <h3>Gerenciar E-mails</h3>
                <ul className="list-items">
                    {emailsCadastrados.map((email) => (
                        <li key={email} className="list-item">
                            <span>{email}</span>
                            <button
                                className="btn btn-remove"
                                onClick={() => removerEmail(email)}
                            >
                                <i className="bi bi-trash text-white"></i>
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="input-group">
                    <input
                        type="email"
                        value={novoEmail}
                        onChange={(e) => setNovoEmail(e.target.value)}
                        placeholder="Novo e-mail"
                    />
                    <button className="btn btn-add" onClick={adicionarEmail}>
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="section">
                <h3>Gerenciar Produtos</h3>

                <ul className="list-items">
                    {produtosCadastrados.map((produto) => (
                        <li key={produto} className="list-item">
                            <span>{produto}</span>
                            <button
                                className="btn btn-remove"
                                onClick={() => removerProdutoCadastrado(produto)}
                            >
                                <i className="bi bi-trash text-white"></i>
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="input-group">
                    <select
                        className="select-produto"
                        value={produtoSelecionado}
                        onChange={(e) => setProdutoSelecionado(e.target.value)}
                    >
                        <option value="">Selecione um produto</option>
                        {listaProdutosDisponiveis.map((p) => (
                            <option
                                key={p}
                                value={p}
                                disabled={produtosCadastrados.includes(p)}
                            >
                                {p}
                            </option>
                        ))}
                    </select>

                    <button
                        className="btn btn-add"
                        onClick={adicionarProdutoCadastrado}
                        disabled={
                            !produtoSelecionado ||
                            produtosCadastrados.includes(produtoSelecionado)
                        }
                    >
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="section upload-section">
                <h3>Cadastro em Massa</h3>
                <div className="upload-box">
                    <p>Arraste e solte o arquivo ou</p>
                    <input type="file" accept=".xlsx, .xls" className="file-input" />
                    <button className="btn btn-secondary">Enviar Arquivo</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="config-container">
            <h2 className="title-config">Configurações de Envio</h2>
            <div className="mode-buttons">
                <button
                    className={mode === "cadastro" ? "active" : ""}
                    onClick={() => setMode("cadastro")}
                >
                    Cadastro para Envio
                </button>
                <button
                    className={mode === "alterar" ? "active" : ""}
                    onClick={() => setMode("alterar")}
                >
                    Alterar Cadastro
                </button>
            </div>

            {mode === "cadastro" ? renderCadastroForm() : renderAlterarForm()}
        </div>
    );
};

export default ConfigEmail;
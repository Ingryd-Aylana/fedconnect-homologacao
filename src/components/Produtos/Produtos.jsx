import React, { useState } from 'react';
import { PRODUTOS } from '../../data/produtos';
import '../styles/Produtos.css';

const CATEGORIAS = ["Todos", "Residencial", "Condomínio", "Vida", "Saúde", "Auto", "Garantias", "Institucional"];

const Produtos = () => {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [imagemAberta, setImagemAberta] = useState(null);
  const [imagensGaleria, setImagensGaleria] = useState([]);
  const [indexAtual, setIndexAtual] = useState(0);

  const produtosFiltrados =
    categoriaAtiva === "Todos"
      ? PRODUTOS
      : PRODUTOS.filter((p) => p.categoria === categoriaAtiva);

  const baixarArquivo = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ABRIR IMAGENS DO PRODUTO
  const abrirImagem = (produto) => {
    if (Array.isArray(produto.imagens) && produto.imagens.length > 0) {
      setImagensGaleria(produto.imagens);
      setIndexAtual(0);
      setImagemAberta(produto.imagens[0]);
    } else if (typeof produto.imagem === 'string') {
      setImagensGaleria([produto.imagem]);
      setIndexAtual(0);
      setImagemAberta(produto.imagem);
    }
  };

  const fecharImagem = () => {
    setImagemAberta(null);
    setImagensGaleria([]);
    setIndexAtual(0);
  };

  const irAnterior = () => {
    if (!imagensGaleria.length) return;
    const novoIndex = (indexAtual - 1 + imagensGaleria.length) % imagensGaleria.length;
    setIndexAtual(novoIndex);
    setImagemAberta(imagensGaleria[novoIndex]);
  };

  const irProximo = () => {
    if (!imagensGaleria.length) return;
    const novoIndex = (indexAtual + 1) % imagensGaleria.length;
    setIndexAtual(novoIndex);
    setImagemAberta(imagensGaleria[novoIndex]);
  };

  return (
    <div className="page-container">
      <div className="page-inner">
        <header className="produtos-header">
          <div>
            <h1 className="page-title">Portfólio de Produtos</h1>
            <p className="page-subtitle">
              Apresente rapidamente os produtos da FedCorp durante o atendimento.
            </p>
          </div>

          <div className="produtos-filters">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`chip ${categoriaAtiva === cat ? "chip--active" : ""}`}
                onClick={() => setCategoriaAtiva(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <section className="produtos-grid">
          {produtosFiltrados.map((produto) => (
            <article key={produto.id} className="produto-card">
              <div className="produto-body">
                <span className="produto-categoria-pill">{produto.categoria}</span>

                <h2 className="produto-nome">{produto.nome}</h2>

                {produto.preco && (
                  <p className="produto-preco">{produto.preco}</p>
                )}

                {produto.destaques && produto.destaques.length > 0 && (
                  <ul className="produto-destaques">
                    {produto.destaques.map((destaque, idx) => (
                      <li key={idx}>{destaque}</li>
                    ))}
                  </ul>
                )}

                {produto.observacao && (
                  <p className="produto-observacao">{produto.observacao}</p>
                )}

                {/* AÇÕES DO CARD */}
                {((Array.isArray(produto.imagens) && produto.imagens.length > 0) ||
                  (produto.tipo === 'pdf' && produto.pdf)) && (
                    <div className="produto-actions">
                      {Array.isArray(produto.imagens) && produto.imagens.length > 0 && (
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => abrirImagem(produto)}
                        >
                          Ver folheto
                        </button>
                      )}

                      {/* INSTITUCIONAIS */}
                      {produto.tipo === 'pdf' && produto.pdf && (
                        <div className="pdf-actions">
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => window.open(produto.pdf, '_blank')}
                          >
                            Abrir apresentação
                          </button>

                          <button
                            className="btn btn-outline"
                            type="button"
                            onClick={() => baixarArquivo(produto.pdf)}
                          >
                            Baixar PDF
                          </button>
                        </div>
                      )}

                    </div>
                  )}
              </div>
            </article>
          ))}
        </section>
      </div>

      {imagemAberta && (
        <div className="image-viewer" onClick={fecharImagem}>
          <button className="viewer-close" onClick={fecharImagem}>
            ✕
          </button>

          <img
            src={imagemAberta}
            alt="Folheto do produto"
            className="viewer-image"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="viewer-download"
            onClick={(e) => {
              e.stopPropagation();
              baixarArquivo(imagemAberta);
            }}
          >
            Fazer Download
          </button>

          {imagensGaleria.length > 1 && (
            <>
              <button
                className="viewer-arrow viewer-arrow--left"
                onClick={(e) => {
                  e.stopPropagation();
                  irAnterior();
                }}
              >
                ‹
              </button>

              <button
                className="viewer-arrow viewer-arrow--right"
                onClick={(e) => {
                  e.stopPropagation();
                  irProximo();
                }}
              >
                ›
              </button>

              <div className="viewer-dots">
                {imagensGaleria.map((_, idx) => (
                  <button
                    key={idx}
                    className={`viewer-dot ${idx === indexAtual ? 'viewer-dot--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndexAtual(idx);
                      setImagemAberta(imagensGaleria[idx]);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Produtos;

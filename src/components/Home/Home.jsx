import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Home.css";

const imagensCarrossel = [
  {
    src: "/imagens/Banner-01-1200x675.png",
    alt: "Manual do Usuário",
    link: "/MANUAL-FEDCONNECT.pdf",
    download: true,
  },
  {
    src: "/imagens/Banner-02-1200x675.png",
    alt: "Ir para Consulta",
    link: "/consultas",
    download: false,
  },
  {
    src: "/imagens/Banner-03-1200x675.png",
    alt: "Ir para Ferramentas",
    link: "/ferramentas",
    download: false,
  },
  {
    src: "/imagens/Banner-04-1200x675.png",
    alt: "Banner 4",
    link: "#",
    download: false,
  }
];

const Home = () => {
  const { withSidebar } = useOutletContext();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % imagensCarrossel.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const bannerAtual = imagensCarrossel[index];

  return (
    <div className={`home-container${withSidebar ? " with-sidebar" : ""}`}>
      <div className="carousel-container">
        {bannerAtual.link ? (
          <a
            href={bannerAtual.link}
            className="carousel-link"
            {...(bannerAtual.download ? { download: true } : {})}
            target={bannerAtual.link.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            tabIndex={-1}
          >
            <img
              src={bannerAtual.src}
              alt={bannerAtual.alt || `Banner ${index + 1}`}
              className="carousel-image"
              draggable="false"
            />
          </a>
        ) : (
          <img
            src={bannerAtual.src}
            alt={bannerAtual.alt || `Banner ${index + 1}`}
            className="carousel-image"
          />
        )}
        <div className="carousel-indicators">
          {imagensCarrossel.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === index ? " active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Ir para imagem ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

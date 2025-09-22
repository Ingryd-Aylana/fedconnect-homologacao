import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Home.css";

// Hook para detectar mobile/desktop
function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

// Array de banners para desktop e mobile
const imagensCarrossel = [
  {
    src: {
      desktop: "/imagens/Banner-01-1200x675.png",
      mobile: "/imagens/Banner-01-mobile.png",
    },
    alt: "Manual do Usuário",
    link: "/MANUAL-FEDCONNECT.pdf",
    download: true,
  },
  {
    src: {
      desktop: "/imagens/Banner-02-1200x675.png",
      mobile: "/imagens/Banner-02-mobile.png",
    },
    alt: "Ir para Consulta",
    link: "/consultas",
    download: false,
  },
  {
    src: {
      desktop: "/imagens/Banner-03-1200x675.png",
      mobile: "/imagens/Banner-03-mobile.png",
    },
    alt: "Ir para Ferramentas",
    link: "/ferramentas",
    download: false,
  },
  {
    src: {
      desktop: "/imagens/Banner-04-1200x675.png",
      mobile: "/imagens/Banner-04-mobile.png",
    },
    alt: "Banner 4",
    link: "#",
    download: false,
  },
];

const Home = () => {
  const { withSidebar } = useOutletContext();
  const [index, setIndex] = useState(0);
  const isMobile = useIsMobile(700);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagensCarrossel.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const bannerAtual = imagensCarrossel[index];
  const bannerSrc = isMobile
    ? bannerAtual.src.mobile
    : bannerAtual.src.desktop;

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
              src={bannerSrc}
              alt={bannerAtual.alt || `Banner ${index + 1}`}
              className="carousel-image"
              draggable="false"
            />
          </a>
        ) : (
          <img
            src={bannerSrc}
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

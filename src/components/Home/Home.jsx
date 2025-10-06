import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/Home.css";

function useIsMobile(breakpoint = 700) {
  const getIsMobile = () => window.innerWidth <= breakpoint;
  const [isMobile, setIsMobile] = useState(getIsMobile());

  useEffect(() => {
    function handleResize() {
      setIsMobile(getIsMobile());
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

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
    name: "banner04",
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
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const bannerAtual = imagensCarrossel[index];
  const bannerSrc = isMobile
    ? bannerAtual.src.mobile
    : bannerAtual.src.desktop;

  useEffect(() => {
  }, [isMobile, bannerSrc]);

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
              className={`carousel-image${bannerAtual.name ? " " + bannerAtual.name : ""}`}
              draggable="false"
            />
          </a>
        ) : (
          <img
            src={bannerSrc}
            alt={bannerAtual.alt || `Banner ${index + 1}`}
            className={`carousel-image${bannerAtual.name ? " " + bannerAtual.name : ""}`}
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

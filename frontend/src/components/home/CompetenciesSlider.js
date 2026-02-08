"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/context/ThemeContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(124, 58, 237, 0.15)",
        borderRadius: "50%",
        width: "38px",
        height: "38px",
        zIndex: 5,
        left: "5px",
        backdropFilter: "blur(10px)",
        border: "1.5px solid rgba(124, 58, 237, 0.4)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
    >
      <FaChevronLeft color="#7c3aed" size={18} />
    </div>
  );
}

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(124, 58, 237, 0.15)",
        borderRadius: "50%",
        width: "38px",
        height: "38px",
        zIndex: 5,
        right: "5px",
        backdropFilter: "blur(10px)",
        border: "1.5px solid rgba(124, 58, 237, 0.4)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
    >
      <FaChevronRight color="#7c3aed" size={18} />
    </div>
  );
}

export default function CompetenciesSlider({ competencies }) {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "15%",
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    appendDots: (dots) => (
      <div className="slick-custom-dots-wrapper">
        <ul className="m-0 p-0 slick-custom-dots">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        className={`custom-dot-inner ${i === currentSlide ? "active" : ""}`}
      />
    ),
    responsive: [
      {
        breakpoint: 480,
        settings: {
          centerPadding: "24px",
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div ref={containerRef} className="d-md-none slick-slider-container mt-4 mb-5 w-100">
      {isReady ? (
        <Slider {...settings}>
          {competencies.map((item, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div key={idx} className="px-2 py-4">
                <div
                  className={`glass-card text-center p-3 d-flex flex-column justify-content-center transition-all home-focus-card ${
                    isActive ? "active-focus-card" : ""
                  }`}
                  style={{
                    background: isActive
                      ? theme === "dark"
                        ? "rgba(15, 23, 42, 0.95)"
                        : "rgba(255, 255, 255, 0.95)"
                      : undefined,
                    border: isActive
                      ? "2px solid rgba(124, 58, 237, 0.6)"
                      : undefined,
                  }}
                >
                  <div
                    className="display-3 mb-4 card-icon-wrapper"
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 15px rgba(124, 58, 237, 0.5))"
                        : "none",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className={`h4 fw-bold mb-3 ${
                      isActive
                        ? theme === "dark"
                          ? "text-white"
                          : "text-dark"
                        : "text-muted"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mb-0 card-desc-text ${
                      isActive
                        ? theme === "dark"
                          ? "text-light"
                          : "text-secondary"
                        : "text-muted opacity-50"
                    }`}
                    style={{
                      fontSize: isActive ? "0.9rem" : "0.85rem",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <div className="glass-card text-center p-4">
          <div className="text-muted">Loading highlights...</div>
        </div>
      )}
    </div>
  );
}

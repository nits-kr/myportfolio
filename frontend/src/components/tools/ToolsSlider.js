"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/context/ThemeContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiCheck, FiZap, FiLock } from "react-icons/fi";
import Link from "next/link";

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
        background: "rgba(124, 58, 237, 0.1)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        zIndex: 5,
        left: "5px",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(124, 58, 237, 0.2)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={onClick}
    >
      <FaChevronLeft className="text-primary" size={20} />
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
        background: "rgba(124, 58, 237, 0.1)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        zIndex: 5,
        right: "5px",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(124, 58, 237, 0.2)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onClick={onClick}
    >
      <FaChevronRight className="text-primary" size={20} />
    </div>
  );
}

export default function ToolsSlider({ tools, selectedTier }) {
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
    speed: 800,
    cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
    swipeToSlide: true,
    touchThreshold: 20,
    waitForAnimate: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "15px", // Tighter padding for mobile
    arrows: true,
    adaptiveHeight: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    appendDots: (dots) => (
      <div className="slick-custom-dots-wrapper" style={{ bottom: "-25px" }}>
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
          centerPadding: "20px",
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div
      ref={containerRef}
      className="d-md-none slick-slider-container mt-4 mb-5 w-100"
    >
      {isReady ? (
        <Slider {...settings}>
          {tools.map((tool, index) => {
            const isActive = index === currentSlide;
            return (
              <div key={tool.id} className="px-2 pt-3 pb-5 h-100">
                <div
                  className={`glass-card h-100 p-4 position-relative d-flex flex-column ${
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
                    boxShadow: isActive
                      ? "0 8px 32px rgba(124, 58, 237, 0.15)"
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Badges */}
                  {tool.highlight && tool.badge && (
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className="badge bg-primary px-3 py-2">
                        ✨ {tool.badge}
                      </span>
                    </div>
                  )}
                  {tool.status === "coming-soon" && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-warning text-dark px-3 py-2">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Header Space for Badges */}
                  <div className="mb-4" style={{ height: "20px" }}></div>

                  {/* Icon */}
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3 align-self-center"
                    style={{
                      background: "rgba(124, 58, 237, 0.1)",
                      height: "fit-content",
                      width: "fit-content",
                      filter: isActive
                        ? "drop-shadow(0 0 15px rgba(124, 58, 237, 0.5))"
                        : "none",
                      transition: "filter 0.3s ease",
                    }}
                  >
                    <div className="text-primary">{tool.icon}</div>
                  </div>

                  <div className="text-center flex-grow-1 d-flex flex-column">
                    <h3 className="h4 fw-bold mb-2">{tool.name}</h3>
                    <p className="text-muted small mb-4 opacity-75">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4 text-start bg-secondary bg-opacity-10 p-3 rounded-3">
                      <h5
                        className="small fw-bold text-uppercase tracking-wider text-muted mb-3"
                        style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
                      >
                        Features
                      </h5>
                      <ul className="list-unstyled mb-0">
                        {tool.features.slice(0, 3).map((feature, idx) => (
                          <li
                            key={idx}
                            className="d-flex align-items-start gap-2 mb-1"
                          >
                            <FiCheck
                              className="text-success mt-1 flex-shrink-0"
                              size={14}
                            />
                            <span className="small">{feature}</span>
                          </li>
                        ))}
                        {tool.features.length > 3 && (
                          <li className="small text-muted ps-4 mt-2 fst-italic">
                            +{tool.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Pricing */}
                    <div
                      className="glass-card p-3 mb-4"
                      style={{
                        background: "rgba(124, 58, 237, 0.03)",
                        border: "1px solid rgba(124, 58, 237, 0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <FiZap size={14} className="text-primary" />
                        <span className="small fw-bold text-uppercase tracking-wider">
                          {selectedTier} Plan
                        </span>
                      </div>
                      <p className="mb-0 fw-bold">
                        {tool.pricing[selectedTier]}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="d-flex gap-2 flex-column mt-auto">
                      {tool.status === "available" ? (
                        <>
                          {tool.demoUrl && (
                            <Link
                              href={tool.demoUrl}
                              className="btn btn-outline-light btn-sm w-100 py-2"
                            >
                              Try Demo
                            </Link>
                          )}
                          <Link
                            href={`/pricing?tool=${tool.id}`}
                            className="btn btn-primary btn-sm w-100 py-2 shadow-sm"
                          >
                            Get Access
                          </Link>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-light btn-sm w-100 py-2"
                          disabled
                        >
                          <FiLock size={14} className="me-2" />
                          Coming Soon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <div className="glass-card text-center p-4">
          <div className="text-muted">Loading tools...</div>
        </div>
      )}
    </div>
  );
}

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
                  className={`glass-card h-100 p-0 overflow-hidden d-flex flex-column ${isActive ? "active-focus-card" : ""}`}
                  style={{
                    borderRadius: "16px",
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
                  {/* Badge Header Row */}
                  <div
                    className="d-flex align-items-center justify-content-between px-3 pt-3 pb-0"
                    style={{ minHeight: "36px" }}
                  >
                    <div>
                      {tool.highlight && tool.badge && (
                        <span
                          className="badge bg-primary px-3 py-2 rounded-pill"
                          style={{ fontSize: "0.7rem" }}
                        >
                          ✨ {tool.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      {tool.status === "coming-soon" && (
                        <span
                          className="badge bg-warning text-dark px-3 py-2 rounded-pill"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 pt-3 flex-grow-1 d-flex flex-column">
                    {/* Icon + Title row */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.08))",
                          border: "1px solid rgba(124, 58, 237, 0.2)",
                          width: "48px",
                          height: "48px",
                          filter: isActive
                            ? "drop-shadow(0 0 10px rgba(124, 58, 237, 0.4))"
                            : "none",
                          transition: "filter 0.3s ease",
                        }}
                      >
                        <div className="text-primary">{tool.icon}</div>
                      </div>
                      <div>
                        <h3
                          className="h6 fw-bold mb-0"
                          style={{ lineHeight: 1.3 }}
                        >
                          {tool.name}
                        </h3>
                        <p
                          className="text-muted mb-0 mt-1"
                          style={{ fontSize: "0.78rem", lineHeight: 1.4 }}
                        >
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <hr className="my-2 opacity-25" />

                    {/* Features */}
                    <div className="mb-3">
                      <p
                        className="small fw-semibold text-uppercase mb-2"
                        style={{
                          letterSpacing: "0.8px",
                          fontSize: "0.68rem",
                          opacity: 0.65,
                        }}
                      >
                        Features
                      </p>
                      <ul className="list-unstyled mb-0">
                        {tool.features.slice(0, 3).map((feature, idx) => (
                          <li
                            key={idx}
                            className="d-flex align-items-start gap-2 mb-1"
                          >
                            <FiCheck
                              className="text-success flex-shrink-0 mt-1"
                              size={12}
                            />
                            <span style={{ fontSize: "0.8rem" }}>
                              {feature}
                            </span>
                          </li>
                        ))}
                        {tool.features.length > 3 && (
                          <li
                            className="small text-muted ps-4 fst-italic"
                            style={{ opacity: 0.7, fontSize: "0.75rem" }}
                          >
                            +{tool.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Pricing Pill */}
                    <div
                      className="tools-pricing-box rounded-3 px-3 py-2 mb-3 mt-auto"
                      style={{
                        background: "rgba(124, 58, 237, 0.05)",
                        border: "1px solid rgba(124, 58, 237, 0.15)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <FiZap size={12} className="text-primary" />
                          <span
                            className="fw-semibold text-capitalize"
                            style={{ fontSize: "0.78rem" }}
                          >
                            {selectedTier} Plan
                          </span>
                        </div>
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {tool.pricing[selectedTier]}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="d-flex gap-2 flex-column">
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
                            className="btn btn-primary btn-sm w-100 py-2"
                          >
                            Get Access
                          </Link>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-light btn-sm w-100 py-2"
                          disabled
                        >
                          <FiLock size={13} className="me-2" />
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

"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiCheck, FiArrowRight } from "react-icons/fi";
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

export default function ServicesSlider({ services }) {
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
    <div
      ref={containerRef}
      className="d-md-none slick-slider-container mb-5 w-100"
    >
      {isReady ? (
        <Slider {...settings}>
          {services.map((service, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div key={service.id} className="px-2 py-4">
                <div
                  className={`glass-card p-4 position-relative transition-all h-100 ${
                    isActive ? "active-focus-card" : "opacity-75"
                  }`}
                  style={{
                    minHeight: "550px", // Enough to fit all content
                    background: service.popular
                      ? isActive
                        ? "rgba(15, 23, 42, 0.95)"
                        : "linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)"
                      : "rgba(255, 255, 255, 0.02)",
                    transform: isActive
                      ? "scale(1.05) translateY(-5px)"
                      : "scale(0.9)",
                    boxShadow: isActive
                      ? "0 25px 60px rgba(124, 58, 237, 0.4)"
                      : "none",
                  }}
                >
                  {service.popular && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-primary px-3 py-2">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3"
                      style={{ background: "rgba(124, 58, 237, 0.15)" }}
                    >
                      <div className="text-primary">{service.icon}</div>
                    </div>
                    <h3 className="h4 fw-bold mb-2">{service.title}</h3>
                    <p className="text-muted small mb-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="mb-3">
                      <div className="text-muted small mb-1 text-start">
                        Investment
                      </div>
                      <div className="fw-bold text-primary h5 mb-0 text-start">
                        {service.pricing}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small mb-1 text-start">
                        Timeline
                      </div>
                      <div className="fw-medium text-start">
                        {service.timeline}
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-white border-opacity-10 pt-4 mb-4">
                    <h5 className="h6 fw-bold mb-3 text-start">
                      What&apos;s Included:
                    </h5>
                    <ul className="list-unstyled text-start">
                      {service.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="d-flex align-items-start gap-2 mb-2"
                        >
                          <FiCheck
                            className="text-success mt-1 flex-shrink-0"
                            size={16}
                          />
                          <span className="small">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/contact?service=${service.id}`}
                    className={`btn ${service.popular ? "btn-primary" : "btn-outline-light"} w-100 d-flex align-items-center justify-content-center gap-2 mt-auto`}
                  >
                    Get Started <FiArrowRight />
                  </Link>
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <div className="glass-card text-center p-4">
          <div className="text-muted">Loading services...</div>
        </div>
      )}
    </div>
  );
}

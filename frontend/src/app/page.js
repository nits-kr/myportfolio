"use client";

import Hero from "@/components/features/Hero";
import { useSelector } from "react-redux";
import CompetenciesSlider from "@/components/home/CompetenciesSlider";

export default function Home() {
  const { profile } = useSelector((state) => state.content);

  const competencies = profile.competencies || [];

  return (
    <>
      <Hero />
      <section className="container-fluid px-0 overflow-hidden">
        <div className="container text-center mb-5">
          <h2 className="fw-bold display-5 mb-3">Why Choose Me?</h2>
          <p className="subtext lead">Delivering excellence in every project</p>
        </div>

        <div className="competencies-wrapper">
          {/* Desktop Grid */}
          <div className="container d-none d-md-block">
            <div className="row g-4 justify-content-center">
              {competencies.map((item, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="glass-card text-center p-4 h-100">
                    <div className="display-4 mb-3 opacity-90">{item.icon}</div>
                    <h3 className="h4 fw-bold mb-3">{item.title}</h3>
                    <p className="mb-0 text-muted small">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Slider (lazy-loaded) */}
          <CompetenciesSlider competencies={competencies} />
        </div>
      </section>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiCheck,
  FiArrowRight,
  FiCode,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";
import styles from "../../styles/ServicesProcess.module.scss";
import ServicesSlider from "@/components/services/ServicesSlider";

const services = [
  {
    id: "full-stack",
    title: "Full-Stack Development",
    icon: <FiCode size={32} />,
    description:
      "End-to-end web application development with modern tech stacks",
    features: [
      "React/Next.js frontend",
      "Node.js/Express backend",
      "MongoDB/PostgreSQL databases",
      "RESTful & GraphQL APIs",
      "Authentication & Authorization",
      "Deployment & DevOps",
    ],
    pricing: "Starting at $5,000",
    timeline: "4-8 weeks",
    popular: true,
  },
  {
    id: "performance",
    title: "Performance Optimization",
    icon: <FiZap size={32} />,
    description:
      "Speed up your existing applications and improve user experience",
    features: [
      "Lighthouse score optimization",
      "Code splitting & lazy loading",
      "Database query optimization",
      "CDN & caching strategies",
      "Bundle size reduction",
      "Core Web Vitals improvement",
    ],
    pricing: "Starting at $2,500",
    timeline: "2-4 weeks",
    popular: false,
  },
  {
    id: "consulting",
    title: "Technical Consulting",
    icon: <FiTrendingUp size={32} />,
    description:
      "Expert guidance on architecture, tech stack, and best practices",
    features: [
      "Architecture review",
      "Tech stack recommendations",
      "Code review & refactoring",
      "Team mentoring",
      "Performance audits",
      "Security assessments",
    ],
    pricing: "Starting at $150/hour",
    timeline: "Flexible",
    popular: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="container py-5 mt-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-5 py-5"
      >
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-4 py-2 rounded-pill mb-3">
          Professional Services
        </span>
        <h1 className={`display-3 fw-bold mb-4 ${styles.heroTitle}`}>
          Let&apos;s Build Something{" "}
          <span className={styles.heroSpan}>Amazing</span>
        </h1>
        <p
          className={`lead text-muted mx-auto ${styles.heroDesc}`}
          style={{ maxWidth: "700px" }}
        >
          Transform your ideas into high-performance, scalable applications.
          Choose a service package that fits your needs.
        </p>
      </motion.div>

      {/* Services Grid - Desktop Only */}
      <div className="row g-4 mb-5 d-none d-md-flex">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className="col-lg-4 col-md-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={`glass-card h-100 p-4 position-relative ${service.popular ? "border-primary border-2" : ""}`}
              style={{
                background: service.popular
                  ? "linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)"
                  : "rgba(255, 255, 255, 0.02)",
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
                  style={{ background: "rgba(124, 58, 237, 0.1)" }}
                >
                  <div className="text-primary">{service.icon}</div>
                </div>
                <h3 className="h4 fw-bold mb-2">{service.title}</h3>
                <p className="text-muted small mb-3">{service.description}</p>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Investment</span>
                  <span className="fw-bold text-primary">
                    {service.pricing}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Timeline</span>
                  <span className="fw-medium">{service.timeline}</span>
                </div>
              </div>

              <div className="border-top border-white border-opacity-10 pt-4 mb-4">
                <h5 className="h6 fw-bold mb-3">What's Included:</h5>
                <ul className="list-unstyled">
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
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
                className={`btn ${service.popular ? "btn-primary" : "btn-outline-light"} w-100 d-flex align-items-center justify-content-center gap-2`}
              >
                Get Started <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Services Slider - Mobile Only */}
      <ServicesSlider services={services} />

      {/* Custom Projects CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
        }}
      >
        <h2 className="h3 fw-bold mb-3">Need Something Custom?</h2>
        <p
          className="text-muted mb-4"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          Every project is unique. Let's discuss your specific requirements and
          create a tailored solution that perfectly fits your needs.
        </p>
        <Link
          href="/contact"
          className="btn btn-primary btn-lg px-5 rounded-pill"
        >
          Schedule a Consultation
        </Link>
      </motion.div>

      <div className={styles.processContainer}>
        <h2 className="h3 fw-bold text-center mb-5">How It Works</h2>

        <div className={`position-relative ${styles.mobileScrollWrapper}`}>
          {/* Progress Line */}
          <div className={styles.progressLine}>
            <div className={styles.progressGradient} />
          </div>

          <div
            className={`row g-4 position-relative ${styles.processRow}`}
            style={{ zIndex: 1 }}
          >
            {[
              {
                step: "01",
                title: "Discovery",
                desc: "We'll define your core objectives, target audience, and functional requirements to ensure a perfect project fit.",
                icon: "🔍",
              },
              {
                step: "02",
                title: "Proposal",
                desc: "A comprehensive roadmap covering feature scope, selected tech stack, and a clear, transparent project timeline.",
                icon: "📝",
              },
              {
                step: "03",
                title: "Development",
                desc: "Agile, transparent coding with continuous integration and regular milestones to keep your project on track.",
                icon: "💻",
              },
              {
                step: "04",
                title: "Launch",
                desc: "Ensuring a flawless deployment followed by ongoing support and performance monitoring for long-term growth.",
                icon: "🚀",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className={`col-lg-3 col-md-6 ${styles.stepColumn}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <div className={styles.stepCard}>
                  <div className={styles.stepCircle}>
                    <div className={styles.stepContent}>
                      <span className={styles.stepIcon}>{item.icon}</span>
                      <span className={styles.stepLabel}>STEP {item.step}</span>
                    </div>
                  </div>

                  <h4 className={styles.stepTitle}>{item.title}</h4>
                  <p className={styles.stepDesc}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FiCode,
  FiDatabase,
  FiUsers,
  FiZap,
  FiTrendingUp,
  FiAward,
  FiCheckCircle,
  FiCheck,
} from "react-icons/fi";

export default function InterviewSimulatorPage() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      icon: <FiZap />,
      title: "Choose Your Role",
      description: "Select frontend, backend, or HR interview type",
    },
    {
      icon: <FiTrendingUp />,
      title: "Chat with AI",
      description:
        "Answer questions in real-time with our GPT-4 powered interviewer",
    },
    {
      icon: <FiAward />,
      title: "Get Instant Feedback",
      description:
        "Receive detailed analysis on technical depth, clarity, and confidence",
    },
    {
      icon: <FiCheckCircle />,
      title: "Track Progress",
      description:
        "Monitor your improvement over time with performance analytics",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [steps.length]);

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
          ✨ AI-Powered
        </span>
        <h1 className="display-3 fw-bold mb-4">
          Practice Interviews with <span className="text-primary">AI</span>
        </h1>
        <p
          className="lead text-muted mx-auto mb-4"
          style={{ maxWidth: "700px" }}
        >
          Get real-time feedback from our AI interviewer. Practice technical and
          behavioral interviews anytime, anywhere.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link
            href="/tools/interview-simulator/start"
            className="btn btn-primary btn-lg px-5 rounded-pill"
          >
            Start Free Interview
          </Link>
          <Link
            href="/tools/interview-simulator/dashboard"
            className="btn btn-outline-light btn-lg px-5 rounded-pill"
          >
            View Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Interview Types */}
      <div className="row g-4 mb-5">
        {[
          {
            icon: <FiCode size={32} />,
            title: "Frontend Developer",
            description: "React, JavaScript, CSS, Performance",
            topics: [
              "Component Design",
              "State Management",
              "Web APIs",
              "Optimization",
            ],
            color: "rgba(59, 130, 246, 0.1)",
          },
          {
            icon: <FiDatabase size={32} />,
            title: "Backend Developer",
            description: "Node.js, Databases, APIs, System Design",
            topics: [
              "RESTful APIs",
              "Database Design",
              "Scalability",
              "Security",
            ],
            color: "rgba(16, 185, 129, 0.1)",
          },
          {
            icon: <FiUsers size={32} />,
            title: "HR/Behavioral",
            description: "STAR Method, Soft Skills, Leadership",
            topics: [
              "Teamwork",
              "Conflict Resolution",
              "Problem Solving",
              "Communication",
            ],
            color: "rgba(168, 85, 247, 0.1)",
          },
        ].map((type, idx) => (
          <motion.div
            key={idx}
            className="col-lg-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="glass-card h-100 p-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3"
                style={{ background: type.color }}
              >
                <div className="text-primary">{type.icon}</div>
              </div>
              <h3 className="h5 fw-bold mb-2">{type.title}</h3>
              <p className="text-muted small mb-3">{type.description}</p>
              <div className="d-flex flex-wrap gap-2">
                {type.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="badge bg-primary bg-opacity-10 text-primary"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How It Works Stepper Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-5 py-5"
      >
        <h2 className="h3 fw-bold text-center mb-5">How It Works</h2>

        <div className="mx-auto" style={{ maxWidth: "900px" }}>
          {/* Stepper Header */}
          <div className="position-relative d-flex justify-content-between align-items-center mb-4 mb-md-5 px-3">
            {/* Lines Container */}
            <div
              className="position-absolute top-50 translate-middle-y"
              style={{
                left: "20px",
                right: "20px",
                height: "2px",
                zIndex: 0,
              }}
            >
              {/* Background Line */}
              <div
                className="w-100 h-100"
                style={{ background: "rgba(255, 255, 255, 0.1)" }}
              />
              {/* Progress Line */}
              <motion.div
                className="h-100 position-absolute top-0 start-0"
                initial={false}
                animate={{
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                }}
                style={{
                  background: "#2563eb",
                  zIndex: 1,
                }}
              />
            </div>

            {steps.map((step, idx) => (
              <div
                key={idx}
                className="position-relative d-flex flex-column align-items-center"
                style={{ zIndex: 2, cursor: "pointer" }}
                onClick={() => setActiveStep(idx)}
              >
                <div className="position-relative">
                  <motion.div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    initial={false}
                    animate={{
                      background:
                        idx < activeStep
                          ? "#10b981"
                          : idx === activeStep
                            ? "#ffffff"
                            : "#1e293b",
                      borderColor:
                        idx === activeStep ? "#2563eb" : "transparent",
                      scale: idx === activeStep ? 1.1 : 1,
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid transparent",
                      boxShadow:
                        idx === activeStep
                          ? "0 0 15px rgba(37, 99, 235, 0.3)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        color: idx === activeStep ? "#2563eb" : "#ffffff",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx < activeStep ? <FiCheck size={20} /> : step.icon}
                    </div>
                  </motion.div>
                </div>
                <motion.span
                  className="mt-3 small fw-bold text-center position-absolute d-none d-md-block"
                  animate={{
                    color: idx <= activeStep ? "#ffffff" : "#6b7280",
                    opacity: 1,
                    fontWeight: idx === activeStep ? "700" : "500",
                  }}
                  style={{
                    top: "100%",
                    left: "50%",
                    whiteSpace: "nowrap",
                    transform: "translateX(-50%)",
                  }}
                >
                  {step.title}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Stepper Content Slider */}
          <div className="mt-5 pt-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="glass-card p-4 p-md-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mb-4 mx-auto"
                  style={{
                    background: "rgba(37, 99, 235, 0.1)",
                    width: "80px",
                    height: "80px",
                  }}
                >
                  <div
                    className="text-primary"
                    style={{
                      fontSize: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {steps[activeStep].icon}
                  </div>
                </div>
                <h3 className="h3 fw-bold mb-3">{steps[activeStep].title}</h3>
                <p
                  className="text-muted lead mx-auto"
                  style={{ maxWidth: "600px" }}
                >
                  {steps[activeStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Indicators */}
            <div className="d-flex justify-content-center gap-2 mt-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-pill cursor-pointer ${
                    activeStep === i ? "bg-primary" : "bg-light bg-opacity-25"
                  }`}
                  style={{
                    width: activeStep === i ? "24px" : "8px",
                    height: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setActiveStep(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4 p-md-5 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
        }}
      >
        <h2 className="h3 fw-bold mb-3">Ready to Ace Your Interview?</h2>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          Start with 3 free sessions per month. Upgrade to Pro for unlimited
          practice and advanced analytics.
        </p>
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center">
          <Link
            href="/tools/interview-simulator/start"
            className="btn btn-primary btn-lg px-4 px-md-5 rounded-pill w-100 w-md-auto"
          >
            Start Free Session
          </Link>
          <Link
            href="/pricing"
            className="btn btn-outline-light btn-lg px-4 px-md-5 rounded-pill w-100 w-md-auto"
          >
            View Pricing
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

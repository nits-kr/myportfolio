"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiCode,
  FiDatabase,
  FiUsers,
  FiZap,
  FiTrendingUp,
  FiAward,
  FiCheckCircle,
} from "react-icons/fi";

export default function InterviewSimulatorPage() {
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

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-5"
      >
        <h2 className="h3 fw-bold text-center mb-5">How It Works</h2>
        <div className="row g-4">
          {[
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
          ].map((feature, idx) => (
            <div key={idx} className="col-md-6 col-lg-3">
              <div className="text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3"
                  style={{ background: "rgba(124, 58, 237, 0.1)" }}
                >
                  <div className="text-primary" style={{ fontSize: "24px" }}>
                    {feature.icon}
                  </div>
                </div>
                <h4 className="h6 fw-bold mb-2">{feature.title}</h4>
                <p className="text-muted small">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-5 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
        }}
      >
        <h2 className="h3 fw-bold mb-3">Ready to Ace Your Interview?</h2>
        <p
          className="text-muted mb-4"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          Start with 3 free sessions per month. Upgrade to Pro for unlimited
          practice and advanced analytics.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link
            href="/tools/interview-simulator/start"
            className="btn btn-primary btn-lg px-5 rounded-pill"
          >
            Start Free Session
          </Link>
          <Link
            href="/pricing"
            className="btn btn-outline-light btn-lg px-5 rounded-pill"
          >
            View Pricing
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

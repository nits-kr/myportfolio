"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  FiMail,
  FiDatabase,
  FiBarChart,
  FiFileText,
  FiLock,
  FiZap,
  FiCheck,
} from "react-icons/fi";
import ToolsSlider from "@/components/tools/ToolsSlider";

const tools = [
  {
    id: "interview-simulator",
    name: "AI Interview Simulator",
    icon: <FiMail size={32} />,
    description:
      "Practice technical interviews with AI-powered feedback and performance analytics",
    features: [
      "Role-based interviews (Frontend/Backend/HR)",
      "Real-time AI feedback on answers",
      "Performance scoring dashboard",
      "Voice & chat-based practice",
      "Session recording & playback",
      "Confidence & clarity analysis",
    ],
    pricing: {
      free: "3 sessions/month, chat-only",
      pro: "Unlimited sessions + voice mode",
      enterprise: "Team accounts + custom questions",
    },
    status: "available",
    demoUrl: "/tools/interview-simulator",
    highlight: true,
    badge: "AI-Powered",
  },
  {
    id: "bug-sandbox",
    name: "Bug Reproduction Sandbox",
    icon: <FiDatabase size={32} />,
    description:
      "Paste error logs and get instant minimal reproducible environments with AI-powered fix suggestions",
    features: [
      "Auto-detect tech stack from errors",
      "Generate minimal failing code",
      "AI-powered fix suggestions",
      "Shareable debug links",
      "Live code execution",
      "Integration with GitHub Issues",
    ],
    pricing: {
      free: "5 bug reports/month",
      pro: "Unlimited + live execution",
      enterprise: "Team workspace + API access",
    },
    status: "coming-soon",
    demoUrl: null,
    highlight: true,
    badge: "AI-Powered",
  },
  {
    id: "system-design-visualizer",
    name: "System Design Visualizer",
    icon: <FiBarChart size={32} />,
    description:
      "Interactive canvas for designing scalable architectures with real-time traffic simulation and cost estimation",
    features: [
      "Drag-drop components (LB, DB, Cache)",
      "Real-time traffic simulation",
      "Bottleneck detection",
      "AWS/GCP/Azure cost estimation",
      "Export as Terraform/CloudFormation",
      "Collaborative editing",
    ],
    pricing: {
      free: "3 designs, PNG export",
      pro: "Unlimited + simulation + cost calc",
      enterprise: "Collaboration + templates + API",
    },
    status: "coming-soon",
    demoUrl: null,
    highlight: true,
    badge: "AI-Powered",
  },
  {
    id: "email-validator",
    name: "Email List Validator",
    icon: <FiMail size={32} />,
    description:
      "Clean and validate email lists with advanced bounce detection",
    features: [
      "Syntax validation",
      "Domain verification",
      "Disposable email detection",
      "Bulk processing (10k+ emails)",
      "Export to CSV/JSON",
    ],
    pricing: {
      free: "100 emails/month",
      pro: "10,000 emails/month",
      enterprise: "Unlimited",
    },
    status: "available",
    demoUrl: "/tools/email-validator",
  },
  {
    id: "data-porter",
    name: "Data Porter",
    icon: <FiDatabase size={32} />,
    description: "Seamlessly migrate data between databases and formats",
    features: [
      "MySQL to MongoDB migration",
      "CSV/Excel to JSON conversion",
      "Schema mapping",
      "Batch processing",
      "Data transformation rules",
    ],
    pricing: {
      free: "1 migration/month",
      pro: "Unlimited migrations",
      enterprise: "Custom integrations",
    },
    status: "available",
    demoUrl: "/tools/data-porter/demo",
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    icon: <FiBarChart size={32} />,
    description: "Real-time analytics and insights for your applications",
    features: [
      "Custom dashboards",
      "Real-time metrics",
      "User behavior tracking",
      "Conversion funnels",
      "Export reports",
    ],
    pricing: {
      free: "1,000 events/month",
      pro: "100,000 events/month",
      enterprise: "Unlimited + Custom metrics",
    },
    status: "available",
    demoUrl: "/tools/analytics/demo",
  },
  {
    id: "content-generator",
    name: "AI Content Generator",
    icon: <FiFileText size={32} />,
    description: "Generate high-quality content with AI assistance",
    features: [
      "Blog post generation",
      "SEO optimization",
      "Multiple languages",
      "Tone customization",
      "Plagiarism check",
    ],
    pricing: {
      free: "5 generations/month",
      pro: "100 generations/month",
      enterprise: "Unlimited + API access",
    },
    status: "coming-soon",
    demoUrl: null,
  },
];

export default function ToolsPage() {
  const [selectedTier, setSelectedTier] = useState("pro");
  const displayTools = useMemo(
    () =>
      tools.map((tool) => {
        if (tool.id === "interview-simulator") return tool;
        return {
          ...tool,
          status: "coming-soon",
          demoUrl: null,
        };
      }),
    [],
  );

  const [activeStep, setActiveStep] = useState(0);
  const benefits = [
    {
      icon: <FiZap />,
      title: "Lightning Fast",
      desc: "Optimized for performance with sub-second response times",
    },
    {
      icon: <FiLock />,
      title: "Secure & Private",
      desc: "Your data is encrypted and never shared with third parties",
    },
    {
      icon: <FiBarChart />,
      title: "Detailed Analytics",
      desc: "Track usage and get insights into your workflows",
    },
    {
      icon: <FiDatabase />,
      title: "API Access",
      desc: "Integrate tools into your applications with our REST API",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % benefits.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [benefits.length]);

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
          Developer Tools
        </span>
        <h1 className="display-3 fw-bold mb-4">
          Powerful <span className="text-primary">Tools</span> for Developers
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
          Access our suite of professional-grade tools to streamline your
          workflow and boost productivity.
        </p>

        {/* Tier Selector */}
        <div
          className="d-inline-flex mx-auto mt-4 p-1 rounded-pill"
          style={{
            background: "rgba(124, 58, 237, 0.08)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            gap: "4px",
          }}
        >
          {["free", "pro", "enterprise"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`btn btn-sm text-capitalize px-4 rounded-pill ${selectedTier === tier ? "btn-primary" : ""}`}
              style={{
                fontWeight: selectedTier === tier ? 600 : 400,
                ...(selectedTier !== tier
                  ? { background: "transparent", border: "none" }
                  : {}),
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="d-none d-md-flex row g-4 mb-5">
        {displayTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            className="col-lg-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className="glass-card h-100 p-0 overflow-hidden d-flex flex-column"
              style={{ borderRadius: "16px" }}
            >
              {/* Card Header: Badges Row */}
              <div
                className="d-flex align-items-center justify-content-between px-4 pt-3 pb-0"
                style={{ minHeight: "40px" }}
              >
                <div>
                  {tool.highlight && tool.badge && (
                    <span
                      className="badge bg-primary px-3 py-2 rounded-pill"
                      style={{ fontSize: "0.72rem", letterSpacing: "0.3px" }}
                    >
                      ✨ {tool.badge}
                    </span>
                  )}
                </div>
                <div>
                  {tool.status === "coming-soon" && (
                    <span
                      className="badge bg-warning text-dark px-3 py-2 rounded-pill"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 pt-3 flex-grow-1 d-flex flex-column">
                {/* Icon + Title */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.08))",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      width: "52px",
                      height: "52px",
                    }}
                  >
                    <div className="text-primary">{tool.icon}</div>
                  </div>
                  <div>
                    <h3 className="h5 fw-bold mb-0" style={{ lineHeight: 1.3 }}>
                      {tool.name}
                    </h3>
                    <p
                      className="text-muted small mb-0 mt-1"
                      style={{ lineHeight: 1.5 }}
                    >
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <hr className="my-3 opacity-25" />

                {/* Features */}
                <div className="mb-3">
                  <p
                    className="small fw-semibold text-uppercase mb-2"
                    style={{
                      letterSpacing: "0.8px",
                      fontSize: "0.7rem",
                      opacity: 0.7,
                    }}
                  >
                    Features
                  </p>
                  <ul className="list-unstyled mb-0 row g-1">
                    {tool.features.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        className="col-12 d-flex align-items-start gap-2"
                      >
                        <FiCheck
                          className="text-success flex-shrink-0 mt-1"
                          size={13}
                        />
                        <span className="small">{feature}</span>
                      </li>
                    ))}
                    {tool.features.length > 3 && (
                      <li
                        className="col-12 small text-muted ps-4"
                        style={{ opacity: 0.7 }}
                      >
                        +{tool.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Pricing Box */}
                <div
                  className="tools-pricing-box rounded-3 px-3 py-2 mb-3 mt-auto"
                  style={{
                    background: "rgba(124, 58, 237, 0.05)",
                    border: "1px solid rgba(124, 58, 237, 0.15)",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <FiZap size={13} className="text-primary" />
                      <span className="small fw-semibold text-capitalize">
                        {selectedTier} Plan
                      </span>
                    </div>
                    <span className="small text-muted">
                      {tool.pricing[selectedTier]}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="d-flex gap-2">
                  {tool.status === "available" ? (
                    <>
                      {tool.demoUrl && (
                        <Link
                          href={tool.demoUrl}
                          className="btn btn-outline-light btn-sm flex-grow-1 py-2"
                        >
                          Try Demo
                        </Link>
                      )}
                      <Link
                        href={`/pricing?tool=${tool.id}`}
                        className="btn btn-primary btn-sm flex-grow-1 py-2"
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
          </motion.div>
        ))}
      </div>

      <ToolsSlider tools={displayTools} selectedTier={selectedTier} />

      {/* Custom Tool CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 p-md-5 text-center d-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
        }}
      >
        <h2 className="h3 fw-bold mb-3">Need a Custom Tool?</h2>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          I can build custom tools tailored to your specific needs. From data
          processing to automation, let&apos;s discuss your requirements.
        </p>
        <div className="mx-auto" style={{ maxWidth: "400px" }}>
          <Link
            href="/contact?service=custom&message=I need a custom tool for..."
            className="btn btn-primary btn-lg px-4 px-md-5 rounded-pill w-100 w-md-auto"
            style={{ fontWeight: "600", minWidth: "200px" }}
          >
            Request Custom Tool
          </Link>
        </div>
      </motion.div>

      {/* Benefits Stepper Section */}
      <div className="mt-5 pt-5 pb-5">
        <h2 className="h3 fw-bold text-center mb-5">Why Use Our Tools?</h2>

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
                  width: `${(activeStep / (benefits.length - 1)) * 100}%`,
                }}
                style={{
                  background: "#2563eb",
                  zIndex: 1,
                }}
              />
            </div>

            {benefits.map((benefit, idx) => (
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
                            : "#0f172a", // Solid background to mask line
                      borderColor:
                        idx === activeStep ? "#2563eb" : "transparent",
                      scale: idx === activeStep ? 1.1 : 1, // Reduced scale for mobile
                    }}
                    style={{
                      width: "40px", // Reduced size for mobile-friendliness
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
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx < activeStep ? <FiCheck size={24} /> : benefit.icon}
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
                  {benefit.title}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Stepper Content Slider */}
          <div className="mt-5 pt-4 text-center">
            <div className="position-relative" style={{ minHeight: "280px" }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-4 p-md-5 w-100"
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
                      {benefits[activeStep].icon}
                    </div>
                  </div>
                  <h3 className="h3 fw-bold mb-3">
                    {benefits[activeStep].title}
                  </h3>
                  <p
                    className="text-muted lead mx-auto"
                    style={{ maxWidth: "600px" }}
                  >
                    {benefits[activeStep].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Indicators */}
            <div className="d-flex justify-content-center gap-2 mt-4">
              {benefits.map((_, i) => (
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
      </div>
    </div>
  );
}

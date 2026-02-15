"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  FiMail,
  FiDatabase,
  FiBarChart,
  FiFileText,
  FiLock,
  FiZap,
  FiCheck,
} from "react-icons/fi";

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
    demoUrl: "/tools/email-validator/demo",
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
        <div className="d-flex justify-content-center gap-2 mt-4">
          {["free", "pro", "enterprise"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`btn ${selectedTier === tier ? "btn-primary" : "btn-outline-light"} text-capitalize`}
            >
              {tier}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="row g-4 mb-5">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            className="col-lg-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="glass-card h-100 p-4 position-relative">
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

              <div className="d-flex gap-4">
                {/* Icon */}
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 flex-shrink-0"
                  style={{
                    background: "rgba(124, 58, 237, 0.1)",
                    height: "fit-content",
                  }}
                >
                  <div className="text-primary">{tool.icon}</div>
                </div>

                {/* Content */}
                <div className="flex-grow-1">
                  <h3 className="h5 fw-bold mb-2">{tool.name}</h3>
                  <p className="text-muted small mb-3">{tool.description}</p>

                  {/* Features */}
                  <div className="mb-3">
                    <h5 className="h6 fw-bold mb-2">Features:</h5>
                    <ul className="list-unstyled">
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
                        <li className="small text-muted">
                          +{tool.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Pricing for selected tier */}
                  <div
                    className="glass-card p-3 mb-3"
                    style={{ background: "rgba(124, 58, 237, 0.05)" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FiZap size={14} className="text-primary" />
                      <span className="small fw-bold text-capitalize">
                        {selectedTier} Plan
                      </span>
                    </div>
                    <p className="mb-0 small">{tool.pricing[selectedTier]}</p>
                  </div>

                  {/* CTA */}
                  <div className="d-flex gap-2">
                    {tool.status === "available" ? (
                      <>
                        {tool.demoUrl && (
                          <Link
                            href={tool.demoUrl}
                            className="btn btn-outline-light btn-sm flex-grow-1"
                          >
                            Try Demo
                          </Link>
                        )}
                        <Link
                          href={`/pricing?tool=${tool.id}`}
                          className="btn btn-primary btn-sm flex-grow-1"
                        >
                          Get Access
                        </Link>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline-light btn-sm w-100"
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
          </motion.div>
        ))}
      </div>

      {/* Custom Tool CTA */}
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
        <h2 className="h3 fw-bold mb-3">Need a Custom Tool?</h2>
        <p
          className="text-muted mb-4"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          I can build custom tools tailored to your specific needs. From data
          processing to automation, let's discuss your requirements.
        </p>
        <Link
          href="/contact?service=custom&message=I need a custom tool for..."
          className="btn btn-primary btn-lg px-5 rounded-pill"
        >
          Request Custom Tool
        </Link>
      </motion.div>

      {/* Benefits Section */}
      <div className="mt-5 pt-5">
        <h2 className="h3 fw-bold text-center mb-5">Why Use Our Tools?</h2>
        <div className="row g-4">
          {[
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
          ].map((benefit, idx) => (
            <motion.div
              key={idx}
              className="col-md-6 col-lg-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <div className="text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3"
                  style={{ background: "rgba(124, 58, 237, 0.1)" }}
                >
                  <div className="text-primary" style={{ fontSize: "24px" }}>
                    {benefit.icon}
                  </div>
                </div>
                <h4 className="h6 fw-bold mb-2">{benefit.title}</h4>
                <p className="text-muted small">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

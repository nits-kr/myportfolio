"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FiCode,
  FiDatabase,
  FiUsers,
  FiArrowRight,
  FiPlusCircle,
  FiX,
} from "react-icons/fi";

const interviewRoles = [
  {
    id: "frontend",
    title: "Frontend Developer",
    icon: <FiCode size={48} />,
    color: "rgba(124, 58, 237, 0.1)",
    gradient:
      "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
    topics: ["React", "Next.js", "State Management", "Performance"],
  },
  {
    id: "backend",
    title: "Backend Developer",
    icon: <FiDatabase size={48} />,
    color: "rgba(59, 130, 246, 0.1)",
    gradient:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
    topics: ["Node.js", "Express", "Databases", "System Design"],
  },
  {
    id: "hr",
    title: "HR / Behavioral",
    icon: <FiUsers size={48} />,
    color: "rgba(16, 185, 129, 0.1)",
    gradient:
      "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
    topics: [
      "Communication",
      "Leadership",
      "Conflict Resolution",
      "Culture Fit",
    ],
  },
];

const difficultyLevels = [
  { id: "junior", label: "Junior", description: "Entry-level focus" },
  { id: "mid", label: "Mid-Level", description: "Growth & complexity" },
  { id: "senior", label: "Senior", description: "Architecture & impact" },
];

export default function StartInterviewPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("mid");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // Custom Interview State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRoleData, setCustomRoleData] = useState({
    title: "",
    jobDescription: "",
    focusAreas: "",
  });

  const handleStartInterview = async () => {
    if (!selectedRole && !showCustomModal) {
      setError("Please select an interview type");
      return;
    }

    if (!user) {
      router.push("/login?redirect=/tools/interview-simulator/start");
      return;
    }

    // specific logic for custom role validation
    if (selectedRole === "custom") {
      if (!customRoleData.title || !customRoleData.jobDescription) {
        setError("Please fill in the Job Title and Description.");
        return;
      }
    }

    setIsCreating(true);
    setError(null);

    try {
      const payload = {
        role: selectedRole,
        difficulty: selectedDifficulty,
        ...(selectedRole === "custom" && { customData: customRoleData }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError(data.error);
          setTimeout(() => router.push("/pricing"), 2000);
          return;
        }
        throw new Error(data.error || "Failed to create session");
      }

      router.push(
        `/tools/interview-simulator/session/${data.data.session._id}`,
      );
    } catch (err) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  return (
    <div className="container py-5 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <h1 className="display-4 fw-bold mb-3">Start Your Interview</h1>
        <p className="lead text-muted">
          Choose your role or create a custom scenario
        </p>
      </motion.div>

      {/* Role Selection */}
      <div className="mb-5">
        <h2 className="h4 fw-bold mb-4">Select Interview Type</h2>
        <div className="row g-4">
          {interviewRoles.map((role, idx) => (
            <motion.div
              key={role.id}
              className="col-lg-3 col-md-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                onClick={() => {
                  setSelectedRole(role.id);
                  setShowCustomModal(false);
                }}
                className={`glass-card h-100 p-4 cursor-pointer ${
                  selectedRole === role.id ? "border-primary border-2" : ""
                }`}
                style={{
                  cursor: "pointer",
                  background:
                    selectedRole === role.id
                      ? role.gradient
                      : "rgba(255, 255, 255, 0.02)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3"
                  style={{ background: role.color }}
                >
                  <div className="text-primary">{role.icon}</div>
                </div>
                <h3 className="h6 fw-bold mb-2">{role.title}</h3>
                <div className="d-flex flex-wrap gap-1">
                  {role.topics.slice(0, 2).map((topic, i) => (
                    <span
                      key={i}
                      className="badge bg-primary bg-opacity-10 text-primary small"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Custom Role Card */}
          <motion.div
            key="custom"
            className="col-lg-3 col-md-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              onClick={() => {
                setSelectedRole("custom");
                setShowCustomModal(true);
              }}
              className={`glass-card h-100 p-4 cursor-pointer ${
                selectedRole === "custom" ? "border-success border-2" : ""
              }`}
              style={{
                cursor: "pointer",
                background:
                  selectedRole === "custom"
                    ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)"
                    : "rgba(255, 255, 255, 0.02)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3"
                style={{ background: "rgba(16, 185, 129, 0.1)" }}
              >
                <div className="text-success">
                  <FiPlusCircle size={48} />
                </div>
              </div>
              <h3 className="h6 fw-bold mb-2">Custom Role</h3>
              <p className="text-muted small mb-3">
                Paste a JD or define your own role
              </p>
              <span className="badge bg-success bg-opacity-10 text-success small">
                Pro Feature
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Modal / Form Area */}
      {selectedRole === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-5"
        >
          <div className="glass-card p-4 border border-success border-opacity-25">
            <h3 className="h5 fw-bold mb-3 text-success">
              Custom Interview Details
            </h3>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small text-muted">
                  Job Title / Role
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senior Python Data Scientist"
                  value={customRoleData.title}
                  onChange={(e) =>
                    setCustomRoleData({
                      ...customRoleData,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small text-muted">
                  Focus Areas (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AWS, Docker, System Design"
                  value={customRoleData.focusAreas}
                  onChange={(e) =>
                    setCustomRoleData({
                      ...customRoleData,
                      focusAreas: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small text-muted">
                  Job Description / Context
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Paste the job description or specific requirements here..."
                  value={customRoleData.jobDescription}
                  onChange={(e) =>
                    setCustomRoleData({
                      ...customRoleData,
                      jobDescription: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Difficulty Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-5"
      >
        <h2 className="h4 fw-bold mb-4">Select Difficulty Level</h2>
        <div className="d-flex gap-3 justify-content-center">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedDifficulty(level.id)}
              className={`btn ${
                selectedDifficulty === level.id
                  ? "btn-primary"
                  : "btn-outline-light"
              } px-4`}
            >
              <div className="fw-bold">{level.label}</div>
              <div className="small opacity-75">{level.description}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-danger text-center mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <button
          onClick={handleStartInterview}
          disabled={!selectedRole || isCreating}
          className="btn btn-primary btn-lg px-5 rounded-pill"
        >
          {isCreating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Creating Session...
            </>
          ) : (
            <>
              Start Interview
              <FiArrowRight className="ms-2" />
            </>
          )}
        </button>
        <p className="text-muted small mt-3">
          {selectedRole === "custom"
            ? "Custom interviews consume 1 session credit"
            : user?.subscription === "free"
              ? "Free tier: 3 sessions/month"
              : "Unlimited sessions"}
        </p>
      </motion.div>
    </div>
  );
}

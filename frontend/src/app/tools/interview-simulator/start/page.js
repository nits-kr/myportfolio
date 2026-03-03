"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCode,
  FiDatabase,
  FiUsers,
  FiArrowRight,
  FiPlusCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
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
  const subscription = user?.subscription || "free";
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("mid");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom Interview State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRoleData, setCustomRoleData] = useState({
    title: "",
    jobDescription: "",
    focusAreas: "",
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = interviewRoles.length + 1; // +1 for the custom card

  const renderRoleCard = (role, isCustom = false) => {
    if (isCustom) {
      return (
        <div
          onClick={() => {
            setSelectedRole("custom");
            setShowCustomModal(true);
          }}
          className={`glass-card h-100 p-4 cursor-pointer text-center ${
            selectedRole === "custom" ? "border-success border-2 shadow-sm" : ""
          }`}
          style={{
            cursor: "pointer",
            background:
              selectedRole === "custom"
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)"
                : "rgba(255, 255, 255, 0.02)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3 mx-auto"
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
          <div className="d-flex justify-content-center">
            <span className="badge bg-success bg-opacity-10 text-success small">
              Pro Feature
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => {
          setSelectedRole(role.id);
          setShowCustomModal(false);
        }}
        className={`glass-card h-100 p-4 cursor-pointer text-center ${
          selectedRole === role.id ? "border-primary border-2 shadow-sm" : ""
        }`}
        style={{
          cursor: "pointer",
          background:
            selectedRole === role.id
              ? role.gradient
              : "rgba(255, 255, 255, 0.02)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 mb-3 mx-auto"
          style={{ background: role.color }}
        >
          <div className="text-primary">{role.icon}</div>
        </div>
        <h3 className="h6 fw-bold mb-2">{role.title}</h3>
        <div className="d-flex flex-wrap gap-1 justify-content-center">
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
    );
  };

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
        `${process.env.NEXT_PUBLIC_API_URL}/interview/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || localStorage.getItem("token")}`,
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

      {/* Desktop Role Selection */}
      <div className="d-none d-md-block mb-5">
        <h2 className="h4 fw-bold mb-4 text-center text-md-start">
          Select Interview Type
        </h2>
        <div className="row g-4">
          {interviewRoles.map((role, idx) => (
            <motion.div
              key={role.id}
              className="col-lg-3 col-md-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              {renderRoleCard(role)}
            </motion.div>
          ))}
          {/* Custom Role Card */}
          <motion.div
            key="custom"
            className="col-lg-3 col-md-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {renderRoleCard(null, true)}
          </motion.div>
        </div>
      </div>

      {/* Mobile Role Slider */}
      <div className="d-block d-md-none mb-5 overflow-hidden">
        <h2 className="h4 fw-bold mb-4 text-center">Select Interview Type</h2>
        <div className="position-relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe =
                  Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                if (swipe) {
                  const direction = offset.x > 0 ? -1 : 1;
                  setActiveSlide(
                    (prev) => (prev + direction + totalSlides) % totalSlides,
                  );
                }
              }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
              style={{ cursor: "grab", touchAction: "none" }}
            >
              {activeSlide < interviewRoles.length
                ? renderRoleCard(interviewRoles[activeSlide])
                : renderRoleCard(null, true)}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              onClick={() =>
                setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
              }
              className="btn btn-sm btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: "35px", height: "35px" }}
            >
              <FiChevronLeft />
            </button>
            <div className="d-flex gap-2">
              {[...Array(totalSlides)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-pill ${
                    activeSlide === i ? "bg-primary" : "bg-light bg-opacity-25"
                  }`}
                  style={{
                    width: activeSlide === i ? "20px" : "8px",
                    height: "8px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveSlide(i)}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % totalSlides)}
              className="btn btn-sm btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: "35px", height: "35px" }}
            >
              <FiChevronRight />
            </button>
          </div>
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
        <h2 className="h4 fw-bold mb-4 text-center">Select Difficulty Level</h2>
        <div className="d-flex flex-row gap-2 gap-md-3 justify-content-center w-100">
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedDifficulty(level.id)}
              className={`btn ${
                selectedDifficulty === level.id
                  ? "btn-primary"
                  : "btn-outline-light"
              } px-2 px-md-4 py-2 flex-grow-1`}
              style={{ minWidth: 0 }}
            >
              <div className="fw-bold small">{level.label}</div>
              <div
                className="extra-small opacity-75 d-none d-md-block"
                style={{ fontSize: "0.7rem" }}
              >
                {level.description}
              </div>
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
        className="text-center mt-5"
      >
        <div className="mx-auto" style={{ maxWidth: "350px" }}>
          <button
            onClick={handleStartInterview}
            disabled={!selectedRole || isCreating}
            className="btn btn-primary btn-lg px-5 rounded-pill w-100 w-md-auto"
            style={{ fontWeight: "600", minWidth: "180px" }}
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
        </div>
        {isMounted && (
          <p className="text-muted small mt-3">
            {selectedRole === "custom"
              ? "Custom interviews consume 1 session credit"
              : subscription === "free"
                ? "Free tier: 3 sessions/month"
                : "Unlimited sessions"}
          </p>
        )}
      </motion.div>
    </div>
  );
}

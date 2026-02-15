"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiCheckCircle,
  FiTrendingUp,
  FiMessageSquare,
  FiActivity,
  FiArrowLeft,
  FiRefreshCw,
  FiCode,
} from "react-icons/fi";
import { useSelector } from "react-redux";

export default function SessionSummaryPage({ params }) {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = params.id;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchSessionDetails();
  }, [sessionId, user]);

  const fetchSessionDetails = async () => {
    try {
      // 1. Get Session Data (includes metrics & overall score)
      const sessionRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interview/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const sessionData = await sessionRes.json();

      // 2. Get Messages (to reconstruct summary if not saved - for MVP we'll just use session metrics)
      // Ideally, the 'end' endpoint returned the summary. Only if we store it can we retrieve it here.
      // For now, let's assume we Display metrics from Session and maybe re-fetch summary if we stored it
      // or just show the metrics.
      //
      // Let's actually update the UI to show the metrics we CAN get from the session object.

      if (sessionData.success) {
        setSession(sessionData.data);
      }
    } catch (error) {
      console.error("Fetch summary error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 mt-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-3 text-muted">Generating interview report...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-5 mt-4 text-center">
        <h2 className="text-danger">Session not found</h2>
        <Link
          href="/tools/interview-simulator/dashboard"
          className="btn btn-primary mt-3"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Fallback for metrics if they don't exist yet
  const metrics = session.metrics || {
    technicalDepth: 0,
    clarity: 0,
    confidence: 0,
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-success";
    if (score >= 5) return "text-warning";
    return "text-danger";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-success";
    if (score >= 5) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="container py-5 mt-4" style={{ maxWidth: "1000px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
          <FiCheckCircle size={48} />
        </div>
        <h1 className="h2 fw-bold mb-2">Interview Completed!</h1>
        <p className="text-muted">
          Here's how you performed in your{" "}
          <span className="text-primary fw-bold text-capitalize">
            {session.role === "custom" && session.customData?.title
              ? session.customData.title
              : session.role}
          </span>{" "}
          interview.
        </p>
      </motion.div>

      {/* Main Score Card */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 h-100 text-center d-flex flex-column justify-content-center"
          >
            <h3 className="h6 text-muted uppercase tracking-wider mb-3">
              Overall Score
            </h3>
            <div
              className={`display-1 fw-bold mb-2 ${getScoreColor(session.overallScore)}`}
            >
              {session.overallScore ? session.overallScore.toFixed(1) : "N/A"}
            </div>
            <div className="small text-muted">out of 10</div>
          </motion.div>
        </div>

        <div className="col-md-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 h-100"
          >
            <h3 className="h5 fw-bold mb-4">Performance Breakdown</h3>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <span className="d-flex align-items-center gap-2">
                  <FiCode className="text-primary" /> Technical Depth
                </span>
                <span className="fw-bold">
                  {metrics.technicalDepth.toFixed(1)}/10
                </span>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className={`progress-bar ${getScoreBg(metrics.technicalDepth)}`}
                  style={{ width: `${metrics.technicalDepth * 10}%` }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <span className="d-flex align-items-center gap-2">
                  <FiMessageSquare className="text-info" /> Communication
                  Clarity
                </span>
                <span className="fw-bold">{metrics.clarity.toFixed(1)}/10</span>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className={`progress-bar ${getScoreBg(metrics.clarity)}`}
                  style={{ width: `${metrics.clarity * 10}%` }}
                />
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between mb-1">
                <span className="d-flex align-items-center gap-2">
                  <FiActivity className="text-secondary" /> Confidence
                </span>
                <span className="fw-bold">
                  {metrics.confidence.toFixed(1)}/10
                </span>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className={`progress-bar ${getScoreBg(metrics.confidence)}`}
                  style={{ width: `${metrics.confidence * 10}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="d-flex justify-content-center gap-3"
      >
        <Link
          href="/tools/interview-simulator/dashboard"
          className="btn btn-outline-light px-4"
        >
          <FiArrowLeft className="me-2" />
          Dashboard
        </Link>
        <Link
          href="/tools/interview-simulator/start"
          className="btn btn-primary px-4"
        >
          <FiRefreshCw className="me-2" />
          Start New Interview
        </Link>
      </motion.div>
    </div>
  );
}

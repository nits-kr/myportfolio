"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiLoader,
  FiServer,
  FiShield,
} from "react-icons/fi";
import axios from "axios";

export default function EmailValidator() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const validateEmail = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tools/validate-email`,
        { email },
      );
      setResult(response.data.validation);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to validate email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isValid, details) => {
    if (isValid) return "text-success";
    if (details?.disposable) return "text-warning";
    return "text-danger";
  };

  const getStatusIcon = (isValid, details) => {
    if (isValid) return <FiCheck className="text-success" size={24} />;
    if (details?.disposable)
      return <FiAlertTriangle className="text-warning" size={24} />;
    return <FiX className="text-danger" size={24} />;
  };

  return (
    <div className="w-100" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="glass-card p-4 mb-4">
        <form onSubmit={validateEmail} className="d-flex flex-column gap-3">
          <div className="form-group">
            <label
              htmlFor="emailInput"
              className="form-label text-muted small fw-bold mb-2"
            >
              ENTER EMAIL ADDRESS
            </label>
            <div className="input-group">
              <span className="input-group-text glass-card border-end-0 bg-transparent text-primary">
                <FiMail size={18} />
              </span>
              <input
                id="emailInput"
                type="email"
                className="form-control glass-card border-start-0 ps-0 text-white"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: "rgba(255,255,255,0.05)" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <FiLoader className="spin" /> Validating...
              </>
            ) : (
              "Validate Email"
            )}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="alert alert-danger glass-card border-danger text-danger d-flex align-items-center gap-2"
          >
            <FiAlertTriangle /> {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4"
          >
            <div className="text-center mb-4">
              <div
                className={`d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 ${
                  result.isValid
                    ? "bg-success bg-opacity-10"
                    : "bg-danger bg-opacity-10"
                }`}
              >
                {getStatusIcon(result.isValid, result.details)}
              </div>
              <h3 className="h5 fw-bold mb-1">{result.message}</h3>
              <p className="text-muted small mb-0">{result.email}</p>
            </div>

            <div className="d-flex flex-column gap-2">
              {/* Syntax Check */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <FiMail className="text-muted" />
                  <span className="small">Syntax Check</span>
                </div>
                {result.details.syntax ? (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    Valid
                  </span>
                ) : (
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                    Invalid
                  </span>
                )}
              </div>

              {/* Disposable Check */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <FiShield className="text-muted" />
                  <span className="small">Disposable Check</span>
                </div>
                {!result.details.disposable ? (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    Safe
                  </span>
                ) : (
                  <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                    Disposable
                  </span>
                )}
              </div>

              {/* DNS Check */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <FiServer className="text-muted" />
                  <span className="small">MX Records</span>
                </div>
                {result.details.dns ? (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    Found
                  </span>
                ) : (
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                    Missing
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

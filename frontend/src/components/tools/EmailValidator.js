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
  FiInbox,
} from "react-icons/fi";
import { useValidateEmailMutation } from "@/store/services/toolsApi";

export default function EmailValidator() {
  const [email, setEmail] = useState("");
  const [validateEmail, { isLoading: loading, data, error: rtkError }] =
    useValidateEmailMutation();

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!email) return;
    validateEmail({ email });
  };

  const getStatusIcon = (isValid, details) => {
    if (isValid) return <FiCheck className="text-success" size={24} />;
    if (details?.disposable)
      return <FiAlertTriangle className="text-warning" size={24} />;
    if (!details?.mailbox) return <FiX className="text-danger" size={24} />;
    return <FiX className="text-danger" size={24} />;
  };

  const result = data?.validation;
  const error = rtkError?.data?.message || rtkError?.error;

  return (
    <div className="w-100" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="glass-card p-4 mb-4">
        <form onSubmit={handleValidate} className="d-flex flex-column gap-3">
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
                <FiLoader className="spin" /> Deep Validating...
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
              <p className="text-muted small mb-0 text-break">{result.email}</p>
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

              {/* Mailbox Check */}
              <div
                className="d-flex align-items-center justify-content-between p-3 rounded-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <FiInbox className="text-muted" />
                  <span className="small">Inbox Existence</span>
                </div>
                {result.details.mailbox === true ? (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    Active
                  </span>
                ) : result.details.mailbox === false ? (
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                    No Inbox Found
                  </span>
                ) : (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                    Skipped (Restricted)
                  </span>
                )}
              </div>
            </div>

            {result.details.dns && (
              <div
                className={`mt-4 p-3 rounded-3 text-center border ${
                  result.details.mailbox === true
                    ? "bg-success bg-opacity-10 border-success border-opacity-25"
                    : "bg-info bg-opacity-10 border-info border-opacity-25"
                }`}
              >
                <p
                  className={`small mb-0 fw-bold ${
                    result.details.mailbox === true
                      ? "text-success"
                      : "text-info"
                  }`}
                >
                  {result.details.mailbox === true
                    ? "Verified: This person has an active inbox."
                    : "Partial Verify: Syntax & Domain are valid (Deep check restricted)."}
                </p>
              </div>
            )}
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

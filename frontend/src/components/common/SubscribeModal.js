"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscribeMutation } from "@/store/services/blogsApi";
import { IoClose, IoMailOutline, IoPersonOutline } from "react-icons/io5";

export default function SubscribeModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [subscribe, { isLoading, error }] = useSubscribeMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await subscribe({ email }).unwrap();

      if (result.success) {
        const isReturning = result.message === "Already subscribed";
        const finalName = isReturning ? result.data.name : "";

        if (finalName) localStorage.setItem("blogSubscriberName", finalName);
        localStorage.setItem("blogSubscriberEmail", email);

        setIsReturningUser(isReturning);
        setDisplayName(finalName);
        setIsSuccess(true);

        setTimeout(() => {
          onSuccess(email);
          onClose();
          setTimeout(() => {
            setIsSuccess(false);
            setIsReturningUser(false);
            setEmail("");
          }, 500);
        }, 2000);
      }
    } catch (err) {
      console.error("Subscription failed:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="subscribe-modal-content glass-card p-4 p-md-5"
          >
            <button className="close-btn" onClick={onClose}>
              <IoClose size={24} />
            </button>

            {isSuccess ? (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="success-icon mb-3"
                >
                  {isReturningUser ? "✨" : "🎉"}
                </motion.div>
                <h3>{isReturningUser ? "Welcome Back!" : "Thank You!"}</h3>
                <p className="text-muted">
                  {isReturningUser && displayName
                    ? `Good to see you again, ${displayName}. Restoring your session...`
                    : isReturningUser
                      ? "Welcome back! Restoring your session..."
                      : "You're now subscribed. Unlocking your interaction..."}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Join the Community</h2>
                  <p className="text-muted small">
                    Subscribe to like, reply, and share our latest stories.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3 input-group-modern">
                    <span className="input-icon">
                      <IoMailOutline />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <p className="text-danger small mb-3">
                      {error.data?.message || "Something went wrong"}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Continue"}
                  </button>
                </form>
              </>
            )}
          </motion.div>

          <style jsx>{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1050;
              padding: 20px;
            }
            .subscribe-modal-content {
              position: relative;
              max-width: 450px;
              width: 100%;
              background: var(--glass-bg) !important;
              backdrop-filter: blur(15px);
              border: 1px solid var(--glass-border) !important;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .close-btn {
              position: absolute;
              top: 15px;
              right: 15px;
              background: none;
              border: none;
              color: var(--foreground);
              opacity: 0.6;
              cursor: pointer;
              transition: all 0.2s;
              z-index: 10;
            }
            .close-btn:hover {
              opacity: 1;
              transform: rotate(90deg);
            }
            .input-group-modern {
              position: relative !important;
              display: block !important;
              width: 100%;
            }
            .input-group-modern .input-icon {
              position: absolute !important;
              left: 16px !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              color: var(--foreground) !important;
              opacity: 0.6 !important;
              z-index: 100 !important;
              font-size: 1.25rem !important;
              display: flex !important;
              align-items: center !important;
              pointer-events: none !important;
            }
            .input-group-modern .form-control {
              padding-left: 50px !important;
              border-radius: 12px !important;
              height: 54px !important;
              border: 1px solid var(--glass-border) !important;
              background: rgba(255, 255, 255, 0.05) !important;
              color: var(--foreground) !important;
              width: 100% !important;
              transition: all 0.3s ease !important;
            }
            .input-group-modern .form-control::placeholder {
              color: var(--foreground);
              opacity: 0.4;
            }
            .input-group-modern .form-control:focus {
              box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15) !important;
              border-color: #0d6efd !important;
              background: rgba(255, 255, 255, 0.1) !important;
            }
            .success-icon {
              font-size: 4rem;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscribeMutation } from "@/store/services/blogsApi";
import { IoClose, IoMailOutline, IoPersonOutline } from "react-icons/io5";

export default function SubscribeModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribe, { isLoading, error }] = useSubscribeMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await subscribe({ name, email }).unwrap();
      if (result.success) {
        localStorage.setItem("blogSubscriberName", name);
        localStorage.setItem("blogSubscriberEmail", email);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(email);
          onClose();
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
                  🎉
                </motion.div>
                <h3>Thank You!</h3>
                <p className="text-muted">
                  You&apos;re now subscribed. Unlocking your interaction...
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
                    <IoPersonOutline className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4 input-group-modern">
                    <IoMailOutline className="input-icon" />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                    {isLoading ? "Subscribing..." : "Subscribe Now"}
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
              background: rgba(0, 0, 0, 0.4);
              backdrop-filter: blur(5px);
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
              background: rgba(255, 255, 255, 0.8) !important;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            .close-btn {
              position: absolute;
              top: 15px;
              right: 15px;
              background: none;
              border: none;
              color: #6c757d;
              cursor: pointer;
              transition: color 0.2s;
            }
            .close-btn:hover {
              color: #343a40;
            }
            .input-group-modern {
              position: relative;
            }
            .input-icon {
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              color: #6c757d;
              z-index: 5;
            }
            .form-control {
              padding-left: 40px;
              border-radius: 10px;
              height: 48px;
              border: 1px solid rgba(0, 0, 0, 0.1);
              background: rgba(255, 255, 255, 0.5);
            }
            .form-control:focus {
              box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
              border-color: #0d6efd;
              background: #fff;
            }
            .success-icon {
              font-size: 3rem;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}

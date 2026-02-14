"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircle, IoWarning, IoClose } from "react-icons/io5";
import { useEffect } from "react";

export default function Toast({
  message,
  type = "error",
  onClose,
  duration = 5000,
}) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle size={20} />,
    error: <IoWarning size={20} />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        className={`toast-notification toast-${type}`}
      >
        <div className="toast-icon">{icons[type]}</div>
        <p className="toast-message">{message}</p>
        <button className="toast-close" onClick={onClose}>
          <IoClose size={18} />
        </button>

        <style jsx>{`
          .toast-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: var(--surface-main);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            border: 1px solid var(--border-light);
            max-width: 400px;
            min-width: 300px;
          }
          .toast-error {
            border-left: 4px solid #ef4444;
          }
          .toast-success {
            border-left: 4px solid #10b981;
          }
          .toast-icon {
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }
          .toast-error .toast-icon {
            color: #ef4444;
          }
          .toast-success .toast-icon {
            color: #10b981;
          }
          .toast-message {
            flex: 1;
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-main);
            line-height: 1.4;
          }
          .toast-close {
            flex-shrink: 0;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            opacity: 0.6;
            transition: opacity 0.2s;
          }
          .toast-close:hover {
            opacity: 1;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

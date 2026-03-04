"use client";

import { useConnectivity } from "@/hooks/useConnectivity";
import { motion, AnimatePresence } from "framer-motion";
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";

const ONLINE_BANNER_DURATION_MS = 3000;

export const OnlineStatus = () => {
  const { isOnline } = useConnectivity();
  const prevOnlineRef = useRef(null);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Skip the first render (initial page load) — only react to transitions
    if (prevOnlineRef.current === null) {
      prevOnlineRef.current = isOnline;
      return;
    }

    // Transition: offline → online
    if (!prevOnlineRef.current && isOnline) {
      clearTimeout(timerRef.current);
      setShowOnlineBanner(true);
      timerRef.current = setTimeout(() => {
        setShowOnlineBanner(false);
      }, ONLINE_BANNER_DURATION_MS);
    }

    prevOnlineRef.current = isOnline;

    return () => clearTimeout(timerRef.current);
  }, [isOnline]);

  const baseStyle = {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    top: "80px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    padding: "0.6rem 1.25rem",
    borderRadius: "50px",
    fontWeight: 600,
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    letterSpacing: "0.2px",
    pointerEvents: "auto",
    cursor: "default",
  };

  const offlineStyle = {
    ...baseStyle,
    backgroundColor: "rgba(239, 68, 68, 0.88)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "white",
  };

  const onlineStyle = {
    ...baseStyle,
    backgroundColor: "rgba(16, 185, 129, 0.88)",
    border: "1px solid rgba(16, 185, 129, 0.4)",
    color: "white",
  };

  return (
    <AnimatePresence>
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          style={offlineStyle}
          aria-live="assertive"
          role="status"
        >
          <RiWifiOffLine size={16} />
          <span>No internet connection</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: "0.5rem",
              padding: "0.2rem 0.75rem",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "50px",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.3)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.2)")
            }
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Back Online Banner ── */}
      {showOnlineBanner && (
        <motion.div
          key="online-banner"
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          style={onlineStyle}
          aria-live="polite"
          role="status"
        >
          <RiWifiLine size={16} />
          <span>Back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnlineStatus;

"use client";

import { useConnectivity } from "@/hooks/useConnectivity";
import { motion, AnimatePresence } from "framer-motion";
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";

export const OnlineStatus = () => {
  const isOnline = useConnectivity();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="offline-banner"
          style={{
            position: "fixed",
            top: "90px", // Just below the fixed navbar
            left: "20px",
            right: "20px",
            backgroundColor: "rgba(239, 68, 68, 0.9)",
            backdropFilter: "blur(10px)",
            color: "white",
            padding: "0.75rem 1rem",
            textAlign: "center",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontWeight: "600",
            fontSize: "0.85rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <RiWifiOffLine size={18} />
          <span>Connection lost. Working offline.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnlineStatus;

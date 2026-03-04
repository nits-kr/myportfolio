"use client";

/**
 * OfflineSyncIndicator
 *
 * Shows a subtle pill at the bottom of the screen when there are pending
 * actions queued offline (in the Dexie WAL). Disappears automatically
 * when all actions have been synced.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloudOffLine, RiCloudLine } from "react-icons/ri";
import db from "@/lib/db";

export const OfflineSyncIndicator = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncingCount, setSyncingCount] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      try {
        const pending = await db.mutations
          .where("status")
          .equals("pending")
          .count();
        const syncing = await db.mutations
          .where("status")
          .equals("syncing")
          .count();
        setPendingCount(pending);
        setSyncingCount(syncing);
      } catch {
        // Ignore if Dexie not available
      }
    };

    // Check immediately
    checkPending();

    // Poll every 3 seconds
    const interval = setInterval(checkPending, 3000);
    return () => clearInterval(interval);
  }, []);

  const total = pendingCount + syncingCount;
  const isSyncing = syncingCount > 0;

  return (
    <AnimatePresence>
      {total > 0 && (
        <motion.div
          key="sync-indicator"
          initial={{ y: 80, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 80, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "80px", // Above mobile bottom nav
            left: "50%",
            zIndex: 9990,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 1rem",
            borderRadius: "50px",
            fontSize: "0.78rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            backgroundColor: isSyncing
              ? "rgba(16, 185, 129, 0.85)"
              : "rgba(245, 158, 11, 0.88)",
            border: isSyncing
              ? "1px solid rgba(16, 185, 129, 0.4)"
              : "1px solid rgba(245, 158, 11, 0.4)",
            color: "white",
            transition: "background-color 0.4s ease, border-color 0.4s ease",
          }}
        >
          {isSyncing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              style={{ display: "flex" }}
            >
              <RiCloudLine size={15} />
            </motion.div>
          ) : (
            <RiCloudOffLine size={15} />
          )}
          <span>
            {isSyncing
              ? `Syncing ${syncingCount} action${syncingCount > 1 ? "s" : ""}…`
              : `${pendingCount} action${pendingCount > 1 ? "s" : ""} queued offline`}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineSyncIndicator;

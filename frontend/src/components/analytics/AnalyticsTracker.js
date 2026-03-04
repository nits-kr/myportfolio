"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SESSION_KEY = "portfolio_session_id";
const LAST_PATH_KEY = "portfolio_last_path";

const getSessionId = () => {
  if (typeof window === "undefined") return null;
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const isLocalhost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1"
  );
};

const sendJson = (url, payload, useBeacon = false) => {
  try {
    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // ignore tracking errors
  }
};

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLocalhost()) return;
    if (user?.role === "admin") return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    // Use window.location.search instead of useSearchParams() hook to avoid Suspense conflicts
    const search = window.location.search;
    const currentPath = `${pathname}${search}`;
    const lastPath = localStorage.getItem(LAST_PATH_KEY);
    localStorage.setItem(LAST_PATH_KEY, currentPath);

    if (lastPath !== currentPath) {
      sendJson(`${API_BASE}/analytics/track`, {
        sessionId,
        path: currentPath,
        title: document.title,
        referrer: document.referrer || "",
      });
    }
  }, [pathname, user?.role]); // We also re-run on pathname change to catch search-only updates if needed

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLocalhost()) return;
    if (user?.role === "admin") return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    const sendHeartbeat = (useBeacon = false) => {
      sendJson(
        `${API_BASE}/analytics/heartbeat`,
        {
          sessionId,
          path: pathname,
        },
        useBeacon,
      );
    };

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendHeartbeat(true);
      } else {
        sendHeartbeat();
      }
    };
    const handleUnload = () => sendHeartbeat(true);

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [pathname, user?.role]);

  return null;
}

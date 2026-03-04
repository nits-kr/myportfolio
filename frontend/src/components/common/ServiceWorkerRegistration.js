"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

const CHECK_INTERVAL_MS = 60_000; // Check for SW updates every 60 seconds

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let registration = null;

    const registerSW = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none", // Always check for fresh SW on navigation
        });

        // ── Detect when a new SW has been installed ──────────────────────────
        const handleUpdateFound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // A new version is ready — prompt user to reload
              toast(
                (t) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🚀</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                        Update Available
                      </div>
                      <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>
                        A new version of the app is ready.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // Tell the waiting SW to activate now
                        newWorker.postMessage({ type: "SKIP_WAITING" });
                        window.location.reload();
                      }}
                      style={{
                        padding: "0.3rem 0.75rem",
                        background: "#7c3aed",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Reload
                    </button>
                  </div>
                ),
                {
                  duration: Infinity, // Keep until user acts
                  style: { maxWidth: "360px" },
                },
              );
            }
          });
        };

        registration.addEventListener("updatefound", handleUpdateFound);

        // Also handle the case where SW was already waiting before this page loaded
        if (registration.waiting && navigator.serviceWorker.controller) {
          handleUpdateFound();
        }

        // ── Periodic update check ────────────────────────────────────────────
        const intervalId = setInterval(() => {
          registration.update().catch(() => {
            // Silently ignore update check failures (user may be offline)
          });
        }, CHECK_INTERVAL_MS);

        // ── Handle controller change (new SW activated) ──────────────────────
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        return () => {
          clearInterval(intervalId);
          registration.removeEventListener("updatefound", handleUpdateFound);
        };
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[SW] Registration failed:", err);
        }
      }
    };

    // Register after the page is fully loaded to not compete with critical resources
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW, { once: true });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;

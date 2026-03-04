"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Enterprise-grade connectivity hook.
 *
 * - Initializes as `true` on server to avoid SSR hydration mismatch.
 * - Hydrates from `navigator.onLine` on first client render.
 * - Listens to native `online`/`offline` browser events.
 * - Performs a real connectivity ping every 30s to detect "connected but no internet" (e.g. captive portals).
 *
 * @returns {{ isOnline: boolean, isChecking: boolean }}
 */
export const useConnectivity = () => {
  // Start as `true` on both server and client to avoid hydration mismatch.
  // We'll correct the value in the first useEffect (client-only).
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const pingIntervalRef = useRef(null);

  /**
   * Performs a real connectivity test by fetching a tiny resource.
   * `navigator.onLine` can be true on a LAN with no actual internet.
   */
  const checkRealConnectivity = async () => {
    if (typeof window === "undefined") return;
    setIsChecking(true);
    try {
      // Fetch a tiny, reliable endpoint with no-cache to force network hit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      await fetch("/manifest.json?ping=" + Date.now(), {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Hydrate with real browser state on first client-side mount
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Verify it's actually connected, not just LAN-connected
      checkRealConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic connectivity check every 30 seconds
    pingIntervalRef.current = setInterval(checkRealConnectivity, 30_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  return { isOnline, isChecking };
};

export default useConnectivity;

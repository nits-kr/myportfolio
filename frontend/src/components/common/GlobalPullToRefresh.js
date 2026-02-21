"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// High-Fidelity iOS Style SVG Spinner Component
const IOSSpinner = ({ active = false }) => (
  <svg
    className={`ios-spinner ${active ? "active" : ""}`}
    viewBox="0 0 24 24"
    width="28"
    height="28"
    style={{
      opacity: active ? 1 : 0.5,
      transition: "opacity 0.2s",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
    }}
  >
    <style>
      {`
        .ios-spinner.active { animation: ios-spin 1s steps(8, end) infinite; }
        @keyframes ios-spin { 100% { transform: rotate(360deg); } }
      `}
    </style>
    <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="3" x2="12" y2="6" opacity="1" />
      <line x1="18.36" y1="5.64" x2="16.24" y2="7.76" opacity="0.875" />
      <line x1="21" y1="12" x2="18" y2="12" opacity="0.75" />
      <line x1="18.36" y1="18.36" x2="16.24" y2="16.24" opacity="0.625" />
      <line x1="12" y1="21" x2="12" y2="18" opacity="0.5" />
      <line x1="5.64" y1="18.36" x2="7.76" y2="16.24" opacity="0.375" />
      <line x1="3" y1="12" x2="6" y2="12" opacity="0.25" />
      <line x1="5.64" y1="5.64" x2="7.76" y2="7.76" opacity="0.125" />
    </g>
  </svg>
);

// Constants
const MAX_PULL = 100;
const REFRESH_THRESHOLD = 70;

export default function GlobalPullToRefresh({ children }) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Interaction State
  const startY = useRef(0);
  const isPulling = useRef(false);

  // Handle persistent refresh state across page reloads
  useEffect(() => {
    const isPWARefreshing = sessionStorage.getItem("pwa_refresh_active");
    if (isPWARefreshing === "true") {
      setIsRefreshing(true);
      setPullDistance(REFRESH_THRESHOLD);

      // Clear the flag after a delay to allow the user to see the "load complete" transition
      const timer = setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        sessionStorage.removeItem("pwa_refresh_active");
      }, 1000); // 1s is usually enough for hydration and initial data check

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Only allow pull-to-refresh if we are at the very top
      if (window.scrollY > 0 || isRefreshing) return;

      // Safety: Prevent trigger if body is locked (drawer open) or if an input is focused (keyboard open)
      const isBodyLocked = document.body.style.overflow === "hidden";
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

      if (!isBodyLocked && !isInputFocused) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Only handle downward pulls
      if (deltaY > 0) {
        // Logarithmic-style dampening for a more professional "resistive" feel
        // This makes it harder to pull as you get closer to the limit
        const resistance = 0.4;
        const distance = Math.min(deltaY * resistance, MAX_PULL);
        setPullDistance(distance);

        // Prevent browser's native pull-to-refresh if we've started our own
        if (deltaY > 10 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      setIsDragging(false);

      if (pullDistance >= REFRESH_THRESHOLD) {
        setIsRefreshing(true);
        // We set it slightly lower than threshold for the "pulsing" reload feel
        setPullDistance(REFRESH_THRESHOLD - 5);

        try {
          sessionStorage.setItem("pwa_refresh_active", "true");
        } catch (err) {
          console.error("Session storage unavailable", err);
        }

        // Small delay to let the user see the "Active" spinner trigger before reload
        setTimeout(() => {
          window.location.reload();
        }, 200);
      } else {
        setPullDistance(0);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      container.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [pullDistance, isRefreshing]);

  return (
    <div ref={containerRef} className="ptr-global-wrapper">
      {/* 
          Spinner Container: Pulled down over the content.
          We don't shift the content anymore to avoid stacking context 'trapping' 
          for fixed elements like the Bottom Nav and FABs. 
      */}
      <div
        className="ptr-indicator"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance > 15 ? 1 : 0,
          display: pullDistance > 0 || isRefreshing ? "flex" : "none",
          transition: isDragging
            ? "none"
            : "transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.2s",
          pointerEvents: "none",
        }}
      >
        <div
          className="ptr-content"
          style={{
            // Add a subtle scale effect as we reach threshold
            scale: Math.min(
              1.1,
              0.8 + (pullDistance / REFRESH_THRESHOLD) * 0.3,
            ),
          }}
        >
          <IOSSpinner
            active={pullDistance >= REFRESH_THRESHOLD - 10 || isRefreshing}
          />
        </div>
      </div>

      <div className="ptr-children">{children}</div>
    </div>
  );
}

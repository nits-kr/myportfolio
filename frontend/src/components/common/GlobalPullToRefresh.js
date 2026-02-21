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

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Only allow pull-to-refresh if we are at the very top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Ensure we are pulling downwards, not scrolling upwards
      if (deltaY > 0 && window.scrollY === 0) {
        // Apply friction to the pull distance
        const distance = Math.min(deltaY * 0.4, MAX_PULL);
        setPullDistance(distance);

        // Prevent default browser refresh/scroll behavior during our custom interaction
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      setIsDragging(false);

      if (pullDistance >= REFRESH_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(REFRESH_THRESHOLD); // Lock it at the threshold while refreshing

        // Use router.refresh() for a soft-reload or window.location.reload() for a full PWA refresh.
        // We add a tiny delay so the "Active" spin animation can be seen before the browser freezes the UI to reload.
        setTimeout(() => {
          window.location.reload();
        }, 150);
      } else {
        // Snap back if threshold not met
        setPullDistance(0);
      }
    };

    const container = containerRef.current;
    if (container) {
      // Need passive: false to be able to call e.preventDefault()
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
      <div
        className="ptr-indicator"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance > 20 ? 1 : 0,
          display: pullDistance > 0 || isRefreshing ? "flex" : "none",
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s",
        }}
      >
        <div className="ptr-content">
          <IOSSpinner
            active={pullDistance >= REFRESH_THRESHOLD || isRefreshing}
          />
        </div>
      </div>

      <div
        className="ptr-children"
        style={{
          transform:
            pullDistance !== 0 ? `translateY(${pullDistance}px)` : "none",
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_PROGRESS_STYLES = `
  @keyframes np-shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes np-bar-enter {
    from { opacity: 0; transform: scaleX(0); transform-origin: left; }
    to { opacity: 1; transform: scaleX(1); transform-origin: left; }
  }
  @keyframes np-glow-pulse {
    0%, 100% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.8), 0 0 30px rgba(124, 58, 237, 0.4); }
    50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.9), 0 0 50px rgba(6, 182, 212, 0.5); }
  }
  @keyframes np-dot-bounce {
    0%, 80%, 100% { transform: scale(0.5) translateY(0); opacity: 0.4; }
    40% { transform: scale(1) translateY(-3px); opacity: 1; }
  }
  @keyframes np-overlay-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes np-spinner-ring {
    to { transform: rotate(360deg); }
  }
  @keyframes np-spinner-ring-rev {
    to { transform: rotate(-360deg); }
  }
  @keyframes np-content-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Top progress bar */
  .np-bar-wrap {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 99998;
    height: 3px;
    pointer-events: none;
  }
  .np-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #7c3aed, #06b6d4, #a855f7, #7c3aed);
    background-size: 300% 100%;
    animation: np-shimmer 1.2s linear infinite;
    border-radius: 0 3px 3px 0;
    transition: width 0.3s ease;
    position: relative;
  }
  .np-bar-fill::after {
    content: '';
    position: absolute;
    right: 0; top: -2px;
    width: 80px; height: 7px;
    background: radial-gradient(ellipse at right, rgba(6, 182, 212, 0.9) 0%, transparent 70%);
    animation: np-glow-pulse 1.2s ease-in-out infinite;
    border-radius: 50%;
    filter: blur(2px);
  }

  /* Full-screen overlay */
  .np-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #090d1a 0%, #0f172a 60%, #0a0e1a 100%);
    z-index: 99997;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: np-overlay-fade-in 0.15s ease forwards;
  }

  /* Blobs */
  .np-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
  }
  .np-blob-1 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%);
    top: -60px; left: -60px;
  }
  .np-blob-2 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
    bottom: -50px; right: -50px;
  }

  /* Orb */
  .np-orb {
    position: relative;
    width: 100px; height: 100px;
    margin-bottom: 36px;
  }
  .np-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
  }
  .np-ring-1 {
    border-top-color: #7c3aed;
    border-right-color: rgba(124, 58, 237, 0.25);
    animation: np-spinner-ring 1.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }
  .np-ring-2 {
    inset: 12px;
    border-top-color: #06b6d4;
    border-left-color: rgba(6, 182, 212, 0.25);
    animation: np-spinner-ring-rev 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }
  .np-ring-3 {
    inset: 24px;
    border-bottom-color: #a855f7;
    border-right-color: rgba(168, 85, 247, 0.25);
    animation: np-spinner-ring 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }
  .np-icon {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    color: #94a3b8;
  }

  /* Text */
  .np-content {
    text-align: center;
    animation: np-content-up 0.4s 0.1s ease both;
  }
  .np-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.06em;
    background: linear-gradient(135deg, #e2e8f0, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 4px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .np-sub {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #475569;
    margin: 0 0 24px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .np-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
  }
  .np-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    animation: np-dot-bounce 1.2s ease-in-out infinite;
  }
  .np-dot:nth-child(1) { background: #7c3aed; animation-delay: 0s; }
  .np-dot:nth-child(2) { background: #06b6d4; animation-delay: 0.2s; }
  .np-dot:nth-child(3) { background: #a855f7; animation-delay: 0.4s; }
`;

// Width checkpoints to simulate progress feel
const PROGRESS_STEPS = [15, 35, 55, 72, 84, 91, 95];

export default function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathname = useRef(pathname);
  const progressTimer = useRef(null);
  const stepIndex = useRef(0);

  const startProgress = () => {
    setProgress(0);
    stepIndex.current = 0;
    setIsNavigating(true);

    const tick = () => {
      const step = PROGRESS_STEPS[stepIndex.current];
      if (step !== undefined) {
        setProgress(step);
        stepIndex.current++;
        const delay = 200 + stepIndex.current * 120;
        progressTimer.current = setTimeout(tick, delay);
      }
    };
    progressTimer.current = setTimeout(tick, 80);
  };

  const finishProgress = () => {
    clearTimeout(progressTimer.current);
    setProgress(100);
    setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 350);
  };

  // Intercept all anchor clicks to start loader immediately
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // Only trigger for internal same-origin navigation
      if (href.startsWith("/") || href.startsWith(window.location.origin)) {
        const target = href.startsWith("/")
          ? href
          : href.replace(window.location.origin, "");
        // Don't show loader for same page or hash links
        if (target !== pathname && !target.startsWith("#")) {
          startProgress();
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  // Detect when navigation has completed
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      if (isNavigating) {
        finishProgress();
      }
    }
  }, [pathname, isNavigating]);

  if (!isNavigating) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_PROGRESS_STYLES }} />

      {/* Top shimmer bar always visible */}
      <div className="np-bar-wrap">
        <div className="np-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Full overlay for longer navigations (shown after brief delay) */}
      <div className="np-overlay">
        <div className="np-blob np-blob-1" />
        <div className="np-blob np-blob-2" />

        <div className="np-orb">
          <div className="np-ring np-ring-1" />
          <div className="np-ring np-ring-2" />
          <div className="np-ring np-ring-3" />
          <div className="np-icon">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        <div className="np-content">
          <p className="np-title">NK Portfolio</p>
          <p className="np-sub">Loading page</p>
          <div className="np-dots">
            <span className="np-dot" />
            <span className="np-dot" />
            <span className="np-dot" />
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

// High-Fidelity iOS Style Spinner (Self-contained SVG to prevent missing CSS issues)
const IOSSpinner = () => (
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    stroke="rgba(255, 255, 255, 0.85)"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
  >
    <style>
      {`
        .img-spinner-blade {
          animation: img-spinner-fade 1s linear infinite;
        }
        @keyframes img-spinner-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}
    </style>
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1="12"
        y1="3"
        x2="12"
        y2="7"
        className="img-spinner-blade"
        transform={`rotate(${i * 30} 12 12)`}
        style={{ animationDelay: `${-1 + i * (1 / 12)}s` }}
      />
    ))}
  </svg>
);

/**
 * Reusable image component that shows a native iOS-style spinner while loading,
 * then fades the image in once fully loaded. Handles cached images (no blink).
 */
export default function ImageWithSpinner({
  src,
  alt,
  style,
  className,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const imgRef = useRef(null);
  const spinnerTimerRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If image is already cached/complete, mark as loaded immediately – no blink, no spinner
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }

    // Only show the spinner after 150ms delay — avoids flash for fast-loading images
    spinnerTimerRef.current = setTimeout(() => setShowSpinner(true), 150);

    return () => clearTimeout(spinnerTimerRef.current);
  }, [src]);

  const handleLoad = () => {
    clearTimeout(spinnerTimerRef.current);
    setShowSpinner(false);
    setLoaded(true);
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {showSpinner && !loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.55)",
            borderRadius: "inherit",
            zIndex: 2,
          }}
        >
          <IOSSpinner />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
          display: "block",
          borderRadius: "inherit",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}

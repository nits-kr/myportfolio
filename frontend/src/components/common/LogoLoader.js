"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LogoLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (document.readyState === "complete") {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      };

      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#0f172a",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "opacity 0.5s ease-out, visibility 0.5s",
        opacity: isLoading ? 1 : 0,
        visibility: isLoading ? "visible" : "hidden",
        pointerEvents: isLoading ? "all" : "none",
      }}
    >
      <div className="logo-loader-container">
        <Image
          src="/icons/icon-192x192.png"
          alt="Loading Logo"
          width={100}
          height={100}
          className="rotating-logo"
          priority
        />
      </div>
    </div>
  );
};

export default LogoLoader;

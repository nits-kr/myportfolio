"use client";

import { useEffect, useState } from "react";
import { loaderStyles } from "./loaderStyles";

const GlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the page has already loaded
    if (document.readyState === "complete") {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // 1.5s delay to show the loader
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

  if (!isLoading) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a", // Match body bg
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "opacity 0.5s ease-out",
        }}
      >
        <div className="modern-loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-hexagon"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalLoader;

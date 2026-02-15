"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * AdPlacement Component
 * Supports Google AdSense, Carbon Ads, or custom ad networks
 * @param {string} slot - Ad slot position (top, sidebar, inline, bottom)
 * @param {string} type - Ad type (adsense, carbon, custom)
 * @param {string} adClient - AdSense client ID
 * @param {string} adSlot - AdSense slot ID
 */
export default function AdPlacement({
  slot = "inline",
  type = "adsense",
  adClient = "ca-pub-XXXXXXXXXX", // Replace with actual AdSense ID
  adSlot = "XXXXXXXXXX",
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay ad rendering for better UX
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible && type === "adsense" && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [isVisible, type]);

  if (!isVisible) {
    return (
      <div className={`ad-placeholder ad-${slot} ${className}`}>
        <div className="ad-skeleton" />
      </div>
    );
  }

  // Google AdSense
  if (type === "adsense") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`ad-container ad-${slot} ${className}`}
      >
        <div className="ad-label">Advertisement</div>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={slot === "sidebar" ? "vertical" : "auto"}
          data-full-width-responsive="true"
        />
      </motion.div>
    );
  }

  // Carbon Ads (Developer-focused)
  if (type === "carbon") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`ad-container ad-${slot} carbon-ads ${className}`}
      >
        <div className="ad-label">Sponsored</div>
        <script
          async
          type="text/javascript"
          src="//cdn.carbonads.com/carbon.js?serve=YOUR_CARBON_ID&placement=yoursite"
          id="_carbonads_js"
        />
      </motion.div>
    );
  }

  // Custom/Placeholder Ad
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`ad-container ad-${slot} ad-custom ${className}`}
    >
      <div className="ad-label">Sponsored</div>
      <div className="custom-ad-content glass-card p-4 text-center">
        <div className="mb-3">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <h4 className="h6 fw-bold mb-2">Your Ad Here</h4>
        <p className="small text-muted mb-3">
          Reach{" "}
          {slot === "sidebar" ? "engaged developers" : "thousands of readers"}
        </p>
        <a
          href="/contact?service=custom&message=I'm interested in advertising"
          className="btn btn-sm btn-primary"
        >
          Advertise Here
        </a>
      </div>
    </motion.div>
  );
}

/**
 * Affiliate Link Component
 * Tracks clicks and conversions for affiliate marketing
 */
export function AffiliateLink({
  href,
  children,
  productName,
  className = "",
  ...props
}) {
  const handleClick = () => {
    // Track affiliate click
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "affiliate_click", {
        product_name: productName,
        link_url: href,
      });
    }

    // TODO: Send to backend for tracking
    console.log("Affiliate click:", { productName, href });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`affiliate-link ${className}`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      {...props}
    >
      {children}
      <span className="affiliate-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </span>
    </a>
  );
}

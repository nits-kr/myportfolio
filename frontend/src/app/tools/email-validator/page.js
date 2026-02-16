"use client";

import { motion } from "framer-motion";
import EmailValidator from "@/components/tools/EmailValidator";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function EmailValidatorPage() {
  return (
    <div className="container py-5 mt-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/tools"
          className="btn btn-link text-decoration-none text-muted mb-4 d-inline-flex align-items-center gap-2 p-0"
        >
          <FiArrowLeft /> Back to Tools
        </Link>

        <div className="text-center mb-5">
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill mb-3">
            Free Tool
          </span>
          <h1 className="display-5 fw-bold mb-3">Email List Validator</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
            Clean and validate email lists with advanced syntax checking, domain
            verification, and disposable email detection.
          </p>
        </div>

        <EmailValidator />
      </motion.div>
    </div>
  );
}

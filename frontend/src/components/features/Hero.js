"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSelector } from "react-redux";
import Image from "next/image";

import { GoVerified } from "react-icons/go";

export default function Hero() {
  const { profile } = useSelector((state) => state.content);

  return (
    <section className="container py-0 py-lg-5 hero-mobile-adjust">
      <div className="row align-items-center min-vh-75 g-4 g-lg-5">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <div className="d-flex flex-column align-items-center align-items-lg-start text-center text-lg-start">
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill mb-3 d-none">
              {profile.title}
            </span>
            <h1 className="display-4 display-lg-3 fw-bold mb-4 lh-tight">
              Building{" "}
              <span className="text-transparent bg-clip-text text-gradient-hero">
                Digital Experiences
              </span>{" "}
              That Matter.
            </h1>
            <p className="lead mb-4 mb-lg-5 d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-2">
              <span>
                <strong>I&apos;m {profile.name}</strong>
              </span>
              <GoVerified className="text-primary" />
              <span className="opacity-75">{profile.title}</span>
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-lg-start w-100">
              <Link
                href="/services"
                className="btn btn-primary btn-lg px-5 px-lg-4 d-flex align-items-center justify-content-center gap-2 shadow-lg"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Hire Me
              </Link>
              <Link
                href="/projects"
                className="btn btn-outline-light btn-lg rounded-pill px-5 px-lg-4"
              >
                View Work
              </Link>
              <Link
                href="/about"
                className="btn btn-outline-light btn-lg rounded-pill px-5 px-lg-4 d-none d-lg-inline-block"
              >
                About Me
              </Link>
            </div>
          </div>
        </div>
        <div className="col-lg-6 ps-lg-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="position-relative"
          >
            <div className="glass-card position-relative">
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-4 z-index-minus-1"></div>
              {/* Abstract Code/Visual Mockup */}
              <div className="rounded-3 overflow-hidden shadow-lg border border-white border-opacity-10">
                <div className="bg-dark p-2 d-flex gap-2 border-bottom border-secondary">
                  <div className="rounded-circle bg-danger mockup-dot"></div>
                  <div className="rounded-circle bg-warning mockup-dot"></div>
                  <div className="rounded-circle bg-success mockup-dot"></div>
                </div>
                <div className="bg-dark p-4 font-monospace text-success bg-opacity-75">
                  <p className="mb-0">
                    <span className="text-secondary">const</span>{" "}
                    <span className="text-warning">portfolio</span> ={" "}
                    <span className="text-info">new</span>{" "}
                    <span className="text-primary">Masterpiece</span>();
                    <br />
                    <span className="text-warning">portfolio</span>.
                    <span className="text-light">optimize</span>();
                    <br />
                    <span className="text-warning">portfolio</span>.
                    <span className="text-light">deploy</span>();
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

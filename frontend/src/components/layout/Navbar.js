"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useTheme } from "@/context/ThemeContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const scrollDirection = useScrollDirection();
  const [isMounted, setIsMounted] = useState(false);
  const role = user?.role;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    ...(isMounted && role === "admin"
      ? [{ name: "Tools", path: "/tools" }]
      : []),
    { name: "Projects", path: "/projects" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  const closeMenu = () => {
    const navbarCollapse = document.getElementById("navbarNav");
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      const toggler = document.querySelector(".navbar-toggler");
      if (toggler) toggler.click();
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top py-3"
      style={{ zIndex: 10000 }}
    >
      <div className="container glass-nav custom-nav-mobile d-flex justify-content-between align-items-center rounded-4">
        <Link
          href="/"
          className="navbar-brand fw-bold text-reset fs-4 d-none d-lg-block"
          style={{ position: "relative", zIndex: 10 }}
        >
          Port<span className="text-accent">folio</span>.
        </Link>
        <Link
          href="/"
          className="navbar-brand fw-bold text-reset fs-5 d-lg-none"
          style={{ position: "relative", zIndex: 10 }}
        >
          P<span className="text-accent">.</span>
        </Link>

        {/* Mobile Header Actions */}
        <div
          className="d-lg-none d-flex align-items-center gap-2"
          style={{ position: "relative", zIndex: 10 }}
        >
          <button
            onClick={toggleTheme}
            className="btn btn-link nav-link p-0 text-reset overflow-hidden"
            aria-label="Toggle theme"
            style={{ width: "32px", height: "32px", position: "relative" }}
          >
            <AnimatePresence mode="wait">
              {isMounted && (
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="d-flex align-items-center justify-content-center w-100 h-100"
                >
                  {theme === "dark" ? (
                    <FaSun size={20} />
                  ) : (
                    <FaMoon size={20} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            className="navbar-toggler border-0 p-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            suppressHydrationWarning
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* Navigation links & Actions */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
          style={{ position: "relative", zIndex: 5 }}
        >
          <ul className="navbar-nav align-items-center gap-3">
            {navLinks.map((link) => (
              <li
                className="nav-item"
                key={link.path}
                style={{ position: "relative", zIndex: 10 }}
              >
                <Link
                  href={link.path}
                  className={`nav-link ${pathname === link.path ? "fw-bold text-primary active-link" : ""}`}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            {/* Desktop only theme toggle */}
            <li className="nav-item d-none d-lg-block">
              <button
                onClick={toggleTheme}
                className="btn btn-link nav-link p-0 overflow-hidden"
                aria-label="Toggle theme"
                style={{ width: "32px", height: "32px", position: "relative" }}
              >
                <AnimatePresence mode="wait">
                  {isMounted && (
                    <motion.div
                      key={theme}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="d-flex align-items-center justify-content-center w-100 h-100"
                    >
                      {theme === "dark" ? (
                        <FaSun size={20} />
                      ) : (
                        <FaMoon size={20} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </li>

            {isMounted && isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  {user?.profileImage ? (
                    <div
                      className="rounded-circle overflow-hidden border border-primary flex-shrink-0"
                      style={{
                        width: "24px",
                        height: "24px",
                        position: "relative",
                      }}
                    >
                      <Image
                        src={user.profileImage}
                        alt={user.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold flex-shrink-0"
                      style={{
                        width: "24px",
                        height: "24px",
                        fontSize: "12px",
                        border: "1px solid var(--primary-color)",
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <span>{user?.name}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end glass-card border-0 mt-2">
                  <li>
                    <Link
                      className="dropdown-item"
                      href="/dashboard"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  </li>
                  {user?.role === "admin" && (
                    <li>
                      <Link
                        className="dropdown-item"
                        href="/dashboard/sub-users"
                        onClick={closeMenu}
                      >
                        Manage Sub-Users
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider opacity-50" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => dispatch(logout())}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item ms-lg-2">
                <Link
                  href="/login"
                  className="btn btn-premium btn-sm px-4"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

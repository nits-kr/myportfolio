"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useTheme } from "@/context/ThemeContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const scrollDirection = useScrollDirection();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
  ];

  return (
    <nav className="navbar navbar-expand-lg fixed-top py-3">
      <div className="container glass-nav custom-nav-mobile d-flex justify-content-between align-items-center rounded-4">
        <Link
          href="/"
          className="navbar-brand fw-bold text-reset fs-4 d-none d-lg-block"
        >
          Port<span className="text-accent">folio</span>.
        </Link>
        <Link
          href="/"
          className="navbar-brand fw-bold text-reset fs-5 d-lg-none"
        >
          P<span className="text-accent">.</span>
        </Link>

        {/* Mobile Header Actions */}
        <div className="d-lg-none d-flex align-items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn btn-link nav-link p-0 text-reset"
            aria-label="Toggle theme"
            suppressHydrationWarning
          >
            {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
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
        >
          <ul className="navbar-nav align-items-center gap-3">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <Link
                  href={link.path}
                  className={`nav-link ${pathname === link.path ? "fw-bold text-primary active-link" : ""}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}

            {/* Desktop only theme toggle */}
            <li className="nav-item d-none d-lg-block">
              <button
                onClick={toggleTheme}
                className="btn btn-link nav-link p-0"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
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
                  <FaUserCircle size={24} />
                  <span>{user?.name}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end glass-card border-0 mt-2">
                  <li>
                    <Link
                      className="dropdown-item text-white"
                      href="/dashboard"
                    >
                      Dashboard
                    </Link>
                  </li>
                  {user?.role === "admin" && (
                    <li>
                      <Link
                        className="dropdown-item text-white"
                        href="/dashboard/sub-users"
                      >
                        Manage Sub-Users
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider bg-white" />
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
                <Link href="/login" className="btn btn-premium btn-sm px-4">
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

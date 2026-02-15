"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import {
  FaHome,
  FaUser,
  FaProjectDiagram,
  FaThLarge,
  FaBookOpen,
  FaTools,
} from "react-icons/fa";
import { motion } from "framer-motion";

import { useSelector } from "react-redux";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: <FaHome size={20} /> },
    ...(isMounted && user?.role === "admin"
      ? [{ name: "Tools", path: "/tools", icon: <FaTools size={20} /> }]
      : [{ name: "About", path: "/about", icon: <FaUser size={20} /> }]),
    {
      name: "Projects",
      path: "/projects",
      icon: <FaProjectDiagram size={20} />,
    },
    { name: "Blogs", path: "/blogs", icon: <FaBookOpen size={20} /> },
    { name: "Dashboard", path: "/dashboard", icon: <FaThLarge size={20} /> },
  ];

  return (
    <div className="mobile-bottom-nav d-lg-none">
      <div className="nav-island d-flex justify-content-around align-items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item-link ${isActive ? "active" : ""}`}
            >
              <div className="nav-icon-wrapper">{item.icon}</div>
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

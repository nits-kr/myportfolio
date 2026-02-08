"use client";

import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer-main mt-auto">
      <div className="container">
        <div className="glass-card text-center">
          <div className="mb-4">
            <h3 className="fw-bold mb-3">Let&apos;s Connect</h3>
            <div className="d-flex justify-content-center gap-4">
              <a
                href="https://github.com/nits-kr"
                className="fs-4 hover-scale"
                aria-label="GitHub"
                title="GitHub"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/nitish-kumar-a18bb9258/"
                className="fs-4 hover-scale"
                aria-label="LinkedIn"
                title="LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="fs-4 hover-scale"
                aria-label="Twitter"
                title="Twitter"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
          <div className="mb-4">
            <a
              href="mailto:nits.kr99@gmail.com"
              className="text-decoration-none"
            >
              nits.kr99@gmail.com
            </a>
          </div>
          <p className="mb-0 small">
            © {new Date().getFullYear()} Nitish Kumar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { FaGithub, FaLinkedin, FaTwitter, FaHeart } from "react-icons/fa";

import moment from "moment";

export default function Footer() {
  return (
    <footer className="py-5 mt-auto">
      <div className="container">
        <div className="glass-card text-center">
          <div className="mb-4">
            <h3 className="fw-bold mb-3">Let's Connect</h3>
            <div className="d-flex justify-content-center gap-4">
              <a href="#" className="fs-4 hover-scale">
                <FaGithub />
              </a>
              <a href="#" className="fs-4 hover-scale">
                <FaLinkedin />
              </a>
              <a href="#" className="fs-4 hover-scale">
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
            © {moment().year()} Nitish Kumar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

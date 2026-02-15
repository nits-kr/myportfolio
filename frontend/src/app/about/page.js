"use client";

import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function AboutPage() {
  const { profile } = useSelector((state) => state.content);

  return (
    <div className="container py-5 min-vh-100">
      {/* Hero Section */}
      <section className="mb-5 py-lg-5">
        <div className="row align-items-center">
          <div className="col-lg-6 mb-5 mb-lg-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="position-relative"
            >
              <div
                className="glass-card p-4 p-md-5 position-relative z-1 border-0 shadow-lg mb-4 mb-lg-0"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.05) !important",
                }}
              >
                <span
                  className="text-primary fw-bold text-uppercase mb-2 d-block ls-2"
                  style={{ fontSize: "0.7rem" }}
                >
                  Get to know me
                </span>
                <h1 className="display-4 display-md-3 fw-bold mb-4 gradient-text">
                  About Me
                </h1>
                <p className="lead fw-medium mb-4 text-light">
                  I&apos;m <span className="text-primary">{profile.name}</span>,{" "}
                  {profile.title}.
                </p>
                <div className="subtext opacity-75 fs-5 leading-relaxed">
                  {profile.longBio || profile.bio}
                </div>
              </div>

              {/* Decorative background Elements */}
              <div
                className="position-absolute top-0 start-0 translate-middle rounded-circle"
                style={{
                  width: "300px",
                  height: "300px",
                  background:
                    "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
                  filter: "blur(60px)",
                  zIndex: 0,
                }}
              ></div>
            </motion.div>
          </div>

          <div className="col-lg-6 ps-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="h4 fw-bold mb-4 d-flex align-items-center gap-3">
                <span className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <i className="bi bi-cpu"></i>
                </span>
                Core Tech Stack
              </h3>
              <div className="row g-4">
                {profile.skills &&
                  Object.entries(profile.skills)
                    .slice(0, 2)
                    .map(([category, skills], catIdx) => (
                      <div className="col-md-6" key={category}>
                        <div
                          className="glass-card p-4 h-100 border-0"
                          style={{ background: "rgba(255, 255, 255, 0.02)" }}
                        >
                          <h4 className="h6 text-uppercase text-muted mb-3 ls-1 fw-bold">
                            {category}
                          </h4>
                          <div className="d-flex flex-wrap gap-2">
                            {skills.map((tech, idx) => (
                              <span
                                key={idx}
                                className="badge bg-dark-subtles border border-secondary-subtle text-light py-2 px-3 fw-normal"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="py-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4 mb-md-5"
        >
          <h2 className="display-6 fw-bold mb-3">Professional Competencies</h2>
          <p className="subtext mx-auto px-3" style={{ maxWidth: "600px" }}>
            Specialized in building high-performance applications with these
            core capabilities.
          </p>
        </motion.div>

        <div className="row g-4">
          {profile.competencies?.map((item, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-4 h-100 border-0 shadow-sm transition-all"
                style={{ background: "rgba(255, 255, 255, 0.025)" }}
              >
                <div className="fs-1 mb-3">{item.icon}</div>
                <h4 className="h5 fw-bold mb-3 text-primary">{item.title}</h4>
                <p className="subtext small mb-0 opacity-75">{item.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements & Deeper Skills */}
      <section className="py-5">
        <div className="row g-5">
          {profile.achievements && (
            <div className="col-lg-5">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="h4 fw-bold mb-4">Key Achievements</h3>
                <div className="d-flex flex-column gap-3">
                  <div className="glass-achievement">
                    <div className="text-primary mt-1">
                      <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
                      </svg>
                    </div>
                    <span className="fw-medium">
                      Planning and Development Authority
                    </span>
                  </div>
                  {profile.achievements.map((achievement, idx) => (
                    <div key={idx} className="glass-achievement">
                      <div className="text-primary mt-1">
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
                        </svg>
                      </div>
                      <span className="fw-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          <div className="col-lg-7">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="h4 fw-bold mb-4">Additional Technologies</h3>
              <div className="d-flex flex-wrap gap-2">
                {profile.skills &&
                  Object.entries(profile.skills)
                    .slice(2)
                    .map(([category, skills]) =>
                      skills.map((tech, idx) => (
                        <motion.span
                          key={`${category}-${idx}`}
                          whileHover={{ scale: 1.05 }}
                          className="glass-tag"
                          style={{ cursor: "default" }}
                        >
                          {tech}
                        </motion.span>
                      )),
                    )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

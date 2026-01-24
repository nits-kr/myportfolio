'use client';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function AboutPage() {
    const { profile } = useSelector((state) => state.content);

    return (
        <div className="container py-5">
            <div className="row align-items-center">
                <div className="col-lg-6 mb-5 mb-lg-0">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="position-relative"
                    >
                        <div className="glass-card p-5 position-relative z-1">
                            <h2 className="display-5 fw-bold mb-4">About Me</h2>
                            <p className="lead subtext mb-4">
                                I&apos;m {profile.name}, a passionate {profile.title}. I love building things that live on the internet.
                            </p>
                            <p className="subtext opacity-75">
                                My interest in web development started with a curiosity for how things work, leading me to master the MERN stack and modern frameworks.
                            </p>
                            <p className="subtext opacity-75 mt-3">
                                {profile.bio}
                            </p>
                        </div>

                        {/* Decorative background elements */}
                        <div className="position-absolute top-0 start-0 translate-middle bg-primary rounded-circle" style={{ width: '200px', height: '200px', filter: 'blur(80px)', zIndex: 0, opacity: 0.5 }}></div>
                        <div className="position-absolute bottom-0 end-0 translate-middle bg-secondary rounded-circle" style={{ width: '200px', height: '200px', filter: 'blur(80px)', zIndex: 0, opacity: 0.5 }}></div>
                    </motion.div>
                </div>

                <div className="col-lg-6 ps-lg-5">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="h4 fw-bold mb-4">Tech Stack</h3>
                        <div className="row g-3">
                            {['JavaScript (ES6+)', 'React / Next.js', 'Node.js / Express', 'MongoDB', 'Redux Toolkit', 'Bootstrap / Tailwind'].map((tech, idx) => (
                                <div key={idx} className="col-6">
                                    <div className="glass-card py-2 px-3 d-flex align-items-center gap-2">
                                        <span className="text-success">▹</span> {tech}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

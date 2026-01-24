'use client';

import { motion } from 'framer-motion';
import { useGetProjectsQuery } from '@/store/services/portfolioApi';

export default function ProjectsPage() {
    // Use the auto-generated hook for the query
    const { data: projects, error, isLoading } = useGetProjectsQuery();

    return (
        <div className="container py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
            >
                <span className="badge bg-secondary mb-2">My Work</span>
                <h1 className="fw-bold display-4">Featured Projects</h1>
                <p className="text-muted col-md-8 mx-auto lead">
                    A selection of projects that demonstrate my passion for building high-quality digital products.
                </p>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger text-center glass-card">
                    Error loading projects. Please try again later.
                </div>
            )}

            {/* Data Display */}
            {projects && (
                <div className="row g-4">
                    {projects.map((project) => (
                        <div key={project.id} className="col-lg-4 col-md-6">
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="glass-card h-100 p-0 overflow-hidden"
                            >
                                <div style={{ height: '200px', background: project.image }}></div>
                                <div className="p-4">
                                    <span className="text-primary small fw-bold text-uppercase">{project.category}</span>
                                    <h3 className="h4 fw-bold mt-2 mb-3">{project.title}</h3>
                                    <p className="text-muted mb-4">{project.desc}</p>
                                    <button className="btn btn-outline-light btn-sm rounded-pill px-3">View Details</button>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetProjectsQuery } from '@/store/services/portfolioApi';

export default function ProjectsPage() {
    const { data: projects, error, isLoading } = useGetProjectsQuery();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    console.log("projects", projects);


    return (
        <div className="container py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5"
            >
                <span className="badge bg-secondary mb-2">My Work</span>
                <h1 className="fw-bold display-4">Featured Projects</h1>
                <p className="text-white col-md-8 mx-auto lead">
                    A selection of projects that demonstrate my passion for building high-quality digital products.
                </p>
                {isMounted && isAuthenticated && (
                    <div className="mt-4">
                        <Link href="/dashboard" className="btn btn-primary rounded-pill px-4">
                            + Add New Project
                        </Link>
                    </div>
                )}
            </motion.div>

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

            {projects?.data?.length > 0 ? (
                <div className="row g-4">
                    {projects.data.map((project) => (
                        <div key={project._id} className="col-lg-4 col-md-6">
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="glass-card h-100 p-4"
                            >
                                <span className="badge bg-info text-dark text-uppercase mb-2">
                                    {project.status}
                                </span>

                                <h3 className="h4 fw-bold mt-2 mb-3 text-white">
                                    {project.title}
                                </h3>

                                <div
                                    className="text-white small mb-4"
                                    dangerouslySetInnerHTML={{ __html: project.body }}
                                />

                                <small className="text-white">
                                    Created on {new Date(project.createdAt).toLocaleDateString()}
                                </small>
                            </motion.div>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading && !error && (
                    <div className="text-center py-5 glass-card">
                        <h3 className="h5 text-white">No projects found</h3>
                        <p className="text-white small">Check back later for updates!</p>
                    </div>
                )
            )}
        </div>
    );
}

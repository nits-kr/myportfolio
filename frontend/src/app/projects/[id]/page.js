"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetProjectQuery } from "@/store/services/projectsApi";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: projectData, error, isLoading } = useGetProjectQuery(id);
  const project = projectData?.data;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger glass-card">
          Project not found or error loading project.
        </div>
        <Link href="/projects" className="btn btn-outline-primary mt-3">
          &larr; Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 p-md-5"
      >
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <span
              className={`badge bg-${project.status === "Completed" ? "success" : project.status === "In Progress" ? "warning" : "primary"} mb-2`}
            >
              {project.status}
            </span>
            <h1 className="fw-bold display-4 mb-2">{project.title}</h1>
            <p className="text-muted">
              Created on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Link
              href="/projects"
              className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{
                width: "40px",
                height: "40px",
                transition: "all 0.3s ease",
              }}
              title="Back to Projects"
            >
              <IoArrowBack size={20} />
            </Link>
          </div>
        </div>

        <div className="project-content">
          <div dangerouslySetInnerHTML={{ __html: project.body }} />
        </div>

        {project.description && (
          <div className="mt-4 p-4 bg-body-tertiary rounded">
            <h5 className="border-bottom pb-2 mb-3">Additional Description</h5>
            <p>{project.description}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

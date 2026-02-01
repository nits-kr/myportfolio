"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetProjectsQuery,
  useUpdateDeleteStatusMutation,
} from "@/store/services/projectsApi";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

export default function ProjectsPage() {
  const { user } = useSelector((state) => state.auth);
  const { data: projectsData, error, isLoading } = useGetProjectsQuery();
  const [deleteProject] = useUpdateDeleteStatusMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const projects = projectsData?.data || [];
  const role = user?.role;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = (id) => {
    router.push(`/dashboard?edit=${id}`);
  };

  const handleView = (id) => {
    router.push(`/projects/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Delete Project?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        background: "var(--glass-bg)",
        color: "var(--text-color)",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "transparent",
        confirmButtonText: "Yes, delete it!",
        customClass: {
          popup: "glass-card border-0",
          confirmButton: "btn btn-danger px-4 rounded-pill",
          cancelButton: "btn btn-outline-light px-4 rounded-pill",
        },
      });

      if (result.isConfirmed) {
        await deleteProject(id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Project has been removed.",
          icon: "success",
          background: "var(--glass-bg)",
          color: "var(--text-color)",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      Swal.fire("Error!", "Failed to delete project.", "error");
    }
  };

  return (
    <div className="container py-5 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-5"
      >
        <div className="row align-items-center g-4">
          <div className="col-lg-8 text-center text-lg-start">
            <h1 className="fw-bold display-4 mb-3">
              Featured <span className="text-primary">Projects</span>
            </h1>
            <p className="lead text-muted max-w-2xl mx-auto mx-lg-0">
              A curated selection of digital solutions built with passion and
              precision.
            </p>
          </div>

          <div className="col-lg-4 text-center text-lg-end">
            {isMounted && isAuthenticated && (
              <Link
                href="/dashboard"
                className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg hover-lift d-inline-flex align-items-center gap-2"
              >
                <FiPlus /> Add New Project
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          />
          <p className="text-muted">Loading your projects...</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-5 text-center border-danger border-opacity-25">
          <FiTrash2 size={48} className="text-danger mb-3 opacity-50" />
          <h3 className="h5 fw-bold">Connection Issue</h3>
          <p className="text-muted small">
            Unable to load projects at the moment. Please try again soon.
          </p>
        </div>
      )}

      {!isLoading && projects.length === 0 && !error && (
        <div className="glass-card p-5 text-center border-opacity-10">
          <FiPlus size={48} className="text-muted mb-3 opacity-25" />
          <h3 className="h5 fw-bold">No Projects Yet</h3>
          <p className="text-muted small">
            The portfolio is growing. Check back soon for updates!
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="row g-4 lg:g-5">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              className="col-lg-4 col-md-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="glass-card h-100 p-4 d-flex flex-column group hover-lift border-1 border-white border-opacity-5">
                {/* Header Actions */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <span
                    className={`badge d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill ${
                      project.status === "Completed"
                        ? "bg-success bg-opacity-10 text-success"
                        : "bg-warning bg-opacity-10 text-warning"
                    }`}
                  >
                    {project.status === "Completed" ? (
                      <FiCheckCircle />
                    ) : (
                      <FiClock />
                    )}
                    {project.status}
                  </span>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleView(project._id)}
                      className="btn btn-glass btn-icon-round"
                      title="View Project"
                    >
                      <FiEye size={18} />
                    </button>
                    {role === "admin" && (
                      <>
                        <button
                          onClick={() => handleEdit(project._id)}
                          className="btn btn-glass btn-icon-round text-info"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="btn btn-glass btn-icon-round text-danger"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-grow-1">
                  <h3 className="h4 fw-bold mb-3 project-title-hover">
                    {project?.title}
                  </h3>

                  <p className="small text-muted mb-4 line-clamp-3">
                    {project?.subheading || "No description available."}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-top border-white border-opacity-5 d-flex justify-content-between align-items-center">
                  <small className="text-muted opacity-75">
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </small>
                  <button
                    onClick={() => handleView(project._id)}
                    className="btn btn-link btn-sm text-primary text-decoration-none fw-bold p-0"
                  >
                    Details →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hover-lift {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .btn-glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .btn-icon-round {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          padding: 0;
        }
        .project-title-hover {
          background: linear-gradient(
            to right,
            var(--primary-color, #7000ff),
            var(--primary-color, #7000ff)
          );
          background-repeat: no-repeat;
          background-size: 0% 2px;
          background-position: left bottom;
          transition: background-size 0.3s ease;
          display: inline-block;
        }
        .group:hover .project-title-hover {
          background-size: 100% 2px;
        }
      `}</style>
    </div>
  );
}

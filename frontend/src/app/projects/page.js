"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from "@/store/services/projectsApi";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ProjectsPage() {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.content);
  const { data: projectsData, error, isLoading } = useGetProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const projects = projectsData?.data || [];
  const role = user?.role;

  console.log("user", user);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  console.log("projects", projectsData);

  const handleEdit = (id) => {
    router.push(`/dashboard?edit=${id}`);
  };

  const handleView = (id) => {
    router.push(`/projects/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteProject(id).unwrap();
        Swal.fire("Deleted!", "Your project has been deleted.", "success");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      Swal.fire("Error!", "Failed to delete project.", "error");
    }
  };

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="d-flex justify-content-between align-items-end gap-3">
          <div className="text-start">
            <h1 className="fw-bold display-4 mb-2">Featured Projects</h1>
            <p className="lead mb-0">
              A selection of projects that demonstrate my passion for building
              high-quality digital products.
            </p>
          </div>

          {isMounted && isAuthenticated && (
            <div className="mb-1">
              <Link
                href="/dashboard"
                className="btn btn-primary rounded-pill px-4 text-nowrap"
              >
                + Add New Project
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {isLoading && (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center glass-card">
          Error loading projects. Please try again later.
        </div>
      )}

      {projects.length > 0 ? (
        <div className="row g-4">
          {projects.map((project) => (
            <div key={project._id} className="col-lg-4 col-md-6">
              <motion.div
                whileHover={{ y: -10 }}
                className="glass-card h-100 p-4 position-relative"
              >
                {isMounted && (
                  <div className="position-absolute top-0 end-0 p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(project._id);
                      }}
                      className="btn btn-sm btn-outline-primary me-2"
                      title="View Details"
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                    {role === "admin" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project._id);
                          }}
                          className="btn btn-sm btn-outline-info me-2"
                          title="Edit Project"
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project._id);
                          }}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Project"
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </>
                    )}
                  </div>
                )}

                <span className="badge bg-info text-dark text-uppercase mb-2">
                  {project.status}
                </span>

                <h3
                  className="h4 fw-bold mt-2 mb-3"
                  style={{
                    whiteSpace: "nowrap",
                    overflowX: "auto",
                    scrollbarWidth: "none", // For Firefox
                    msOverflowStyle: "none", // For IE/Edge
                  }}
                >
                  {/* Hide scrollbar for Chrome/Safari/Opera */}
                  <style jsx>{`
                    h3::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {project.title}
                </h3>

                <div
                  className="small mb-4"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  dangerouslySetInnerHTML={{ __html: project.body }}
                />

                <small className="text-muted">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </small>
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center py-5 glass-card">
            <h3 className="h5 text-white">No projects found</h3>
            <p className="text-white small">Check back later for updates!</p>
          </div>
        )
      )}
    </div>
  );
}

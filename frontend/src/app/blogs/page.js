"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useGetBlogsQuery,
  useUpdateBlogDeleteStatusMutation,
} from "@/store/services/blogsApi";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiBookOpen,
} from "react-icons/fi";

export default function BlogsPage() {
  const { user } = useSelector((state) => state.auth);
  const { data: blogsData, error, isLoading } = useGetBlogsQuery();
  const [deleteBlog] = useUpdateBlogDeleteStatusMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const blogs = blogsData?.data || [];
  const role = user?.role;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = (id) => {
    router.push(`/dashboard?tab=blogs&edit=${id}`);
  };

  const handleView = (id) => {
    router.push(`/blogs/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Delete Blog?",
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
        await deleteBlog(id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Blog has been removed.",
          icon: "success",
          background: "var(--glass-bg)",
          color: "var(--text-color)",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      Swal.fire("Error!", "Failed to delete blog.", "error");
    }
  };

  // Helper to strip HTML tags for preview
  const stripHtml = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
              Latest <span className="text-secondary">Insights</span>
            </h1>
            <p className="lead text-muted max-w-2xl mx-auto mx-lg-0">
              Thoughts, tutorials, and updates from the world of development.
            </p>
          </div>

          <div className="col-lg-4 text-center text-lg-end">
            {isMounted && isAuthenticated && role === "admin" && (
              <Link
                href="/dashboard?tab=blogs"
                className="btn btn-secondary btn-lg rounded-pill px-5 py-3 shadow-lg hover-lift d-inline-flex align-items-center gap-2"
              >
                <FiPlus /> Write New Blog
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div
            className="spinner-border text-secondary mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          />
          <p className="text-muted">Loading articles...</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-5 text-center border-danger border-opacity-25">
          <FiBookOpen size={48} className="text-danger mb-3 opacity-50" />
          <h3 className="h5 fw-bold">Connection Issue</h3>
          <p className="text-muted small">
            Unable to load blogs at the moment. Please try again soon.
          </p>
        </div>
      )}

      {!isLoading && blogs.length === 0 && !error && (
        <div className="glass-card p-5 text-center border-opacity-10">
          <FiBookOpen size={48} className="text-muted mb-3 opacity-25" />
          <h3 className="h5 fw-bold">No Blogs Yet</h3>
          <p className="text-muted small">
            Stay tuned! Content is coming soon.
          </p>
        </div>
      )}

      {blogs.length > 0 && (
        <div className="row g-4 lg:g-5">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              className="col-lg-4 col-md-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="glass-card h-100 p-4 d-flex flex-column group hover-lift border-1 border-white border-opacity-5">
                {/* Header Actions */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FiCalendar />
                    {new Date(blog.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  <div className="d-flex gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => handleView(blog._id)}
                      className="btn btn-glass btn-icon-round"
                      title="Read More"
                    >
                      <FiEye size={18} />
                    </button>
                    {role === "admin" && (
                      <>
                        <button
                          onClick={() => handleEdit(blog._id)}
                          className="btn btn-glass btn-icon-round text-info"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
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
                  <div className="mb-2">
                    <span
                      className={`badge ${blog.status === "Published" ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"}`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  {blog.image && (
                    <div className="mb-3">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        className="img-fluid rounded-3"
                        width={400}
                        height={200}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "200px",
                        }}
                      />
                    </div>
                  )}
                  <h3 className="h4 fw-bold mb-3 project-title-hover">
                    {blog?.title}
                  </h3>

                  <p className="small text-muted mb-4 line-clamp-3">
                    {blog?.subheading ||
                      (isMounted
                        ? stripHtml(blog.body).substring(0, 100) + "..."
                        : "Reading...")}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-top border-white border-opacity-5 text-end">
                  <Link
                    href={`/blogs/${blog._id}`}
                    className="btn btn-link btn-sm text-secondary text-decoration-none fw-bold p-0"
                  >
                    Read Article &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

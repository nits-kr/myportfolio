"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ImageWithSpinner from "@/components/common/ImageWithSpinner";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@/context/ThemeContext";
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
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import InfiniteScroll from "react-infinite-scroll-component";

export default function BlogsPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Desktop Pagination State
  const [desktopPage, setDesktopPage] = useState(1);
  const {
    data: desktopResponse,
    error: desktopError,
    isLoading: desktopLoading,
    isFetching: desktopFetching,
  } = useGetBlogsQuery({
    page: desktopPage,
    limit: 6,
  });

  // Mobile Infinite Scroll State
  const [mobilePage, setMobilePage] = useState(1);
  const { data: mobileResponse, error: mobileError } = useGetBlogsQuery({
    page: mobilePage,
    limit: 6,
  });
  const [mobileBlogs, setMobileBlogs] = useState([]);

  // Sync mobile blogs
  useEffect(() => {
    if (mobileResponse?.data) {
      setMobileBlogs((prev) => {
        // Prevent duplicates
        const existingIds = new Set(prev.map((b) => b._id));
        const newBlogs = mobileResponse.data.filter(
          (b) => !existingIds.has(b._id),
        );
        return [...prev, ...newBlogs];
      });
    }
  }, [mobileResponse]);

  const [deleteBlog] = useUpdateBlogDeleteStatusMutation();
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const role = user?.role;

  // Filter logic for both data sets (Admins see drafts, Public sees published)
  const filterBlogs = (list) => {
    if (!list) return [];
    return role === "admin"
      ? list
      : list.filter((b) => b.status === "Published");
  };

  const desktopBlogs = filterBlogs(desktopResponse?.data);
  const filteredMobileBlogs = filterBlogs(mobileBlogs);

  const desktopPagination = desktopResponse?.pagination;
  const mobilePagination = mobileResponse?.pagination;

  const isLoading = desktopLoading && mobilePage === 1;
  const error = desktopError || mobileError;

  // Pagination Generator (Ellipses logic)
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const handleRefresh = async () => {
    setMobilePage(1);
    setMobileBlogs([]);
    try {
      await refetchMobile();
    } catch (e) {
      console.error(e);
    }
  };

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

      {!isLoading && desktopBlogs.length === 0 && !error && (
        <div className="glass-card p-5 text-center border-opacity-10">
          <FiBookOpen size={48} className="text-muted mb-3 opacity-25" />
          <h3 className="h5 fw-bold">No Blogs Yet</h3>
          <p className="text-muted small">
            Stay tuned! Content is coming soon.
          </p>
        </div>
      )}

      {/* --- DESKTOP VIEW (Numbered Pagination) --- */}
      <div className="d-none d-lg-block">
        {desktopBlogs.length > 0 && (
          <>
            <div className="row g-4 lg:g-5">
              {desktopBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  className="col-lg-4 col-md-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogCard
                    blog={blog}
                    role={role}
                    handleView={handleView}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    isMounted={isMounted}
                    stripHtml={stripHtml}
                    theme={theme}
                  />
                </motion.div>
              ))}
            </div>

            {/* Desktop Pagination Controls */}
            {desktopPagination && desktopPagination.pages > 1 && (
              <div className="modern-pagination mt-5 pt-4 d-flex justify-content-center align-items-center gap-2 border-top border-white border-opacity-10">
                <button
                  className="btn-pagination nav-btn"
                  disabled={desktopPage === 1 || desktopFetching}
                  onClick={() => setDesktopPage((p) => p - 1)}
                >
                  <FiChevronLeft /> Prev
                </button>

                <div className="page-numbers d-flex gap-2">
                  {getPageNumbers(desktopPage, desktopPagination.pages).map(
                    (num, idx) =>
                      num === "..." ? (
                        <span
                          key={`ell-${idx}`}
                          className="pagination-ellipsis px-2 text-muted"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${num}`}
                          className={`btn-pagination num-btn ${desktopPage === num ? "active" : ""}`}
                          onClick={() => setDesktopPage(num)}
                          disabled={desktopFetching}
                        >
                          {num}
                        </button>
                      ),
                  )}
                </div>

                <button
                  className="btn-pagination nav-btn"
                  disabled={
                    desktopPage === desktopPagination.pages || desktopFetching
                  }
                  onClick={() => setDesktopPage((p) => p + 1)}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MOBILE VIEW (Infinite Scroll) --- */}
      <div className="d-block d-lg-none">
        {filteredMobileBlogs.length > 0 && (
          <InfiniteScroll
            dataLength={filteredMobileBlogs.length}
            next={() => setMobilePage((p) => p + 1)}
            hasMore={
              mobilePagination ? mobilePage < mobilePagination.pages : false
            }
            pullDownToRefresh
            pullDownToRefreshThreshold={70}
            refreshFunction={handleRefresh}
            pullDownToRefreshContent={
              <div className="text-center py-3">
                <IOSSpinner active={false} />
                <div
                  className="small text-muted mt-2"
                  style={{ fontSize: "0.8rem" }}
                >
                  Pull down to refresh
                </div>
              </div>
            }
            releaseToRefreshContent={
              <div className="text-center py-3">
                <IOSSpinner active={true} />
                <div
                  className="small text-muted mt-2"
                  style={{ fontSize: "0.8rem" }}
                >
                  Release to refresh
                </div>
              </div>
            }
            loader={
              <div className="text-center py-4">
                <IOSSpinner active={true} />
              </div>
            }
            endMessage={
              <div className="text-center py-4">
                <p className="text-muted small mb-0">
                  You have seen all articles.
                </p>
              </div>
            }
            className="row g-4"
            style={{ overflow: "hidden" }} // Prevent unwanted scrollbars from component
          >
            {filteredMobileBlogs.map((blog, index) => (
              <div key={`mob-${blog._id}`} className="col-12">
                <BlogCard
                  blog={blog}
                  role={role}
                  handleView={handleView}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  isMounted={isMounted}
                  stripHtml={stripHtml}
                  theme={theme}
                />
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}

// Extracted BlogCard Component to prevent code duplication between Desktop/Mobile views
const BlogCard = ({
  blog,
  role,
  handleView,
  handleEdit,
  handleDelete,
  isMounted,
  stripHtml,
  theme,
}) => (
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
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="d-flex align-items-center justify-content-center w-100 h-100"
            >
              <FiEye size={18} />
            </motion.div>
          </AnimatePresence>
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
        <div
          className="mb-3"
          style={{ borderRadius: "12px", overflow: "hidden", height: "200px" }}
        >
          <ImageWithSpinner src={blog.image} alt={blog.title} />
        </div>
      )}
      <h3 className="h4 fw-bold mb-3 project-title-hover">{blog?.title}</h3>

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
);

// High-Fidelity iOS Style SVG Spinner Component
const IOSSpinner = ({ active = false }) => (
  <svg
    className={`ios-spinner ${active ? "active" : ""}`}
    viewBox="0 0 24 24"
    width="28"
    height="28"
    style={{
      opacity: active ? 1 : 0.5,
      transition: "opacity 0.2s",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
    }}
  >
    <style>
      {`
        .ios-spinner.active { animation: ios-spin 1s steps(8, end) infinite; }
        @keyframes ios-spin { 100% { transform: rotate(360deg); } }
      `}
    </style>
    <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="3" x2="12" y2="6" opacity="1" />
      <line x1="18.36" y1="5.64" x2="16.24" y2="7.76" opacity="0.875" />
      <line x1="21" y1="12" x2="18" y2="12" opacity="0.75" />
      <line x1="18.36" y1="18.36" x2="16.24" y2="16.24" opacity="0.625" />
      <line x1="12" y1="21" x2="12" y2="18" opacity="0.5" />
      <line x1="5.64" y1="18.36" x2="7.76" y2="16.24" opacity="0.375" />
      <line x1="3" y1="12" x2="6" y2="12" opacity="0.25" />
      <line x1="5.64" y1="5.64" x2="7.76" y2="7.76" opacity="0.125" />
    </g>
  </svg>
);

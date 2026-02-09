"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetBlogQuery } from "@/store/services/blogsApi";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: blogData, error, isLoading } = useGetBlogQuery(id);
  const blog = blogData?.data;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger glass-card">
          Blog not found or error loading blog.
        </div>
        <Link href="/blogs" className="btn btn-outline-secondary mt-3">
          &larr; Back to Blogs
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
              className={`badge bg-${blog.status === "Published" ? "success" : "warning"} mb-2`}
            >
              {blog.status}
            </span>
            <h1 className="fw-bold display-4 mb-2">{blog.title}</h1>
            <p className="text-muted">
              Published on {new Date(blog.createdAt).toLocaleDateString()}
              {blog.author && <span> by {blog.author.name}</span>}
            </p>
          </div>
          <div>
            <Link
              href="/blogs"
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{
                width: "40px",
                height: "40px",
                transition: "all 0.3s ease",
              }}
              title="Back to Blogs"
            >
              <IoArrowBack size={20} />
            </Link>
          </div>
        </div>

        {blog.subheading && (
          <p className="lead text-muted mb-4 fst-italic border-start border-4 border-secondary ps-3">
            {blog.subheading}
          </p>
        )}

        <div className="blog-content mt-5">
          <div dangerouslySetInnerHTML={{ __html: blog.body }} />
        </div>
      </motion.div>
    </div>
  );
}

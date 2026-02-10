"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGetBlogQuery,
  useLikeBlogMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useLikeCommentMutation,
} from "@/store/services/blogsApi";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  IoArrowBack,
  IoHeart,
  IoHeartOutline,
  IoShareOutline,
  IoChatbubbleOutline,
  IoSend,
  IoReturnDownForward,
} from "react-icons/io5";
import SubscribeModal from "@/components/common/SubscribeModal";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const { user: adminUser } = useSelector((state) => state.auth);
  const isAdmin = adminUser?.role === "admin";

  const { data: blogData, error, isLoading } = useGetBlogQuery(id);
  const { data: commentsData } = useGetCommentsQuery(id);
  const [likeBlog] = useLikeBlogMutation();
  const [addComment] = useAddCommentMutation();
  const [likeComment] = useLikeCommentMutation();

  const blog = blogData?.data;
  const comments = commentsData?.data || [];

  const [subscriberEmail, setSubscriberEmail] = useState(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("blogSubscriberEmail");
    if (email) setSubscriberEmail(email);
  }, []);

  const checkSubscription = (action) => {
    if (isAdmin) return true; // Admin is always allowed
    if (!subscriberEmail) {
      setPendingAction(() => action);
      setIsSubscribeModalOpen(true);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!checkSubscription(handleLike)) return;
    try {
      await likeBlog({
        id,
        email: subscriberEmail || adminUser.email,
      }).unwrap();
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const handleShare = async () => {
    if (!checkSubscription(handleShare)) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.subheading || blog.title,
          url: window.location.href,
        });
      } else {
        alert(
          "Web Share not supported on this browser. URL copied to clipboard!",
        );
        navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleCommentSubmit = async (e, parentId = null) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    if (!checkSubscription(() => handleCommentSubmit(e, parentId))) return;

    try {
      await addComment({
        id,
        name: isAdmin
          ? adminUser.name
          : localStorage.getItem("blogSubscriberName"),
        email: isAdmin ? adminUser.email : subscriberEmail,
        body: commentBody,
        parentId,
      }).unwrap();
      setCommentBody("");
      setReplyTo(null);
    } catch (err) {
      console.error("Failed to comment:", err);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!checkSubscription(() => handleLikeComment(commentId))) return;
    try {
      await likeComment({
        commentId,
        email: subscriberEmail || adminUser.email,
        blogId: id,
      }).unwrap();
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const onSubscribeSuccess = (email) => {
    setSubscriberEmail(email);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const isCommentLiked = comment.likes?.includes(
      subscriberEmail || adminUser?.email,
    );
    const replies = comments.filter((c) => c.parentId === comment._id);

    return (
      <div
        className={`mb-4 ${depth > 0 ? "ms-md-5 ms-3 ps-3 border-start border-2 border-primary-subtle" : ""}`}
      >
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`comment-card shadow-sm ${comment.isAdminReply ? "admin-reply border-primary" : ""}`}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className={`avatar-placeholder ${comment.isAdminReply ? "admin-avatar" : ""}`}
              >
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 className="fw-bold mb-0">
                  {comment.name}
                  {comment.isAdminReply && (
                    <span className="ms-2 badge bg-primary small">Admin</span>
                  )}
                </h6>
                <small className="text-muted">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
          <p className="mb-3 text-secondary leading-relaxed">{comment.body}</p>

          <div className="d-flex align-items-center gap-4">
            <button
              className={`btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1 small ${isCommentLiked ? "text-danger" : "text-muted"}`}
              onClick={() => handleLikeComment(comment._id)}
            >
              {isCommentLiked ? (
                <IoHeart size={16} />
              ) : (
                <IoHeartOutline size={16} />
              )}
              <span>{comment.likes?.length || 0}</span>
            </button>
            <button
              className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1 small text-muted"
              onClick={() => {
                setReplyTo(comment);
                setCommentBody("");
                document
                  .getElementById("comment-input")
                  ?.scrollIntoView({ behavior: "smooth" });
                document.getElementById("comment-input")?.focus();
              }}
            >
              <IoReturnDownForward size={16} />
              <span>Reply</span>
            </button>
          </div>
        </motion.div>
        {replies.map((reply) => (
          <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const rootComments = comments.filter((c) => !c.parentId);

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

  const isLiked = blog.likes?.includes(subscriberEmail || adminUser?.email);

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 p-md-5 mb-5"
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

        {blog.image && (
          <div className="mb-4">
            <img
              src={blog.image}
              alt={blog.title}
              className="img-fluid rounded-3 w-100 shadow-sm"
              style={{ maxHeight: "500px", objectFit: "cover" }}
            />
          </div>
        )}

        {blog.subheading && (
          <p className="lead text-muted mb-4 fst-italic border-start border-4 border-secondary ps-3">
            {blog.subheading}
          </p>
        )}

        <div className="blog-content mt-5 mb-5 pb-5 border-bottom">
          <div dangerouslySetInnerHTML={{ __html: blog.body }} />
        </div>

        <div className="interaction-strip">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`interaction-btn ${isLiked ? "active" : ""}`}
            onClick={handleLike}
          >
            {isLiked ? (
              <IoHeart size={22} className="text-danger" />
            ) : (
              <IoHeartOutline size={22} />
            )}
            <span>{blog.likes?.length || 0}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="interaction-btn"
            onClick={handleShare}
          >
            <IoShareOutline size={22} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="interaction-btn text-primary"
            onClick={() => document.getElementById("comment-input")?.focus()}
          >
            <IoChatbubbleOutline size={22} />
            <span>{comments.length}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 p-md-5"
      >
        <h3 className="fw-bold mb-5 flex align-items-center gap-2">
          Replies{" "}
          <span className="badge bg-primary rounded-pill fs-6">
            {comments.length}
          </span>
        </h3>

        {/* Comment Form */}
        <div className="mb-5">
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded-4"
              >
                <span className="small text-primary fw-medium">
                  Replying to <strong>{replyTo.name}</strong>
                </span>
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={(e) => handleCommentSubmit(e, replyTo?._id)}>
            <div className="position-relative">
              <textarea
                id="comment-input"
                className="form-control custom-textarea p-4"
                rows="3"
                placeholder={
                  replyTo ? `Write a reply...` : "What are your thoughts?"
                }
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                style={{ paddingRight: "60px !important" }}
              ></textarea>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                className="btn btn-primary position-absolute bottom-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                style={{ width: "45px", height: "45px" }}
                disabled={!commentBody.trim()}
              >
                <IoSend size={20} />
              </motion.button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="comments-list d-flex flex-column gap-2">
          {rootComments.length === 0 ? (
            <div className="text-center py-5 border rounded-4 border-dashed">
              <IoChatbubbleOutline
                size={40}
                className="text-muted mb-3 opacity-50"
              />
              <p className="text-muted mb-0">
                No comments yet. Be the first to start the conversation!
              </p>
            </div>
          ) : (
            rootComments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))
          )}
        </div>
      </motion.div>

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        onSuccess={onSubscribeSuccess}
      />

      <style jsx>{`
        .custom-textarea {
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.3);
          resize: none;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          backdrop-filter: blur(5px);
        }
        .custom-textarea:focus {
          background: #fff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border-color: #0d6efd;
        }
        .avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .admin-avatar {
          background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
        }
        .admin-reply {
          border-left: 4px solid #0d6efd !important;
          background: rgba(13, 110, 253, 0.03) !important;
        }
        .leading-relaxed {
          line-height: 1.6;
        }
        .border-dashed {
          border-style: dashed !important;
          border-width: 2px !important;
          background: rgba(0, 0, 0, 0.01);
        }
      `}</style>
    </div>
  );
}

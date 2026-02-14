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
import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import {
  IoArrowBack,
  IoHeart,
  IoHeartOutline,
  IoShareOutline,
  IoChatbubbleOutline,
  IoSend,
  IoReturnDownForward,
  IoCopyOutline,
} from "react-icons/io5";
import SubscribeModal from "@/components/common/SubscribeModal";
import toast, { Toaster } from "react-hot-toast";
import Prism from "prismjs/components/prism-core";
import "prismjs/themes/prism-tomorrow.css";

const CommentForm = memo(
  ({
    blogId,
    adminUser,
    subscriberEmail,
    isAdmin,
    addComment,
    checkSubscription,
    parentId = null,
    placeholder = "Share your perspective...",
    onCancel = null,
    autoFocus = false,
  }) => {
    const [body, setBody] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!body.trim()) return;
      if (!checkSubscription(() => handleSubmit(e))) return;

      try {
        await addComment({
          id: blogId,
          email: isAdmin ? adminUser.email : subscriberEmail,
          body,
          parentId,
        }).unwrap();
        setBody("");
        if (onCancel) onCancel();
      } catch (err) {
        console.error("Failed to comment:", err);
        if (err.status === 403 && err.data?.message) {
          toast.error(err.data.message, {
            duration: 5000,
            position: "top-right",
          });
        }
      }
    };

    return (
      <div className="comment-form-wrapper mt-3">
        <form onSubmit={handleSubmit}>
          <div className="position-relative">
            <textarea
              autoFocus={autoFocus}
              className="form-control modern-textarea"
              rows="3"
              placeholder={placeholder}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => {
                if (!isAdmin && !subscriberEmail) {
                  checkSubscription();
                  // Blur the textarea to prevent typing until subscribed
                  document.activeElement.blur();
                }
              }}
            ></textarea>
            <div className="form-actions-overlay">
              {onCancel && (
                <button
                  type="button"
                  className="btn-pill-secondary me-2"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="btn-pill-primary"
                disabled={!body.trim()}
              >
                <IoSend size={16} className="me-2" />
                Post
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    );
  },
);
CommentForm.displayName = "CommentForm";

const CommentItem = memo(
  ({
    comment,
    comments,
    depth = 0,
    subscriberEmail,
    adminUser,
    handleLikeComment,
    blogId,
    isAdmin,
    addComment,
    checkSubscription,
  }) => {
    const [isReplying, setIsReplying] = useState(false);
    const isCommentLiked = comment.likes?.includes(
      subscriberEmail || adminUser?.email,
    );
    const replies = comments.filter((c) => c.parentId === comment._id);

    return (
      <div className={`comment-thread-node ${depth > 0 ? "is-nested" : ""}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`comment-card-modern ${comment.isAdminReply ? "is-admin" : ""}`}
        >
          <div className="comment-header">
            <div className="d-flex align-items-center gap-3">
              <div
                className={`avatar-circle-modern ${comment.isAdminReply ? "avatar-admin" : ""}`}
              >
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="author-name-group">
                  <span className="author-name">{comment.name}</span>
                  {comment.isAdminReply && (
                    <span className="admin-badge-modern">Official Admin</span>
                  )}
                </div>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="comment-body-modern">
            <p>{comment.body}</p>
          </div>

          <div className="comment-footer-modern">
            <button
              className={`action-pill ${isCommentLiked ? "is-liked" : ""}`}
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
              className={`action-pill ${isReplying ? "is-active" : ""}`}
              onClick={() => {
                if (!isReplying) {
                  if (!checkSubscription(() => setIsReplying(true))) return;
                }
                setIsReplying(!isReplying);
              }}
            >
              <IoReturnDownForward size={16} />
              <span>{isReplying ? "Cancel" : "Reply"}</span>
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="reply-form-section"
            >
              <CommentForm
                blogId={blogId}
                adminUser={adminUser}
                subscriberEmail={subscriberEmail}
                isAdmin={isAdmin}
                addComment={addComment}
                checkSubscription={checkSubscription}
                parentId={comment._id}
                placeholder={`Reply to ${comment.name}...`}
                onCancel={() => setIsReplying(false)}
                autoFocus={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {replies.length > 0 && (
          <div className="nested-replies-container">
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                comments={comments}
                depth={depth + 1}
                subscriberEmail={subscriberEmail}
                adminUser={adminUser}
                handleLikeComment={handleLikeComment}
                blogId={blogId}
                isAdmin={isAdmin}
                addComment={addComment}
                checkSubscription={checkSubscription}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
CommentItem.displayName = "CommentItem";

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
  const comments = useMemo(() => commentsData?.data || [], [commentsData]);

  const [subscriberEmail, setSubscriberEmail] = useState(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("blogSubscriberEmail");
    if (email) setSubscriberEmail(email);
  }, []);

  const checkSubscription = useCallback(
    (action) => {
      if (isAdmin) return true; // Admin is always allowed
      if (!subscriberEmail) {
        setPendingAction(() => action);
        setIsSubscribeModalOpen(true);
        return false;
      }
      return true;
    },
    [isAdmin, subscriberEmail],
  );

  const handleLike = useCallback(async () => {
    const execute = async () => {
      try {
        await likeBlog({
          id,
          email: subscriberEmail || adminUser.email,
        }).unwrap();
      } catch (err) {
        console.error("Failed to like:", err);
        if (err.status === 403 && err.data?.message) {
          toast.error(err.data.message, {
            duration: 5000,
            position: "top-right",
          });
        }
      }
    };

    if (!checkSubscription(execute)) return;
    await execute();
  }, [id, subscriberEmail, adminUser, likeBlog, checkSubscription]);

  const handleShare = useCallback(async () => {
    const execute = async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: blog?.title,
            text: blog?.subheading || blog?.title,
            url: window.location.href,
          });
        } else {
          alert(
            "Web Share not supported on this browser. URL copied to clipboard!",
          );
          navigator.clipboard.writeText(window.location.href);
        }
      } catch (err) {
        console.error("Error sharing:", err, blog, id);
      }
    };

    if (!checkSubscription(execute)) return;
    await execute();
  }, [blog, id, checkSubscription]);

  const handleLikeComment = useCallback(
    async (commentId) => {
      const execute = async () => {
        try {
          await likeComment({
            commentId,
            email: subscriberEmail || adminUser.email,
            blogId: id,
          }).unwrap();
        } catch (err) {
          console.error("Failed to like comment:", err);
          if (err.status === 403 && err.data?.message) {
            toast.error(err.data.message, {
              duration: 5000,
              position: "top-right",
            });
          }
        }
      };

      if (!checkSubscription(execute)) return;
      await execute();
    },
    [id, subscriberEmail, adminUser, likeComment, checkSubscription],
  );

  const onSubscribeSuccess = useCallback(
    (email) => {
      setSubscriberEmail(email);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    },
    [pendingAction],
  );

  useEffect(() => {
    if (blog?.body) {
      // Prism components often expect a global Prism object
      if (typeof window !== "undefined") {
        window.Prism = Prism;
      }

      // Load foundational languages
      require("prismjs/components/prism-markup");
      require("prismjs/components/prism-clike");
      require("prismjs/components/prism-markup-templating");

      // Load specific languages
      require("prismjs/components/prism-javascript");
      require("prismjs/components/prism-css");
      require("prismjs/components/prism-python");
      require("prismjs/components/prism-php");
      require("prismjs/components/prism-sql");
      require("prismjs/components/prism-bash");
      require("prismjs/components/prism-json");

      // Highlight elements safely
      const codeBlocks = document.querySelectorAll("pre");
      codeBlocks.forEach((block) => {
        const codeElement = block.querySelector("code");
        if (codeElement && Prism.highlightElement) {
          try {
            Prism.highlightElement(codeElement);
          } catch (e) {
            console.error("Prism highlighting failed:", e);
          }
        }

        // Add copy buttons if not already present
        if (block.querySelector(".copy-btn-wrapper")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "copy-btn-wrapper";

        const btn = document.createElement("button");
        btn.className = "copy-code-btn";
        btn.innerHTML = `<span>Copy</span>`;

        btn.onclick = () => {
          const code =
            block.querySelector("code")?.innerText || block.innerText;
          navigator.clipboard.writeText(code).then(() => {
            btn.innerHTML = `<span>Copied!</span>`;
            setTimeout(() => {
              btn.innerHTML = `<span>Copy</span>`;
            }, 2000);
          });
        };

        wrapper.appendChild(btn);
        block.style.position = "relative";
        block.appendChild(wrapper);
      });
    }
  }, [blog]);

  const rootComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments],
  );

  if (isLoading && !blog) {
    return (
      <div className="loading-viewport">
        <div className="premium-loader"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container py-5 text-center">
        <div className="error-card-modern">
          <p>This blog post is temporarily unavailable.</p>
          <Link href="/blogs" className="btn-pill-outline mt-3">
            &larr; Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isLiked = blog.likes?.includes(subscriberEmail || adminUser?.email);

  return (
    <div className="blog-details-viewport">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-blog-card"
        >
          <header className="blog-detail-header">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span
                className={`status-badge-modern ${blog.status.toLowerCase()}`}
              >
                {blog.status}
              </span>
              <Link href="/blogs" className="back-link-pill">
                <IoArrowBack size={18} />
              </Link>
            </div>
            <h1 className="blog-headline-modern">{blog.title}</h1>
            <div className="blog-meta-modern">
              <span className="meta-item">
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {blog.author && <span className="meta-separator">•</span>}
              {blog.author && (
                <span className="meta-item">By {blog.author.name}</span>
              )}
            </div>
          </header>

          {blog.image && (
            <figure className="blog-featured-image-wrapper">
              <Image
                src={blog.image}
                alt={blog.title}
                className="blog-featured-image"
                width={1200}
                height={600}
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </figure>
          )}

          {blog.subheading && (
            <blockquote className="blog-quote-pill">
              {blog.subheading}
            </blockquote>
          )}

          <article className="blog-body-article">
            <div dangerouslySetInnerHTML={{ __html: blog.body }} />
          </article>

          <footer className="interaction-bar-modern">
            <div className="interaction-group">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`interact-btn-modern ${isLiked ? "is-liked" : ""}`}
                onClick={handleLike}
              >
                {isLiked ? <IoHeart size={24} /> : <IoHeartOutline size={24} />}
                <span className="count">{blog.likes?.length || 0}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="interact-btn-modern"
                onClick={handleShare}
              >
                <IoShareOutline size={24} />
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="comment-count-pill"
              onClick={() =>
                document
                  .getElementById("main-comment-anchor")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <IoChatbubbleOutline size={20} className="me-2" />
              <span>{comments.length} Comments</span>
            </motion.button>
          </footer>
        </motion.div>

        {/* Discussion Section */}
        <div id="main-comment-anchor" className="discussion-section-modern">
          <div className="discussion-header-modern">
            <h3 className="section-title">Community Discussion</h3>
            <span className="discussion-count">{comments.length}</span>
          </div>

          <div className="primary-form-box">
            <CommentForm
              blogId={id}
              adminUser={adminUser}
              subscriberEmail={subscriberEmail}
              isAdmin={isAdmin}
              addComment={addComment}
              checkSubscription={checkSubscription}
              placeholder="Join the conversation..."
            />
          </div>

          <div className="threaded-comments-list">
            {rootComments.length === 0 ? (
              <div className="empty-discussion-box">
                <IoChatbubbleOutline size={48} className="mb-3 opacity-20" />
                <p>
                  No perspectives shared yet. Be the first to start the
                  discussion.
                </p>
              </div>
            ) : (
              rootComments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  comments={comments}
                  subscriberEmail={subscriberEmail}
                  adminUser={adminUser}
                  handleLikeComment={handleLikeComment}
                  blogId={id}
                  isAdmin={isAdmin}
                  addComment={addComment}
                  checkSubscription={checkSubscription}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        onSuccess={onSubscribeSuccess}
      />

      <Toaster
        toastOptions={{
          style: {
            background: "var(--surface-main)",
            color: "var(--text-main)",
            border: "1px solid var(--border-light)",
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <style jsx global>{`
        pre {
          background: #1e1e1e !important;
          border-radius: 12px !important;
          padding: 1.5rem !important;
          margin: 2rem 0 !important;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        code {
          font-family: "Fira Code", "Consolas", "Monaco", monospace !important;
          font-size: 0.95rem !important;
          line-height: 1.6 !important;
        }
        .copy-btn-wrapper {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
        }
        .copy-code-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ccc;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }
        .copy-code-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-color: rgba(255, 255, 255, 0.4);
        }
        .copy-code-btn span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        :root {
          --enterprise-blue: #0066ff;
          --enterprise-blue-hover: #0052cc;
          --text-main: #1a1a1a;
          --text-secondary: #666666;
          --surface-main: #ffffff;
          --surface-nested: #f3f4f9;
          --viewport-bg: #fbfbfc;
          --shadow-soft:
            0 4px 24px -1px rgba(0, 0, 0, 0.04),
            0 2px 8px -1px rgba(0, 0, 0, 0.02);
          --shadow-premium: 0 12px 48px -12px rgba(0, 0, 0, 0.08);
          --border-light: rgba(0, 0, 0, 0.06);
          --input-bg: #ffffff;
          --card-bg-admin: linear-gradient(to bottom right, #ffffff, #f0f7ff);
        }

        [data-bs-theme="dark"] {
          --text-main: #f3f4f6;
          --text-secondary: #a0aec0;
          --surface-main: #111827;
          --surface-nested: #1f2937;
          --viewport-bg: #0a0a0b;
          --shadow-soft:
            0 4px 24px -1px rgba(0, 0, 0, 0.2),
            0 2px 8px -1px rgba(0, 0, 0, 0.1);
          --shadow-premium: 0 12px 48px -12px rgba(0, 0, 0, 0.3);
          --border-light: rgba(255, 255, 255, 0.08);
          --input-bg: #1f2937;
          --card-bg-admin: linear-gradient(
            to bottom right,
            #111827,
            rgba(0, 102, 255, 0.05)
          );
        }

        .blog-details-viewport {
          background-color: var(--viewport-bg);
          min-height: 100vh;
          padding: 80px 0;
          transition: background-color 0.3s ease;
        }

        .premium-blog-card {
          background: var(--surface-main);
          border-radius: 32px;
          padding: 64px;
          transition:
            background-color 0.3s ease,
            box-shadow 0.3s ease;
          box-shadow: var(--shadow-premium);
          margin-bottom: 64px;
        }

        .blog-headline-modern {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-main);
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .blog-meta-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          flex-wrap: wrap;
        }

        .blog-featured-image-wrapper {
          margin: 48px 0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 80px -20px rgba(0, 0, 0, 0.15);
        }

        .blog-featured-image {
          width: 100%;
          max-height: 600px;
          object-fit: cover;
        }

        .blog-quote-pill {
          font-size: 1.4rem;
          font-weight: 500;
          font-style: italic;
          color: var(--enterprise-blue);
          padding: 32px;
          background: rgba(0, 102, 255, 0.03);
          border-left: 4px solid var(--enterprise-blue);
          border-radius: 0 16px 16px 0;
          margin-bottom: 48px;
        }

        .blog-body-article {
          font-size: 1.25rem;
          line-height: 1.8;
          color: var(--text-main);
          margin-bottom: 64px;
        }

        .interaction-bar-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 40px;
          border-top: 1px solid var(--border-light);
        }

        .interaction-group {
          display: flex;
          gap: 16px;
        }

        .interact-btn-modern {
          background: var(--surface-nested);
          border: none;
          min-width: 64px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          gap: 10px;
          padding: 0 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .interact-btn-modern .count {
          min-width: 20px;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }

        .interact-btn-modern:hover {
          background: var(--surface-nested);
          filter: brightness(0.95);
          transform: translateY(-2px);
        }

        .interact-btn-modern.is-liked {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        .comment-count-pill {
          background: var(--enterprise-blue);
          color: white;
          padding: 12px 28px;
          border-radius: 100px;
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        /* Discussion Styles */
        .discussion-section-modern {
          max-width: 800px;
          margin: 0 auto;
        }

        .discussion-header-modern {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .section-title {
          font-weight: 800;
          margin: 0;
          color: var(--text-main);
        }

        .discussion-count {
          background: var(--surface-nested);
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .modern-textarea {
          border-radius: 20px;
          border: 1.5px solid var(--border-light);
          padding: 24px;
          background: var(--input-bg);
          color: var(--text-main);
          width: 100%;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-soft);
        }

        .modern-textarea:focus {
          border-color: var(--enterprise-blue);
          box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.08);
          outline: none;
        }

        .form-actions-overlay {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          align-items: center;
        }

        .btn-pill-primary {
          background: var(--enterprise-blue);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 100px;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .btn-pill-secondary {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Comment Cards */
        .comment-card-modern {
          background: var(--surface-main);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-soft);
          margin-bottom: 16px;
          transition: transform 0.2s ease;
        }

        .comment-card-modern.is-admin {
          background: var(--card-bg-admin);
          border: 1px solid rgba(0, 102, 255, 0.1);
        }

        .avatar-circle-modern {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--surface-nested);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--enterprise-blue);
        }

        .avatar-admin {
          background: var(--enterprise-blue);
          color: white;
        }

        .author-name-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .author-name {
          font-weight: 700;
          color: var(--text-main);
        }

        .admin-badge-modern {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--enterprise-blue);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 800;
          white-space: nowrap;
        }

        .comment-date {
          font-size: 0.75rem;
          color: #a0aec0;
          display: block;
        }

        .comment-body-modern {
          padding: 12px 0;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-main);
          opacity: 0.9;
        }

        .comment-footer-modern {
          display: flex;
          gap: 20px;
          margin-top: 8px;
        }

        .action-pill {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
          min-width: 60px;
        }

        .action-pill span {
          min-width: 14px;
          text-align: left;
          font-variant-numeric: tabular-nums;
        }

        .action-pill:hover {
          color: var(--enterprise-blue);
        }

        .action-pill.is-liked {
          color: #ef4444;
        }

        .comment-thread-node.is-nested {
          margin-left: 24px;
          padding-left: 24px;
          border-left: 2px solid var(--border-light);
          margin-top: 16px;
        }

        .loading-viewport {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .premium-loader {
          width: 40px;
          height: 40px;
          border: 3px solid #f1f5f9;
          border-top-color: var(--enterprise-blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .premium-blog-card {
            padding: 24px;
            margin-bottom: 32px;
            border-radius: 20px;
          }
          .blog-headline-modern {
            font-size: 1.8rem;
          }
          .blog-featured-image-wrapper {
            margin: 24px 0;
            border-radius: 16px;
          }
          .blog-quote-pill {
            font-size: 1.1rem;
            padding: 20px;
          }
          .blog-body-article {
            font-size: 1.1rem;
            margin-bottom: 32px;
          }
          .interaction-bar-modern {
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
          }
          .interaction-group {
            width: 100%;
            justify-content: space-between;
          }
          .comment-thread-node.is-nested {
            margin-left: 10px;
            padding-left: 10px;
          }
          .comment-card-modern {
            padding: 16px;
          }
          .avatar-circle-modern {
            width: 36px;
            height: 36px;
            font-size: 0.9rem;
          }
          .blog-details-viewport {
            padding: 40px 0;
          }
        }

        @media (max-width: 480px) {
          .blog-headline-modern {
            font-size: 1.5rem;
          }
          .premium-blog-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

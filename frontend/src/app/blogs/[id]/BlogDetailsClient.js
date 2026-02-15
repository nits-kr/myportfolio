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
import "@/styles/BlogDetails.scss";

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

const IOSSpinner = () => (
  <div className="ios-spinner">
    {[...Array(12)].map((_, i) => (
      <div key={i}></div>
    ))}
  </div>
);

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
    likingCommentId,
  }) => {
    const isLiking = likingCommentId === comment._id;
    const [isReplying, setIsReplying] = useState(false);
    const isCommentLiked = comment.hasLiked;
    const replies = comments.filter((c) => c.parentId === comment._id);

    return (
      <div className={`comment-thread-node ${depth > 0 ? "is-nested" : ""}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
              className={`action-pill ${isCommentLiked ? "is-liked" : ""} ${isLiking ? "is-loading" : ""}`}
              onClick={() => !isLiking && handleLikeComment(comment._id)}
              disabled={isLiking}
              aria-label={isCommentLiked ? "Unlike comment" : "Like comment"}
            >
              <span className="icon-wrapper">
                {isLiking ? (
                  <IOSSpinner />
                ) : isCommentLiked ? (
                  <IoHeart size={16} />
                ) : (
                  <IoHeartOutline size={16} />
                )}
              </span>
              <span>{comment.likesCount || 0}</span>
            </button>
            <button
              className={`action-pill ${isReplying ? "is-active" : ""}`}
              onClick={() => {
                if (!isReplying) {
                  if (!checkSubscription(() => setIsReplying(true))) return;
                }
                setIsReplying(!isReplying);
              }}
              aria-label={isReplying ? "Cancel reply" : "Reply to comment"}
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
                likingCommentId={likingCommentId}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
CommentItem.displayName = "CommentItem";

export default function BlogDetailsClient({
  initialBlog,
  initialComments = [],
}) {
  const { id } = useParams();
  const { user: adminUser } = useSelector((state) => state.auth);
  const isAdmin = adminUser?.role === "admin";

  const [shouldFetch, setShouldFetch] = useState(!initialBlog);
  const {
    data: blogData,
    error,
    isLoading,
  } = useGetBlogQuery(
    { id, viewerEmail: subscriberEmail || adminUser?.email },
    {
      skip: !shouldFetch,
    },
  );
  const { data: commentsData } = useGetCommentsQuery({
    id,
    viewerEmail: subscriberEmail || adminUser?.email,
  });
  const [likeBlog, { isLoading: isLikingBlog }] = useLikeBlogMutation();
  const [addComment] = useAddCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [likingCommentId, setLikingCommentId] = useState(null);

  const blog = initialBlog || blogData?.data;
  const comments = useMemo(
    () => commentsData?.data || initialComments,
    [commentsData, initialComments],
  );

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
    const execute = async (emailOverride = null) => {
      try {
        await likeBlog({
          id,
          email: emailOverride || subscriberEmail || adminUser?.email,
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

    if (!shouldFetch) setShouldFetch(true);
    if (!checkSubscription(execute)) return;
    await execute();
  }, [
    id,
    subscriberEmail,
    adminUser,
    likeBlog,
    checkSubscription,
    shouldFetch,
  ]);

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
      const execute = async (emailOverride = null) => {
        setLikingCommentId(commentId);
        try {
          await likeComment({
            commentId,
            email: emailOverride || subscriberEmail || adminUser?.email,
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
        } finally {
          setLikingCommentId(null);
        }
      };

      if (!shouldFetch) setShouldFetch(true);
      if (!checkSubscription(execute)) return;
      await execute();
    },
    [
      id,
      subscriberEmail,
      adminUser,
      likeComment,
      checkSubscription,
      shouldFetch,
    ],
  );

  const onSubscribeSuccess = useCallback(
    (email) => {
      setSubscriberEmail(email);
      if (pendingAction) {
        pendingAction(email);
        setPendingAction(null);
      }
    },
    [pendingAction],
  );

  useEffect(() => {
    if (blog?.body) {
      const initPrism = async () => {
        try {
          // Dynamic Import Prism and CSS
          const Prism = (await import("prismjs/components/prism-core")).default;
          await import("prismjs/themes/prism-tomorrow.css");

          // Ensure window.Prism is set for nested components if needed
          if (typeof window !== "undefined") {
            window.Prism = Prism;
          }

          // Dynamic Import Languages as needed
          await import("prismjs/components/prism-markup");
          await import("prismjs/components/prism-clike");
          await import("prismjs/components/prism-markup-templating");
          await import("prismjs/components/prism-javascript");
          await import("prismjs/components/prism-css");
          await import("prismjs/components/prism-python");
          await import("prismjs/components/prism-php");
          await import("prismjs/components/prism-sql");
          await import("prismjs/components/prism-bash");
          await import("prismjs/components/prism-json");

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
        } catch (err) {
          console.error("Failed to load Prism:", err);
        }
      };

      initPrism();
    }
  }, [blog?.body]);

  const rootComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments],
  );

  const isActuallyLoading = !blog && isLoading;

  if (isActuallyLoading) {
    return (
      <div className="loading-viewport">
        <div className="premium-loader"></div>
      </div>
    );
  }

  if (!blog && error) {
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

  const isLiked = blog?.hasLiked;

  return (
    <div className="blog-details-viewport">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="premium-blog-card"
        >
          <header className="blog-detail-header">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span
                className={`status-badge-modern ${blog?.status?.toLowerCase()}`}
              >
                {blog?.status}
              </span>
              <Link
                href="/blogs"
                className="back-link-pill"
                aria-label="Back to blogs"
              >
                <IoArrowBack size={18} />
              </Link>
            </div>
            <h1 className="blog-headline-modern">{blog?.title}</h1>
            <div className="blog-meta-modern">
              <span className="meta-item">
                {blog?.createdAt &&
                  new Date(blog.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
              </span>
              {blog?.author && <span className="meta-separator">•</span>}
              {blog?.author && (
                <span className="meta-item">By {blog.author.name}</span>
              )}
            </div>
          </header>

          {blog?.image && (
            <figure className="blog-featured-image-wrapper">
              <Image
                src={blog.image}
                alt={blog.title}
                className="blog-featured-image"
                width={1200}
                height={686}
                priority
                fetchPriority="high"
                decoding="sync"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </figure>
          )}

          {blog?.subheading && (
            <blockquote className="blog-quote-pill">
              {blog.subheading}
            </blockquote>
          )}

          <article className="blog-body-article">
            {blog?.body && (
              <div dangerouslySetInnerHTML={{ __html: blog.body }} />
            )}
          </article>

          <footer className="interaction-bar-modern">
            <div className="interaction-group">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`interact-btn-modern ${isLiked ? "is-liked" : ""} ${isLikingBlog ? "is-loading" : ""}`}
                onClick={() => !isLikingBlog && handleLike()}
                disabled={isLikingBlog}
                aria-label={isLiked ? "Unlike blog post" : "Like blog post"}
              >
                <span className="icon-wrapper">
                  {isLikingBlog ? (
                    <IOSSpinner />
                  ) : isLiked ? (
                    <IoHeart size={24} />
                  ) : (
                    <IoHeartOutline size={24} />
                  )}
                </span>
                <span className="count">{blog?.likesCount || 0}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="interact-btn-modern"
                onClick={handleShare}
                aria-label="Share blog post"
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
              aria-label={`Jump to comments, ${comments.length} total`}
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
              addComment={(args) => {
                if (!shouldFetch) setShouldFetch(true);
                addComment(args);
              }}
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
                  addComment={(args) => {
                    if (!shouldFetch) setShouldFetch(true);
                    addComment(args);
                  }}
                  checkSubscription={checkSubscription}
                  likingCommentId={likingCommentId}
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
    </div>
  );
}

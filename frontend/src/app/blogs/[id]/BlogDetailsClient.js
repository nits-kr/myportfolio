"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGetBlogQuery,
  useGetBlogsQuery,
  useLikeBlogMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useLikeCommentMutation,
} from "@/store/services/blogsApi";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { createPortal } from "react-dom";
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
  IoSearch,
  IoCalendarOutline,
  IoChevronBack,
  IoChevronForward,
  IoClose,
} from "react-icons/io5";
import SubscribeModal from "@/components/common/SubscribeModal";
import AdPlacement from "@/components/common/AdPlacement";
import ImageWithSpinner from "@/components/common/ImageWithSpinner";
import toast from "react-hot-toast";
import "@/styles/BlogDetails.scss";
import "@/styles/AdPlacement.scss";

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

  const [subscriberEmail, setSubscriberEmail] = useState(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("blogSubscriberEmail");
    if (email) setSubscriberEmail(email);
  }, []);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);
  const sidebarLimit = 6;

  // Reset page when search changes to avoid empty pages
  useEffect(() => {
    setSidebarPage(1);
  }, [searchQuery]);

  const { data: allBlogsData, isFetching: isSidebarFetching } =
    useGetBlogsQuery({
      search: searchQuery,
      limit: sidebarLimit,
      page: sidebarPage,
      excludeId: id,
    });

  const blog = initialBlog || blogData?.data;
  const comments = useMemo(
    () => commentsData?.data || initialComments,
    [commentsData, initialComments],
  );
  const allBlogs = useMemo(() => allBlogsData?.data || [], [allBlogsData]);
  // Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  const sidebarPagination = allBlogsData?.pagination;

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

  const filteredSidebarBlogs = useMemo(() => {
    // Include Draft blogs if user is admin
    return allBlogs.filter((b) => isAdmin || b.status === "Published");
  }, [allBlogs, isAdmin]);

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

  // Reusable Sidebar Content (Search + List + Pagination)
  const renderSidebarContent = () => (
    <>
      <h3 className="widget-title">Discover More</h3>

      <div className="sidebar-search-wrapper">
        <IoSearch className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search articles..."
          className="sidebar-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-blog-list">
        {isSidebarFetching && allBlogs.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary spinner-border-sm"
              role="status"
            ></div>
          </div>
        ) : filteredSidebarBlogs.length > 0 ? (
          filteredSidebarBlogs.map((sideBlog) => (
            <Link
              href={`/blogs/${sideBlog._id}`}
              key={sideBlog._id}
              className="sidebar-blog-card group"
              onClick={() => setIsMobileDrawerOpen(false)}
            >
              <div className="sidebar-card-thumbnail">
                {sideBlog.image ? (
                  <ImageWithSpinner src={sideBlog.image} alt={sideBlog.title} />
                ) : (
                  <div className="placeholder-thumbnail"></div>
                )}
              </div>
              <div className="sidebar-card-content">
                <h4 className="sidebar-blog-title line-clamp-2">
                  {sideBlog.title}
                </h4>
                <div className="sidebar-blog-meta">
                  <IoCalendarOutline size={14} />
                  <span>
                    {new Date(sideBlog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="sidebar-no-results text-center py-4">
            <p className="text-muted small mb-0">No matching articles found.</p>
          </div>
        )}
      </div>

      {sidebarPagination && sidebarPagination.pages > 1 && (
        <div className="sidebar-pagination mt-4 d-flex justify-content-between align-items-center">
          <button
            className="btn-pill-secondary btn-sm"
            disabled={sidebarPage === 1 || isSidebarFetching}
            onClick={() => setSidebarPage((p) => p - 1)}
          >
            <IoChevronBack size={16} /> Prev
          </button>
          <span className="small text-muted fw-medium">
            Page {sidebarPagination.page} of {sidebarPagination.pages}
          </span>
          <button
            className="btn-pill-secondary btn-sm"
            disabled={
              sidebarPage === sidebarPagination.pages || isSidebarFetching
            }
            onClick={() => setSidebarPage((p) => p + 1)}
          >
            Next <IoChevronForward size={16} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="blog-details-viewport">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
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
                    className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      transition: "all 0.3s ease",
                    }}
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
                  {blog?.author && (
                    <span className="meta-separator d-none">•</span>
                  )}
                  {blog?.author && (
                    <span className="meta-item d-none">
                      By {blog.author.name}
                    </span>
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

              {/* Top Ad Placement */}
              {/* <AdPlacement slot="top" type="custom" /> */}

              <article className="blog-body-article">
                {blog?.body && (
                  <div dangerouslySetInnerHTML={{ __html: blog.body }} />
                )}
              </article>

              {/* Bottom Ad Placement */}
              {/* <AdPlacement slot="bottom" type="custom" /> */}

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
                  <div className="glass-card text-center py-5 mt-4">
                    <div className="d-inline-flex align-items-center justify-content-center p-4 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                      <IoChatbubbleOutline size={32} />
                    </div>
                    <h4 className="h6 fw-bold mb-2">Start the Conversation</h4>
                    <p className="text-muted small mb-0">
                      No perspectives shared yet. Be the first to add your
                      thoughts!
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

          {/* Sidebar with Ads (Desktop Only) */}
          <div className="col-lg-4 d-none d-lg-block">
            <div className="blog-sidebar">
              {/* Modern Blog Listing */}
              <div className="modern-sidebar-widget">
                {renderSidebarContent()}
              </div>

              {/* Sidebar Ad */}
              {/* <AdPlacement slot="sidebar" type="custom" className="mb-4" /> */}

              {/* Newsletter CTA */}
              <div className="glass-card p-4 mb-4 d-none">
                <h4 className="h6 fw-bold mb-3">📬 Stay Updated</h4>
                <p className="small text-muted mb-3">
                  Get the latest articles and insights delivered to your inbox.
                </p>
                <button
                  onClick={() => setIsSubscribeModalOpen(true)}
                  className="btn btn-primary btn-sm w-100"
                >
                  Subscribe Now
                </button>
              </div>

              {/* Sponsor CTA */}
              <div
                className="glass-card p-4 d-none"
                style={{ background: "rgba(124, 58, 237, 0.03)" }}
              >
                <h4 className="h6 fw-bold mb-3">💼 Sponsor This Blog</h4>
                <p className="small text-muted mb-3">
                  Reach thousands of engaged developers and tech professionals.
                </p>
                <a
                  href="/contact?service=custom&message=I'm interested in sponsoring your blog"
                  className="btn btn-outline-light btn-sm w-100"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>

        <SubscribeModal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          onSuccess={onSubscribeSuccess}
        />

        {/* Mobile Floating Action Button */}
        <div className="d-lg-none">
          <AnimatePresence>
            {!isMobileDrawerOpen && (
              <motion.button
                className="mobile-discover-fab"
                whileTap={{ scale: 0.95 }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <div className="fab-content">
                  <IoSearch size={20} className="fab-icon" />
                  <span className="fab-text">Discover More</span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Sheet Drawer - Rendered in Portal to avoid stacking context issues */}
        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {isMobileDrawerOpen && (
                <>
                  <motion.div
                    className="mobile-drawer-overlay d-lg-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    style={{ zIndex: 10000 }} // Increased z-index
                  />
                  <motion.div
                    className="mobile-drawer-container d-lg-none"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (info.offset.y > 100) {
                        setIsMobileDrawerOpen(false);
                      }
                    }}
                    style={{ zIndex: 10001 }} // Increased z-index
                  >
                    <div className="drawer-drag-handle">
                      <div className="handle-bar"></div>
                    </div>

                    <div className="drawer-header">
                      <button
                        className="drawer-close-btn"
                        onClick={() => setIsMobileDrawerOpen(false)}
                      >
                        <IoClose size={24} />
                      </button>
                    </div>

                    <div className="drawer-content-scrollable">
                      <div className="modern-sidebar-widget mobile-variant">
                        {renderSidebarContent()}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>
    </div>
  );
}

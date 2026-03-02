import "./BlogDetails.css";

export default function Loading() {
  return (
    <div className="blog-details-viewport">
      <div className="container">
        <div className="premium-blog-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-status-badge"></div>
            <div className="skeleton-back-link"></div>
          </div>
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
          <div className="skeleton-image"></div>
          <div className="skeleton-subheading"></div>
          <div className="skeleton-body">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

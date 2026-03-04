import { loaderStyles } from "@/components/common/loaderStyles";

export default function Loading() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
      <div className="el-page-loader">
        {/* Ambient blobs */}
        <div className="el-loader-blob el-loader-blob-1" />
        <div className="el-loader-blob el-loader-blob-2" />

        {/* Triple-ring orb */}
        <div className="el-loader-orb-wrap">
          <div className="el-loader-ring el-loader-ring-1" />
          <div className="el-loader-ring el-loader-ring-2" />
          <div className="el-loader-ring el-loader-ring-3" />

          {/* Floating particles */}
          <div className="el-loader-particles">
            <span className="el-loader-particle" />
            <span className="el-loader-particle" />
            <span className="el-loader-particle" />
            <span className="el-loader-particle" />
            <span className="el-loader-particle" />
          </div>

          {/* Center icon */}
          <div className="el-loader-icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div className="el-loader-brand">
          <p className="el-loader-brand-name">Portfolio</p>
          <p className="el-loader-brand-tag">Loading experience</p>
        </div>

        {/* Progress */}
        <div className="el-loader-progress-wrap">
          <div className="el-loader-progress-track">
            <div className="el-loader-progress-fill" />
          </div>
        </div>

        {/* Status */}
        <div className="el-loader-status">
          <span className="el-loader-status-text">Preparing</span>
          <div className="el-loader-dots">
            <span className="el-loader-dot" />
            <span className="el-loader-dot" />
            <span className="el-loader-dot" />
          </div>
        </div>
      </div>
    </>
  );
}

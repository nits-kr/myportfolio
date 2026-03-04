export const loaderStyles = `
  @keyframes loader-orb-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes loader-orb-rotate-rev {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  @keyframes loader-pulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.92); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
  }
  @keyframes loader-shimmer {
    0% { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @keyframes loader-bar {
    0% { width: 0%; }
    30% { width: 45%; }
    60% { width: 72%; }
    85% { width: 88%; }
    100% { width: 95%; }
  }
  @keyframes loader-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes loader-dot {
    0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
    40% { transform: scale(1); opacity: 1; }
  }
  @keyframes loader-particle {
    0% { opacity: 0; transform: translateY(0) scale(0); }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translateY(-60px) scale(1.2); }
  }
  @keyframes loader-glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.1); }
    50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.6), 0 0 100px rgba(124, 58, 237, 0.2); }
  }

  .el-page-loader {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #090d1a 0%, #0f172a 50%, #0a0e1a 100%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
  }

  /* Ambient glow blobs */
  .el-loader-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .el-loader-blob-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%);
    top: -80px; left: -80px;
  }
  .el-loader-blob-2 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
    bottom: -60px; right: -60px;
  }

  /* Orb system */
  .el-loader-orb-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 40px;
    animation: loader-glow-pulse 2.5s ease-in-out infinite;
    border-radius: 50%;
  }
  .el-loader-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
  }
  .el-loader-ring-1 {
    border-top-color: #7c3aed;
    border-right-color: rgba(124, 58, 237, 0.3);
    animation: loader-orb-rotate 1.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }
  .el-loader-ring-2 {
    inset: 12px;
    border-top-color: #06b6d4;
    border-left-color: rgba(6, 182, 212, 0.3);
    animation: loader-orb-rotate-rev 2.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }
  .el-loader-ring-3 {
    inset: 24px;
    border-bottom-color: #a855f7;
    border-right-color: rgba(168, 85, 247, 0.3);
    animation: loader-orb-rotate 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }
  .el-loader-icon {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation: loader-pulse 2s ease-in-out infinite;
    color: #e2e8f0;
  }

  /* Floating particles */
  .el-loader-particles {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    overflow: visible;
  }
  .el-loader-particle {
    position: absolute;
    width: 4px; height: 4px;
    background: #7c3aed;
    border-radius: 50%;
    animation: loader-particle 2.4s ease-out infinite;
  }
  .el-loader-particle:nth-child(1) { left: 20%; top: 80%; animation-delay: 0s; background: #7c3aed; }
  .el-loader-particle:nth-child(2) { left: 50%; top: 90%; animation-delay: 0.4s; background: #06b6d4; }
  .el-loader-particle:nth-child(3) { left: 80%; top: 80%; animation-delay: 0.8s; background: #a855f7; }
  .el-loader-particle:nth-child(4) { left: 10%; top: 60%; animation-delay: 1.2s; background: #7c3aed; }
  .el-loader-particle:nth-child(5) { left: 90%; top: 60%; animation-delay: 1.6s; background: #06b6d4; }

  /* Brand */
  .el-loader-brand {
    animation: loader-fade-up 0.6s ease forwards;
    text-align: center;
    margin-bottom: 32px;
  }
  .el-loader-brand-name {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.08em;
    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 4px;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .el-loader-brand-tag {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #475569;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* Progress bar */
  .el-loader-progress-wrap {
    width: 240px;
    animation: loader-fade-up 0.6s 0.1s ease both;
    margin-bottom: 16px;
  }
  .el-loader-progress-track {
    height: 2px;
    background: rgba(255,255,255,0.06);
    border-radius: 999px;
    overflow: hidden;
  }
  .el-loader-progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #7c3aed, #06b6d4, #a855f7);
    background-size: 200% 100%;
    animation: loader-bar 4s ease forwards, loader-shimmer 1.5s linear infinite;
  }

  /* Status dots */
  .el-loader-status {
    display: flex;
    align-items: center;
    gap: 8px;
    animation: loader-fade-up 0.6s 0.2s ease both;
  }
  .el-loader-status-text {
    font-size: 12px;
    color: #475569;
    font-family: system-ui, -apple-system, sans-serif;
    letter-spacing: 0.04em;
  }
  .el-loader-dots {
    display: flex;
    gap: 4px;
  }
  .el-loader-dot {
    width: 4px; height: 4px;
    background: #7c3aed;
    border-radius: 50%;
    animation: loader-dot 1.2s ease-in-out infinite;
  }
  .el-loader-dot:nth-child(2) { animation-delay: 0.2s; background: #06b6d4; }
  .el-loader-dot:nth-child(3) { animation-delay: 0.4s; background: #a855f7; }
`;

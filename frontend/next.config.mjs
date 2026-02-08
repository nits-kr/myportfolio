import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [
      path.join(__dirname, "src/styles"),
      path.join(__dirname, "node_modules"),
      path.join(__dirname, "node_modules/bootstrap/scss"),
    ],
    silenceDeprecations: [
      "legacy-js-api",
      "import",
      "global-builtin",
      "color-functions",
      "mixed-decls",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Assuming Cloudinary is used, standard for portfolios
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google Auth avatars
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub avatars
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["react-icons", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

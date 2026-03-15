import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/store/Providers";

const inter = Inter({ subsets: ["latin"] });
import BootstrapClient from "@/components/common/BootstrapClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OnlineStatus from "@/components/common/OnlineStatus";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ServiceWorkerRegistration from "@/components/common/ServiceWorkerRegistration";
import GlobalLoader from "@/components/common/GlobalLoader";
import LogoLoader from "@/components/common/LogoLoader";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import GlobalPullToRefresh from "@/components/common/GlobalPullToRefresh";
import OfflineSyncIndicator from "@/components/common/OfflineSyncIndicator";
import NavigationProgress from "@/components/common/NavigationProgress";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Nitish Kumar | Frontend & Full Stack Developer",
  description:
    "Portfolio of Nitish Kumar - Frontend Engineer at TechGropse specializing in React.js, Next.js, and scaling Enterprise Web Applications. Full Stack Web Developer from India.",
  keywords: [
    "Nitish Kumar",
    "Nitish Kumar Portfolio",
    "Nitish Kumar Software Engineer",
    "Nitish Kumar Frontend Developer",
    "Nitish Kumar TechGropse",
    "React.js Developer Nitish Kumar",
    "Next.js Developer Portfolio",
    "MERN Stack Developer Nitish Kumar",
    "Full Stack Web Developer Portfolio",
    "PWA Expert Nitish Kumar",
    "Redux Toolkit Next.js Developer",
    "Frontend Engineer India",
    "Software Engineer Portfolio Nitish"
  ],
  authors: [{ name: "Nitish Kumar", url: "https://your-domain.com" }],
  creator: "Nitish Kumar",
  publisher: "Nitish Kumar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com", // Recommendation: update with your deployed domain
    siteName: "Nitish Kumar Portfolio",
    title: "Nitish Kumar | Frontend & Full Stack Developer",
    description:
      "Portfolio of Nitish Kumar - Frontend Engineer at TechGropse. Specialized in Next.js, React, and building highly scalable, performant web applications.",
    // You can add an image URL here to show when links are shared on social platforms
    // images: [{ url: "https://your-domain.com/og-image.jpg" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nitish Kumar | Frontend & Full Stack Developer",
    description: 
       "Portfolio of Nitish Kumar - Frontend Engineer at TechGropse.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nitish Portfolio",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          rel="preconnect"
          href="https://portfolio-backend-sjlz.onrender.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning={true} className={inter.className}>
        <Providers>
          <GlobalLoader />
          <NavigationProgress />
          <ServiceWorkerRegistration />
          <OnlineStatus />
          <BootstrapClient />

          <AnalyticsTracker />
          <Navbar />
          <GlobalPullToRefresh>
            <main className="main-content">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
          </GlobalPullToRefresh>
          <Footer />
          <MobileBottomNav />
          <OfflineSyncIndicator />

          <Toaster
            position="top-right"
            containerStyle={{
              top: 90,
              zIndex: 20000,
            }}
            toastOptions={{
              className: "glass-toast",
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

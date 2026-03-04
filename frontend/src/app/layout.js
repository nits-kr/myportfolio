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
  title: "Nitish Kumar | Full Stack Developer",
  description:
    "Portfolio of Nitish Kumar - Full Stack Developer (React, Next.js, Node.js, MongoDB).",
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

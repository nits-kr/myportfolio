import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import { Providers } from "@/store/Providers";
import BootstrapClient from "@/components/common/BootstrapClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Nitish Kumar | Full Stack Developer",
  description:
    "Portfolio of Nitish Kumar - Full Stack Developer (React, Next.js, Node.js, MongoDB).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          <BootstrapClient />
          <Navbar />
          <main
            style={{
              paddingTop: "100px",
              minHeight: "100vh",
              paddingBottom: "2rem",
            }}
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

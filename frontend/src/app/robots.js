export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: "https://nitish-portfolio.com/sitemap.xml", // Replace with actual domain
  };
}

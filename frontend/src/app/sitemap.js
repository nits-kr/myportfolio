export default function sitemap() {
  const baseUrl = "https://nitish-portfolio.com"; // Replace with actual domain

  // Static pages
  const routes = ["", "/about", "/projects", "/login", "/register"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.8,
    }),
  );

  return [...routes];
}

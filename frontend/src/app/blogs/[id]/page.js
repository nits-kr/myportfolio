import BlogDetailsClient from "./BlogDetailsClient";

async function getBlogData(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const [blogRes, commentsRes] = await Promise.all([
      fetch(`${baseUrl}/blogs/${id}`, { cache: "no-store" }),
      fetch(`${baseUrl}/blogs/${id}/comments`, { cache: "no-store" }),
    ]);

    const blogData = blogRes.ok ? await blogRes.json() : null;
    const commentsData = commentsRes.ok ? await commentsRes.json() : null;

    return {
      blog: blogData?.data || null,
      comments: commentsData?.data || [],
    };
  } catch (error) {
    console.error("Failed to fetch blog data on the server:", error);
    return { blog: null, comments: [] };
  }
}

export async function generateMetadata({ params }) {
  const { blog } = await getBlogData(params.id);

  if (!blog) {
    return {
      title: "Blog Not Found | Nitish Kumar",
    };
  }

  return {
    title: `${blog.title} | Nitish Kumar`,
    description:
      blog.subheading || "Read this amazing blog post by Nitish Kumar.",
    openGraph: {
      title: blog.title,
      description: blog.subheading,
      images: [blog.image],
    },
  };
}

export default async function BlogDetailsPage({ params }) {
  const { blog, comments } = await getBlogData(params.id);

  return <BlogDetailsClient initialBlog={blog} initialComments={comments} />;
}

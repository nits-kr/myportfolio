import BlogDetailsClient from "./BlogDetailsClient";

// Server Component (no 'use client')
async function getBlog(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
      cache: "no-store", // Ensure fresh data for dynamic blogs
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const blogData = await getBlog(params.id);

  if (!blogData || !blogData.data) {
    return {
      title: "Blog Not Found | Nitish Kumar",
    };
  }

  const blog = blogData.data;

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
  // Fetch data on the server
  const blogData = await getBlog(params.id);

  return <BlogDetailsClient initialBlog={blogData?.data} />;
}

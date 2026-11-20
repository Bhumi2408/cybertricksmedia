import { BLOGS } from "@/app/data/blogs";
import BlogDetailClient from "./BlogDetailClient";

export function generateStaticParams() {
  return BLOGS.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = BLOGS.find((b) => b.slug === slug);
  if (!blog) return { robots: { index: false, follow: false } };
  return {
    title: `${blog.title} | Cybertricks Media Pvt Ltd`,
    description: blog.excerpt,
    alternates: { canonical: `https://www.cybertricksmedia.com/blog/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;   // 👈 ye line change hui
  return <BlogDetailClient slug={slug} />;
}
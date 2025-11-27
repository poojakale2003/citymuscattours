import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import BlogDetailClient from "@/components/blog/BlogDetailClient";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  category: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}

async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const response = await fetch(`${API_BASE_URL}/blogs/slug/${encodedSlug}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error(`Failed to fetch blog: ${response.status} ${response.statusText}`);
      return null;
    }

    const json = await response.json();
    const blog = json?.data as Blog | undefined;
    
    if (!blog || !blog.is_published) {
      return null;
    }

    return blog;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

type RouteParams = { slug?: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug) {
    return buildPageMetadata({
      title: "Blog post not found",
      description: "The blog post you're looking for doesn't exist.",
      path: "/blog",
    });
  }

  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    return buildPageMetadata({
      title: "Blog post not found",
      description: "The blog post you're looking for doesn't exist.",
      path: "/blog",
    });
  }

  return buildPageMetadata({
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt || `Read ${blog.title} on citymuscattours blog`,
    path: `/blog/${blog.slug}`,
    keywords: blog.category ? [blog.category.toLowerCase()] : [],
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    return notFound();
  }

  return <BlogDetailClient blog={blog} />;
}


"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";
const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Helper function to build full image URL from relative path
const buildBlogImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return "";
  }
  // If already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // If relative path starting with /uploads/, prepend base URL
  if (path.startsWith("/uploads/")) {
    return `${UPLOAD_BASE_URL}/public${path}`;
  }
  // If path doesn't start with /, add it
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${UPLOAD_BASE_URL}/public${normalizedPath}`;
};

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
  created_at: string;
  updated_at: string;
}

export default function BlogAndStories() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const response = await api.getBlogs({ limit: 3, published: true });
        setBlogs(response.data ?? []);
        setError(null);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
              Trending & Popular Articles
            </p>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Latest stories from the citymuscattours blog
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (error || blogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section className="section">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
            Trending & Popular Articles
          </p>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Latest stories from the citymuscattours blog
          </h2>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-(--color-brand-300) hover:bg-slate-50 hover:text-(--color-brand-700)"
        >
          Read more articles
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <article
            key={blog.id}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60"
          >
            {blog.image ? (
              <Link href={`/blog/${blog.slug}`} className="block relative h-48 w-full overflow-hidden">
                <img
                  src={buildBlogImageUrl(blog.image)}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ) : (
              <div className="h-48 w-full bg-gradient-to-br from-brand-100 to-brand-200" />
            )}
            <div className="space-y-3 px-6 py-6">
              {blog.category && (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-brand-500)">
                  {blog.category}
              </p>
              )}
              <h3 className="text-xl font-semibold text-slate-900">
                <Link href={`/blog/${blog.slug}`} className="hover:text-(--color-brand-600) transition-colors">
                  {blog.title}
                </Link>
              </h3>
              {blog.excerpt && (
                <p className="text-sm text-slate-600 line-clamp-2">{blog.excerpt}</p>
              )}
              <Link
                href={`/blog/${blog.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-(--color-brand-600) transition-all duration-200 hover:gap-3 hover:text-(--color-brand-700)"
              >
                Read more
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


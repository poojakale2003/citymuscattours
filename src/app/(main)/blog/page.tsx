"use client";

import Image from "next/image";
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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getBlogs({ published: true });
        setBlogs(response.data ?? []);
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

  return (
    <main className="section space-y-10 pb-20 pt-10 sm:space-y-14 sm:pt-14">
      <header className="space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          citymuscattours journal
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
          Trending & Popular Articles
        </h1>
        <p className="mx-auto max-w-3xl text-sm text-slate-600 sm:text-base">
          Dive into curated guides covering Muscat heritage strolls, Daymaniat snorkeling tips, and concierge-crafted
          itineraries. Bookmark your favorites and share them with travel companions.
        </p>
      </header>

      {loading && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </section>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-center text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      {!loading && !error && blogs.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-8 text-center text-sm text-slate-600">
          <p>No blog posts available at the moment. Check back soon!</p>
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60"
            >
              {blog.image ? (
                <Link href={`/blog/${blog.slug}`} className="block relative h-52 w-full overflow-hidden">
                  <img
                    src={buildBlogImageUrl(blog.image)}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              ) : (
                <div className="h-52 w-full bg-gradient-to-br from-brand-100 to-brand-200" />
              )}
              <div className="flex flex-1 flex-col gap-4 px-6 py-6">
                {blog.category && (
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-brand-500)">
                    {blog.category}
                  </p>
                )}
                <h2 className="text-xl font-semibold text-slate-900">
                  <Link href={`/blog/${blog.slug}`} className="hover:text-(--color-brand-600) transition-colors">
                    {blog.title}
                  </Link>
                </h2>
                {blog.excerpt && (
                  <p className="text-sm text-slate-600 line-clamp-3">{blog.excerpt}</p>
                )}
                <div className="pt-2 mt-auto">
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
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}


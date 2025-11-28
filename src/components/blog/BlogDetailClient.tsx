"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://citymuscattours.com/test/php-backend/api/";
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

// Format date for display
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export default function BlogDetailClient({ blog }: { blog: Blog }) {
  const router = useRouter();

  return (
    <main className="section space-y-8 pb-20 pt-10 sm:space-y-10 sm:pt-14">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-(--color-brand-600)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to blog
        </button>
      </div>

      {/* Header */}
      <header className="space-y-4 text-center">
        {blog.category && (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
            {blog.category}
          </p>
        )}
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
          {blog.title}
        </h1>
        {blog.excerpt && (
          <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
            {blog.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          {blog.author && (
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {blog.author}
            </span>
          )}
          {blog.published_at && (
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(blog.published_at)}
            </span>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {blog.image && (
        <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80 md:h-96">
          <img
            src={buildBlogImageUrl(blog.image)}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="mx-auto max-w-4xl">
        <div
          className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-(--color-brand-600) prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-ul:text-slate-700 prose-ol:text-slate-700 prose-li:text-slate-700 prose-img:rounded-2xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      {/* Footer Actions */}
      <div className="mx-auto max-w-4xl border-t border-slate-200 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-(--color-brand-300) hover:bg-slate-50 hover:text-(--color-brand-700)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All blog posts
          </Link>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
          >
            Book a tour
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
};

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Check for created/updated params from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const createdParam = urlParams.get("created") === "1";
      const updatedParam = urlParams.get("updated") === "1";
      setCreated(createdParam);
      setUpdated(updatedParam);
    }

    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Don't pass published filter - backend will return all blogs for admin
      const response = await api.getBlogs({});
      setBlogs(response?.data ?? []);
    } catch (err: any) {
      console.error("Error loading blogs:", err);
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blogId: number) => {
    router.push(`/admin/blogs/${blogId}/edit`);
  };

  const handleDelete = async (blogId: number) => {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(blogId);
      await api.deleteBlog(blogId.toString());
      await loadBlogs();
    } catch (err: any) {
      console.error("Error deleting blog:", err);
      alert(err.message || "Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    blogs.forEach((blog) => {
      if (blog.category) unique.add(blog.category);
    });
    return ["all", ...Array.from(unique)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesCategory = categoryFilter === "all" || blog.category === categoryFilter;
      const matchesPublished =
        publishedFilter === "all" ||
        (publishedFilter === "published" && blog.is_published) ||
        (publishedFilter === "draft" && !blog.is_published);
      const matchesSearch =
        term.length === 0 ||
        blog.title.toLowerCase().includes(term) ||
        (blog.excerpt ?? "").toLowerCase().includes(term) ||
        (blog.category ?? "").toLowerCase().includes(term);
      return matchesCategory && matchesPublished && matchesSearch;
    });
  }, [blogs, categoryFilter, publishedFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Blogs</h1>
          <p className="text-sm text-slate-600">
            Manage blog posts, articles, and content.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)]"
        >
          Create blog post
        </Link>
      </header>

      {created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-700">
          <p className="font-semibold">Blog post saved successfully!</p>
          <p className="mt-1 text-xs text-emerald-600/80">
            Your new blog post has been added to the list.
          </p>
        </div>
      ) : null}
      {updated ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-700">
          <p className="font-semibold">Blog post updated successfully!</p>
          <p className="mt-1 text-xs text-emerald-600/80">
            Your blog post has been updated.
          </p>
        </div>
      ) : null}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error loading blogs</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search blogs"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
            />
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200) sm:w-48"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All categories" : option}
                </option>
              ))}
            </select>
            <select
              value={publishedFilter}
              onChange={(event) => {
                setPublishedFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200) sm:w-48"
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Showing {filteredBlogs.length} result{filteredBlogs.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {filteredBlogs.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500">Loading blogs...</div>
          </div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">No blogs found</p>
            <p className="mt-1 text-xs text-slate-500">
              {searchTerm || categoryFilter !== "all" || publishedFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first blog post"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Published
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Views
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{blog.title}</p>
                        {blog.excerpt && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{blog.excerpt}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {blog.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          blog.is_published
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {blog.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(blog.published_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {blog.views || 0}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(blog.id)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog.id)}
                          disabled={deletingId === blog.id}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === blog.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


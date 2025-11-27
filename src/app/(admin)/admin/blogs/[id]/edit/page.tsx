"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

type BlogFormState = {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  is_published: boolean;
};

export default function AdminEditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featureImage, setFeatureImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [formState, setFormState] = useState<BlogFormState>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    author: "",
    is_published: false,
  });

  useEffect(() => {
    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const blog = await api.getBlog(blogId);
      
      setFormState({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "",
        author: blog.author || "",
        is_published: blog.is_published || false,
      });
      setExistingImage(blog.image || null);
    } catch (err: any) {
      console.error("Error loading blog:", err);
      setError(err.message || "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeatureImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formState.title.trim()) {
        setError("Title is required");
        setIsSubmitting(false);
        return;
      }

      if (!formState.content.trim()) {
        setError("Content is required");
        setIsSubmitting(false);
        return;
      }

      // Use FormData if file is uploaded, otherwise use JSON
      if (featureImage) {
        const formData = new FormData();
        formData.append("title", formState.title);
        formData.append("content", formState.content);
        if (formState.excerpt) formData.append("excerpt", formState.excerpt);
        if (formState.category) formData.append("category", formState.category);
        if (formState.author) formData.append("author", formState.author);
        formData.append("is_published", formState.is_published ? "true" : "false");
        formData.append("featureImage", featureImage);

        await api.updateBlog(blogId, formData);
      } else {
        // No new image - keep existing (send as JSON, backend will preserve existing image)
        await api.updateBlog(blogId, {
          title: formState.title,
          content: formState.content,
          excerpt: formState.excerpt || undefined,
          category: formState.category || undefined,
          author: formState.author || undefined,
          is_published: formState.is_published,
          // Don't send image field - backend will keep existing
        });
      }

      router.push("/admin/blogs?updated=1");
    } catch (err: any) {
      console.error("Error updating blog:", err);
      setError(err.message || "Failed to update blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">Loading blog post...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Edit Blog Post</h1>
        <p className="mt-1 text-sm text-slate-600">Update blog post details</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter blog post title"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-semibold text-slate-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formState.excerpt}
                onChange={(e) => setFormState({ ...formState, excerpt: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Short description of the blog post"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={formState.content}
                onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                required
                rows={15}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Write your blog post content here..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="e.g., Travel, Food, Culture"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-semibold text-slate-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={formState.author}
                  onChange={(e) => setFormState({ ...formState, author: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="space-y-3">
              {existingImage && !featureImage && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Current Image:</p>
                  <img src={existingImage} alt="Current featured image" className="max-w-full h-32 object-cover rounded-lg" />
                </div>
              )}
              <div>
                <label htmlFor="featureImage" className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload New Featured Image
                </label>
                <input
                  type="file"
                  id="featureImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                />
                {featureImage && (
                  <p className="mt-2 text-xs text-slate-500">Selected: {featureImage.name}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">Image size should be below 5MB. Leave empty to keep existing image.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Publishing</h2>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formState.is_published}
              onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-(--color-brand-600) focus:ring-(--color-brand-200)"
            />
            <label htmlFor="is_published" className="text-sm font-semibold text-slate-700">
              Publish immediately
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            If unchecked, the blog post will be saved as a draft.
          </p>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[var(--color-brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Blog Post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


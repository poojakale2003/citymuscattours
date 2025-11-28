"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type TestimonialFormState = {
  name: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
  is_active: boolean;
  display_order: number;
};

export default function AdminCreateTestimonialPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formState, setFormState] = useState<TestimonialFormState>({
    name: "",
    location: "",
    avatar: "",
    quote: "",
    rating: 5,
    is_active: true,
    display_order: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formState.name.trim()) {
        setError("Name is required");
        setIsSubmitting(false);
        return;
      }

      if (!formState.location.trim()) {
        setError("Location is required");
        setIsSubmitting(false);
        return;
      }

      if (!formState.quote.trim()) {
        setError("Quote is required");
        setIsSubmitting(false);
        return;
      }

      // Use FormData if file is uploaded, otherwise use JSON
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", formState.name.trim());
        formData.append("location", formState.location.trim());
        formData.append("quote", formState.quote.trim());
        formData.append("rating", String(formState.rating));
        formData.append("is_active", formState.is_active ? "true" : "false");
        formData.append("display_order", String(formState.display_order || 0));
        formData.append("avatar", avatarFile);

        await api.createTestimonial(formData);
      } else {
        await api.createTestimonial({
          name: formState.name.trim(),
          location: formState.location.trim(),
          avatar: formState.avatar.trim() || null,
          quote: formState.quote.trim(),
          rating: formState.rating,
          is_active: formState.is_active,
          display_order: formState.display_order || 0,
        });
      }

      router.push("/admin/testimonials?created=1");
    } catch (err: any) {
      console.error("Error creating testimonial:", err);
      setError(err.message || "Failed to create testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Add New Review</h1>
        <p className="mt-1 text-sm text-slate-600">Add a new customer review to display in the Reviews By Our Customers section</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/70 px-5 py-4 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_-45px_rgb(15_23_42/0.6)]">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-900">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-slate-900">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter location (e.g., United States, Oman)"
              />
            </div>

            <div>
              <label htmlFor="avatar" className="block text-sm font-semibold text-slate-900">
                Avatar (Optional)
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
              />
              {avatarFile && (
                <p className="mt-2 text-xs text-slate-500">Selected: {avatarFile.name}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">Upload an image or leave empty to use default avatar with initials. Image size should be below 5MB.</p>
            </div>

            <div>
              <label htmlFor="quote" className="block text-sm font-semibold text-slate-900">
                Review Quote <span className="text-red-500">*</span>
              </label>
              <textarea
                id="quote"
                value={formState.quote}
                onChange={(e) => setFormState({ ...formState, quote: e.target.value })}
                required
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                placeholder="Enter the customer review quote"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="rating" className="block text-sm font-semibold text-slate-900">
                  Rating
                </label>
                <select
                  id="rating"
                  value={formState.rating}
                  onChange={(e) => setFormState({ ...formState, rating: parseInt(e.target.value) })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div>
                <label htmlFor="display_order" className="block text-sm font-semibold text-slate-900">
                  Display Order
                </label>
                <input
                  type="number"
                  id="display_order"
                  value={formState.display_order}
                  onChange={(e) => setFormState({ ...formState, display_order: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-slate-500">Lower numbers appear first</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formState.is_active}
                onChange={(e) => setFormState({ ...formState, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-(--color-brand-600) focus:ring-(--color-brand-500)"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-slate-900">
                Active (visible on website)
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-(--color-brand-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-700) focus:outline-none focus:ring-2 focus:ring-(--color-brand-500) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Review"}
          </button>
        </div>
      </form>
    </div>
  );
}


"use client";

import { useMemo, useEffect, useState } from "react";
import { PiQuotesFill } from "react-icons/pi";
import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/php-backend/api";
const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Helper function to build full image URL from relative path
const buildAvatarUrl = (path: string | null | undefined): string => {
  if (!path) {
    return "";
  }
  // If already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // If relative path starting with /uploads/, prepend base URL with /public
  if (path.startsWith("/uploads/")) {
    return `${UPLOAD_BASE_URL}/public${path}`;
  }
  // If path doesn't start with /, add it
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${UPLOAD_BASE_URL}/public${normalizedPath}`;
};

type Testimonial = {
  id: number;
  name: string;
  location: string;
  avatar: string | null;
  quote: string;
  rating: number;
  is_active: boolean;
  display_order: number;
};

const totalDisplayed = 40;

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await api.getTestimonials({ active: true, limit: 100 });
        // API returns { data: [...], pagination: {...} }
        const testimonialsArray = response.data || [];
        // Filter for active testimonials (API already filters, but double-check) and sort by display_order
        const activeTestimonials = testimonialsArray
          .filter((t: Testimonial) => t.is_active !== false)
          .sort((a: Testimonial, b: Testimonial) => (a.display_order || 0) - (b.display_order || 0));
        setTestimonials(activeTestimonials);
      } catch (err) {
        console.error("Error loading testimonials:", err);
        // On error, use empty array - component will show nothing
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const scrollingTestimonials = useMemo(() => {
    if (testimonials.length === 0) {
      return [];
    }

    // If we have fewer testimonials than needed, repeat them
    const needed = totalDisplayed;
    const result = [];
    
    for (let i = 0; i < needed; i++) {
      const testimonial = testimonials[i % testimonials.length];
      result.push({
        id: testimonial.id,
        name: testimonial.name,
        location: testimonial.location,
        avatar: buildAvatarUrl(testimonial.avatar),
        quote: testimonial.quote,
        rating: testimonial.rating || 5,
      });
    }
    
    return result;
  }, [testimonials]);

  const marqueeTestimonials = useMemo(() => {
    if (scrollingTestimonials.length === 0) {
      return [];
    }
    const firstSet = scrollingTestimonials.map((t, idx) => ({ ...t, uniqueId: `${t.id}-set1-${idx}` }));
    const secondSet = scrollingTestimonials.map((t, idx) => ({ ...t, uniqueId: `${t.id}-set2-${idx}` }));
    return [...firstSet, ...secondSet];
  }, [scrollingTestimonials]);

  return (
    <section id="testimonials" className="section bg-[#f8fbff]">
      <div className="flex flex-col gap-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          Loving Reviews By Our Customers
        </p>
        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Hear from frequent Dreamers
        </h2>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600">
          Real experiences from travelers who have explored the world with us. 
          Discover what makes our journeys unforgettable.
        </p>
      </div>

      <div className="relative mt-12 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500">Loading testimonials...</div>
          </div>
        ) : marqueeTestimonials.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500">No testimonials available</div>
          </div>
        ) : (
          <div className="testimonial-track flex w-max gap-6">
            {marqueeTestimonials.map((testimonial) => (
          <article
              key={testimonial.uniqueId}
              className="group flex w-[280px] min-w-[280px] flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60 sm:w-[320px] sm:min-w-[320px] sm:px-6 sm:py-6"
          >
            <div className="flex items-start gap-4">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.avatar-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = "avatar-fallback flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 sm:h-16 sm:w-16";
                      fallback.textContent = testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 sm:h-16 sm:w-16">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                  <div>
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">
                        {testimonial.name}
                      </p>
                    <p className="text-xs text-slate-500">{testimonial.location}</p>
                  </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0ff] text-[#2164f3] shadow-[0_4px_10px_-4px_rgba(33,100,243,0.4)] sm:h-12 sm:w-12">
                      <PiQuotesFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#facc15]">
                  {Array.from({ length: 5 }, (_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                          index + 1 <= testimonial.rating ? "" : "opacity-30"
                        }`}
                    >
                      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
              <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                {testimonial.quote}
              </p>
          </article>
            ))}
          </div>
        )}
        {marqueeTestimonials.length > 0 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#f8fbff] to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#f8fbff] to-transparent"></div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes testimonial-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .testimonial-track {
          animation: testimonial-marquee 90s linear infinite;
        }

        .testimonial-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}


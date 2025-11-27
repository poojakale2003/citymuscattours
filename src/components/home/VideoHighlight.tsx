"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function VideoHighlight() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <section className="relative isolate">
      <div className="relative h-96 w-full overflow-hidden sm:h-[28rem] md:h-[32rem] lg:h-[36rem] xl:h-[40rem]">
        <Image
          src="/assets/video.jpeg"
          alt="citymuscattours cinematic moment"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,16,36,0.45),rgba(12,16,36,0.7))]" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-(--color-brand-600) shadow-lg transition hover:scale-105 sm:h-14 sm:w-14 md:h-16 md:w-16"
          aria-label="Play video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-0.5 h-6 w-6 sm:ml-1 sm:h-7 sm:w-7 md:h-8 md:w-8"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4 sm:p-6 md:p-8"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-4xl"
            role="dialog"
            aria-modal="true"
            aria-label="citymuscattours cinematic film"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 sm:-right-3 sm:-top-3 sm:h-10 sm:w-10"
              aria-label="Close video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl sm:rounded-2xl md:rounded-3xl">
              <iframe
                title="citymuscattours cinematic film"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}


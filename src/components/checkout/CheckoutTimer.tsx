"use client";

import { useEffect, useState } from "react";

type CheckoutTimerProps = {
  initialSeconds?: number;
};

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const ClockIcon = () => (
  <svg
    className="h-4 w-4 text-rose-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export default function CheckoutTimer({ initialSeconds = 30 * 60 }: CheckoutTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-sm text-rose-700">
      <ClockIcon />
      {secondsLeft > 0 ? (
        <>
          We’ll hold your spot for <strong>{formatTime(secondsLeft)}</strong> minutes.
        </>
      ) : (
        "Reservation time expired—refresh availability to continue."
      )}
    </div>
  );
}
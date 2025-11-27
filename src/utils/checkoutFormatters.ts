export const formatDateLabel = (isoDate?: string) => {
  if (!isoDate) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 7);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(fallback);
  }

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(parsed);
};

export const computeCancellationLabel = (isoDate?: string) => {
  const base = isoDate ? new Date(isoDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(base.getTime())) {
    return "Free cancellation up to 24 hours before departure";
  }
  const cutoff = new Date(base);
  cutoff.setDate(base.getDate() - 1);
  return `Free cancellation until ${new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(cutoff)}`;
};

export const buildParticipantLabel = (adults: number, children: number) =>
  children > 0 ? `${adults} adult(s) · ${children} child(ren)` : `${adults} adult${adults > 1 ? "s" : ""}`;


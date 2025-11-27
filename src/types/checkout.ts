export type CheckoutData = {
  packageTitle: string;
  optionLabel: string;
  optionLanguage: string;
  displayDate: string;
  rawDate?: string;
  participantLabel: string;
  totalLabel: string;
  cancellationLabel: string;
  holdSeconds: number;
  heroImage: string;
  ratingValue: number;
  reviewsValue: number;
  badgeLabel: string;
  adults: number;
  children: number;
  minSelectableDate: string;
  packageId?: string;
  subtotal?: number;
  currency?: string;
};


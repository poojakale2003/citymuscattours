import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import {
  buildPageMetadata,
  defaultKeywords,
  organizationJsonLd,
  siteDescription,
  siteName,
  siteUrl,
} from "@/lib/seo";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["Times New Roman", "serif"],
});

const rootPageMetadata = buildPageMetadata({
  title: `${siteName} | Bespoke Tours & Travel Experiences`,
  description: siteDescription,
  path: "/",
});

export const metadata: Metadata = {
  ...rootPageMetadata,
  metadataBase: new URL(siteUrl),
  keywords: defaultKeywords,
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "travel",
  authors: [{ name: "citymuscattours Concierge Team", url: siteUrl }],
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${sans.variable} ${display.variable} bg-(--color-background) text-(--color-foreground) antialiased`}
      >
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


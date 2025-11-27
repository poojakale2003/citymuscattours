import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AttractionShowcase from "@/components/home/AttractionShowcase";
import VideoHighlight from "@/components/home/VideoHighlight";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ExperienceServices from "@/components/home/ExperienceServices";
import BlogAndStories from "@/components/home/BlogAndStories";
import NewsletterCta from "@/components/home/NewsletterCta";
import HeroServices from "@/components/home/HeroServices";
import { buildPageMetadata, siteDescription } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Luxury tours, cars, and airport transfers across Oman",
  description: siteDescription,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HeroServices />
      <AttractionShowcase />
      <VideoHighlight />
      <TestimonialsSection />
      <ExperienceServices />
      <BlogAndStories />
      <NewsletterCta />
    </>
  );
}


import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/shared/Logo";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaDribbble,
} from "react-icons/fa";

const navigationLinks = ["City Tours", "Car Rental", "Airport Transport", "Packages", "Wishlist", "Book Now"];

const resourcesLinks = [
  "Travel Guides",
  "Destination Info",
  "Travel Tips",
  "Customer Reviews",
  "Blog & Stories",
  "Help & Support",
];

const companyLinks = ["About Us", "Contact Us", "Terms & Conditions", "Privacy Policy", "Cancellation Policy"];

const paymentLogos = [{ alt: "Payment Methods", src: "/payments/logo.webp" }];

const partnerLogos = [
  { alt: "MakeMyTrip", src: "/partners/mytrip.webp" },
  { alt: "Tripadvisor", src: "/partners/tripadv.webp" },
  { alt: "Goibibo", src: "/partners/goibibo.webp" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b1d3a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1.1fr_repeat(3,1fr)_1.1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <p className="text-sm text-white/75">
              Discover curated city tours, premium car rentals, and seamless airport transfers. Your journey to unforgettable experiences starts here.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: FaFacebookF, href: "https://www.facebook.com/citymuscattours" },
                { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/citymuscattours" },
                { Icon: FaInstagram, href: "https://www.instagram.com/citymuscattours" },
                { Icon: FaTwitter, href: "https://twitter.com/citymuscattours" },
                { Icon: FaDribbble, href: "https://dribbble.com/citymuscattours" },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                    aria-label="Social link"
                  target="_blank"
                  rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-white/80 transition hover:bg-white hover:text-[#0b1d3a]"
                  >
                    <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

            <FooterColumn heading="Navigation" items={navigationLinks} />
            <FooterColumn heading="Resources" items={resourcesLinks} />
            <FooterColumn heading="Company" items={companyLinks} />

            <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
                Payment Methods
              </p>
                <div className="mt-4 flex flex-wrap gap-3">
                {paymentLogos.map((logo) => (
                  <Image
                    key={logo.alt}
                    src={logo.src}
                    alt={logo.alt}
                      width={176}
                      height={40}
                    className="object-contain"
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">
                Our Partners
              </p>
            <div className="mt-4 flex flex-wrap items-center gap-6">
                {partnerLogos.map((logo) => (
                  <Image
                    key={logo.alt}
                    src={logo.src}
                    alt={logo.alt}
                  width={70}
                  height={18}
                    className="object-contain"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p className="md:order-1">© {new Date().getFullYear()} citymuscattours. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 md:order-2 md:justify-end">
            <Link href="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/cancellation-policy" className="transition hover:text-white">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const linkMap: Record<string, string> = {
  "City Tours": "/city-tours",
  "Car Rental": "/car-rental",
  "Airport Transport": "/airport-transport",
  Packages: "/packages",
  Wishlist: "/wishlist",
  "Book Now": "/booking",
  "Travel Guides": "/packages",
  "Destination Info": "/city-tours",
  "Travel Tips": "/blog",
  "Customer Reviews": "/#testimonials",
  "Blog & Stories": "/blog",
  "Help & Support": "mailto:Travelalshaheed2016@gmail.com",
  "About Us": "/about",
  "Contact Us": "/contact",
  "Terms & Conditions": "/terms",
  "Privacy Policy": "/privacy",
  "Cancellation Policy": "/cancellation-policy",
};

function FooterColumn({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-widest text-white/60">{heading}</h4>
      <nav className="mt-4 grid gap-2.5 text-sm font-semibold text-white/80">
        {items.map((item) => {
          const href = linkMap[item] || "/";
          const isExternal = href.startsWith("http") || href.startsWith("mailto:");
          return isExternal ? (
            <a key={item} href={href} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
              {item}
            </a>
          ) : (
            <Link key={item} href={href} className="transition hover:text-white">
            {item}
          </Link>
          );
        })}
      </nav>
    </div>
  );
}


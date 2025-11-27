"use client";

import { useMemo } from "react";
import { PiQuotesFill } from "react-icons/pi";

const baseTestimonials = [
  {
    name: "Aman Diwakar",
    location: "United States",
    avatar: "/assets/testimonials/1.jpeg",
    quote:
      "The Muscat city tour was incredible! Our guide showed us hidden gems we never would have found on our own. The Grand Mosque and Muttrah Souq were highlights.",
  },
  {
    name: "Kunal M. Thakur",
    location: "Singapore",
    avatar: "/assets/testimonials/2.jpeg",
    quote:
      "Rented a luxury car for our week in Muscat. The chauffeur was professional, punctual, and knew all the best routes. Made our trip stress-free and enjoyable.",
  },
  {
    name: "Divya Talwar",
    location: "India",
    avatar: "/assets/testimonials/3.jpeg",
    quote:
      "Airport transfer service was seamless! They tracked our flight and met us right on time. The VIP treatment made us feel like royalty from the moment we landed.",
  },
  {
    name: "Karan Maheshwari",
    location: "United Arab Emirates",
    avatar: "/assets/testimonials/4.jpeg",
    quote:
      "Booked an entire Muscat experience with concierge support—seamless and worth repeating. They arranged everything from tours to dining reservations.",
  },
  {
    name: "Ritika Mathur",
    location: "Qatar",
    avatar: "/assets/testimonials/5.jpeg",
    quote:
      "The Daymaniat Islands snorkeling tour exceeded expectations! Crystal clear waters, amazing marine life, and the lunch on board was delicious. Highly recommend!",
  },
  {
    name: "Omar Hassan",
    location: "Oman",
    avatar: "/assets/testimonials/6.jpeg",
    quote:
      "Our travelers continue to share loving reviews about the citymuscattours concierge experience. The 24/7 WhatsApp support was a game-changer during our trip.",
  },
  {
    name: "Layla Al Said",
    location: "Saudi Arabia",
    avatar: "/assets/testimonials/7.jpeg",
    quote:
      "Premium car rental with chauffeur service was exactly what our family needed. The kids loved the comfortable ride, and we could relax and enjoy the scenery.",
  },
  {
    name: "Isabella Rossi",
    location: "Italy",
    avatar: "/assets/testimonials/8.jpeg",
    quote:
      "The Wadi Shab and Bimmah Sinkhole tour was breathtaking! Our guide was knowledgeable and made sure we had the best experience. Worth every penny!",
  },
  {
    name: "Ahmed Al Rashid",
    location: "Kuwait",
    avatar: "/assets/testimonials/9.jpeg",
    quote:
      "Airport transport service was flawless. They handled our delayed flight perfectly and still arrived on time. Professional service from start to finish.",
  },
  {
    name: "Sarah Johnson",
    location: "United Kingdom",
    avatar: "/assets/testimonials/10.jpeg",
    quote:
      "The cultural city tour of Muscat was eye-opening. We learned so much about Omani history and traditions. The guide's passion for the city was infectious!",
  },
  {
    name: "Mohammed Al Zadjali",
    location: "Oman",
    avatar: "/assets/testimonials/11.jpeg",
    quote:
      "Rented a premium sedan for business meetings. The car was immaculate, and the chauffeur was professional and discreet. Perfect for corporate travel.",
  },
  {
    name: "Priya Sharma",
    location: "India",
    avatar: "/assets/testimonials/12.jpeg",
    quote:
      "The Wahiba Sands desert tour was unforgettable! From dune bashing to camel rides, every moment was perfectly organized. The sunset was absolutely magical.",
  },
  {
    name: "David Chen",
    location: "Australia",
    avatar: "/assets/testimonials/13.jpeg",
    quote:
      "Airport pickup was smooth and efficient. The driver was waiting with a sign, helped with luggage, and provided water and refreshments. Excellent service!",
  },
  {
    name: "Fatima Al Balushi",
    location: "Oman",
    avatar: "/assets/testimonials/14.jpeg",
    quote:
      "The private city tour was tailored perfectly to our interests. We visited local markets, historical sites, and had authentic Omani coffee. Truly memorable!",
  },
  {
    name: "James Wilson",
    location: "Canada",
    avatar: "/assets/testimonials/15.jpeg",
    quote:
      "Car rental service was top-notch. The vehicle was brand new, fully equipped, and the concierge team helped us plan our route. Made exploring Muscat easy!",
  },
  {
    name: "Noor Al Harthy",
    location: "Oman",
    avatar: "/assets/testimonials/16.jpeg",
    quote:
      "The concierge team arranged everything for our anniversary trip. From romantic dinner reservations to private tours, they thought of every detail. Exceptional!",
  },
  {
    name: "Michael Brown",
    location: "Germany",
    avatar: "/assets/testimonials/17.jpeg",
    quote:
      "Airport transfer service was reliable and comfortable. After a long flight, having a professional driver waiting made all the difference. Highly recommended!",
  },
  {
    name: "Aisha Al Kindi",
    location: "Oman",
    avatar: "/assets/testimonials/18.jpeg",
    quote:
      "The Muscat heritage tour was fascinating! We explored ancient forts, traditional houses, and learned about Omani culture. Our guide was passionate and engaging.",
  },
  {
    name: "Robert Taylor",
    location: "United States",
    avatar: "/assets/testimonials/19.jpeg",
    quote:
      "Luxury car rental with chauffeur made our business trip effortless. The driver knew all the best routes and was always punctual. Professional service throughout.",
  },
  {
    name: "Zainab Al Lawati",
    location: "Oman",
    avatar: "/assets/testimonials/20.jpeg",
    quote:
      "The snorkeling trip to Daymaniat Islands was incredible! The boat was comfortable, the crew was friendly, and the underwater world was breathtaking. Perfect day out!",
  },
];

const totalDisplayed = 40;

export default function TestimonialsSection() {
  const scrollingTestimonials = useMemo(() => {
    return Array.from({ length: totalDisplayed }, (_, index) => {
      const base = baseTestimonials[index % baseTestimonials.length];
      const rating = index % 3 === 0 ? 5 : 4;
      return {
        ...base,
        id: `${base.name}-${index}`,
        rating,
      };
    });
  }, []);

  const marqueeTestimonials = useMemo(() => {
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
        <div className="testimonial-track flex w-max gap-6">
          {marqueeTestimonials.map((testimonial) => (
          <article
              key={testimonial.uniqueId}
              className="group flex w-[280px] min-w-[280px] flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60 sm:w-[320px] sm:min-w-[320px] sm:px-6 sm:py-6"
          >
            <div className="flex items-start gap-4">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                  className="h-14 w-14 rounded-2xl object-cover sm:h-16 sm:w-16"
              />
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
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#f8fbff] to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#f8fbff] to-transparent"></div>
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


import Image from "next/image";
import { PiAirplaneTiltFill, PiGlobeHemisphereWestFill, PiUsersThreeFill } from "react-icons/pi";

const metrics = [
  {
    value: "33",
    label: "Year Experience",
    icon: <PiAirplaneTiltFill className="h-6 w-6 text-(--color-brand-600)" />,
  },
  {
    value: "78",
    label: "Destination Collaboration",
    icon: <PiGlobeHemisphereWestFill className="h-6 w-6 text-(--color-brand-600)" />,
  },
  {
    value: "25K",
    label: "Happy Customers",
    icon: <PiUsersThreeFill className="h-6 w-6 text-(--color-brand-600)" />,
  },
];

export default function ExperienceServices() {
  return (
    <section className="bg-white">
      <div className="section flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
        <div className="flex justify-center md:w-1/2">
          <VisualColumn />
        </div>
        <div className="md:w-1/2">
          <ContentColumn />
        </div>
      </div>
    </section>
  );
}

function VisualColumn() {
  return (
    <div className="relative h-88 w-88">
      <Image
        src="/img-2.webp"
        alt="citymuscattours curated travel collage"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute -bottom-14 left-10 flex items-center gap-4 rounded-3xl border border-white/70 bg-white px-6 py-4 shadow-[0_25px_80px_-60px_rgb(15_23_42/0.5)]">
        <div className="flex items-center -space-x-2">
          {["/assets/experience/1.jpeg", "/assets/experience/2.jpeg", "/assets/experience/3.jpeg"].map(
            (src, idx) => (
              <img
                key={src}
                src={src}
                alt="Client"
                className={`h-9 w-9 rounded-full border-2 border-white object-cover ${idx === 0 ? "" : ""}`}
              />
            ),
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Client
          </p>
          <p className="text-sm font-semibold text-slate-900">1K+</p>
        </div>
        <div className="h-10 w-px bg-slate-200" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Rating
          </p>
          <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
            4.5
            <span className="text-[#facc15]">★</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ContentColumn() {
  return (
    <div className="space-y-8 text-left md:pl-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-(--color-brand-500)">
          Memories
        </span>
        <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
          Our Attractive Experience And Services For you!
        </h2>
      </div>
      <div className="space-y-4 text-[0.95rem] leading-relaxed text-slate-600">
        <p>
          Using authentic insights during the design process ensures every journey feels effortless.
          From airport welcomes to city storytelling, we orchestrate all the details so you can
          simply arrive and savour the experience. Real data guides us to avoid unexpected hurdles
          and keep travel joyful.
        </p>
        <p>
          A seemingly elegant design can quickly begin to bloat with unsuspected content or break
          under the weight of actual activity. We prevent those surprises by stress-testing every
          itinerary with live concierge feedback and local expertise.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {metrics.map((metric) => (
          <MetricsCard key={metric.label} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function MetricsCard({
  metric,
}: {
  metric: (typeof metrics)[number];
}) {
  return (
    <div className="group flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fbff] px-6 py-4 shadow-md shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
        {metric.icon}
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{metric.value}</p>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-500">
          {metric.label}
        </p>
      </div>
    </div>
  );
}


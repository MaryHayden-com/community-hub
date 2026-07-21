import { Search, CalendarDays, PlusCircle, HeartHandshake, ArrowRight } from "lucide-react";

const BENEFITS = [
  { icon: Search, title: "Search anywhere in Ireland", desc: "Find businesses, clubs and services by county or town." },
  { icon: CalendarDays, title: "What's On events", desc: "See upcoming markets, meetups and community events." },
  { icon: PlusCircle, title: "Add yours, free", desc: "Add a business, club, group or event in minutes." },
  { icon: HeartHandshake, title: "Built for communities", desc: "From West Cork to every county — all in one hub." },
];

export default function HomeHero({ onAddListing }) {
  return (
    <section className="mb-6" aria-labelledby="home-brand">
      {/* Image hero with teal overlay */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src="https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/7fe81efa0_generated_image.png"
          alt="Community market scene in an Irish town"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(115deg, hsl(182 85% 18% / 0.92) 0%, hsl(182 85% 22% / 0.78) 55%, hsl(182 85% 26% / 0.55) 100%)" }}
        />

        <div className="relative px-6 sm:px-10 py-10 sm:py-14">
          <p className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
            Your free community directory
          </p>
          <h1
            id="home-brand"
            className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight"
          >
            Hub4Community
          </h1>
          <p className="mt-3 text-white/95 text-base sm:text-lg leading-relaxed max-w-xl">
            Find and support the businesses, clubs and events that make up your community —
            and add your own so people can find you too.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={onAddListing}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px]"
              style={{ background: "#E2701B" }}
            >
              <PlusCircle className="w-4 h-4" /> Add Your Listing
            </button>
            <button
              onClick={onAddListing}
              className="inline-flex items-center justify-center gap-1.5 px-2 py-3 rounded-full font-medium text-sm text-white/90 hover:text-white transition-colors min-h-[44px]"
            >
              Already listed? Claim your listing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2 text-white/70 text-xs">
            A listing is a free profile page — for a business, club, group, school or event.
          </p>
        </div>
      </div>

      {/* Benefits row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="rounded-xl bg-card border border-border p-4 text-center shadow-sm"
            style={{ borderTop: "3px solid #E2701B" }}
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full mb-2" style={{ background: "hsl(182 85% 25% / 0.1)" }}>
              <b.icon className="w-4 h-4" style={{ color: "#097275" }} aria-hidden="true" />
            </span>
            <p className="font-semibold text-sm" style={{ color: "#097275" }}>{b.title}</p>
            <p className="text-muted-foreground text-xs mt-1 leading-snug">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
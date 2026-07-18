import { Search, CalendarDays, PlusCircle, HeartHandshake } from "lucide-react";

const BENEFITS = [
  { icon: Search, title: "Search anywhere in Ireland", desc: "Find businesses, clubs and services by county or town." },
  { icon: CalendarDays, title: "What's On events", desc: "See upcoming markets, meetups and community events." },
  { icon: PlusCircle, title: "Add your free listing", desc: "List a business, group or event in just a few minutes." },
  { icon: HeartHandshake, title: "Built for communities", desc: "From West Cork to every county — all in one free hub." },
];

export default function HomeHero({ onAddListing }) {
  return (
    <section
      className="rounded-2xl p-6 sm:p-8 mb-5"
      style={{ background: "hsl(182 85% 25%)" }}
      aria-labelledby="home-brand"
    >
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
          Ireland's free community directory
        </p>
        <h1 id="home-brand" className="font-display text-3xl sm:text-4xl font-bold text-white">
          Hub4Community
        </h1>
        <p className="text-white/90 mt-3 text-sm sm:text-base leading-relaxed">
          Hub4Community is a free directory for communities across Ireland. Find local businesses,
          clubs, community services, schools and upcoming events near you — or add your own listing
          so people can find you.
        </p>
        <button
          onClick={onAddListing}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white shadow"
          style={{ background: "#E2701B" }}
        >
          <PlusCircle className="w-4 h-4" /> Add Your Free Listing
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-xl bg-white/10 p-3 text-center">
            <b.icon className="w-5 h-5 mx-auto text-white" aria-hidden="true" />
            <p className="text-white font-semibold text-sm mt-1.5">{b.title}</p>
            <p className="text-white/70 text-xs mt-0.5 leading-snug">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
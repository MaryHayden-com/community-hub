import { PlusCircle, MapPin, HeartHandshake, Store, CheckCircle2, Users, Calendar, GraduationCap } from "lucide-react";

const WHY_BULLETS = [
  "Find trusted local businesses and services.",
  "Discover clubs, groups and events near you.",
  "Help communities become more visible and better connected.",
];

const METRICS = [
  { key: "businesses", label: "local businesses", icon: Store },
  { key: "clubs", label: "clubs & groups", icon: Users },
  { key: "services", label: "community services", icon: HeartHandshake },
  { key: "education", label: "education & training", icon: GraduationCap },
  { key: "eventsThisWeek", label: "events this week", icon: Calendar },
  { key: "towns", label: "towns covered", icon: MapPin },
];

const STEPS = [
  "Browse by county, town or category.",
  "Discover local businesses, clubs, events and services.",
  "Connect with what is happening in your area.",
  "Add your organisation so more people can find you.",
];

export default function HomeContent({ onAddListing, metrics = {} }) {
  const metricTiles = METRICS.filter((m) => (metrics[m.key] || 0) > 0);

  return (
    <div id="about" className="mt-10 space-y-6 scroll-mt-20">
      {/* Why people use Community Hub */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>Why people use Community Hub</h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#333333" }}>
          Community Hub makes local life easier to navigate. Whether someone is looking for a trusted local service, a club to join, an event to attend or a community resource to access, the platform brings that information together in one place.
        </p>
        <ul className="mt-3 space-y-1.5">
          {WHY_BULLETS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm" style={{ color: "#333333" }}>
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#E2701B" }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* For organisations */}
      <section className="rounded-2xl p-5 sm:p-6" style={{ background: "#097275" }}>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Make your organisation easier to find</h2>
        <p className="text-sm mt-2 leading-relaxed text-white/85">
          If you run a business, club, venue, charity or community group, Community Hub gives people a simple way to discover what you do. Add your listing, share your events and make it easier for local people to connect with your organisation.
        </p>
        <button
          type="button"
          onClick={onAddListing}
          className="mt-4 rounded-lg px-4 py-2.5 text-white text-sm font-bold min-h-[44px] inline-flex items-center gap-2"
          style={{ background: "#E2701B" }}
        >
          <PlusCircle className="w-4 h-4" /> List your organisation
        </button>
      </section>

      {/* Local trust + live metrics */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>Built around real places and real communities</h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#333333" }}>
          Community Hub is not just a directory. It is a practical way to help local communities become easier to explore, support and take part in. Starting in Ireland, with a strong local focus on Bandon and West Cork, the platform keeps a clear local identity that runs across every page.
        </p>
        {metricTiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {metricTiles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-xl p-4 border text-center" style={{ borderColor: "hsl(var(--border))" }}>
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: "#E2701B" }} />
                <p className="font-display text-2xl font-bold leading-none" style={{ color: "#097275" }}>
                  {(metrics[key] || 0).toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: "#333333" }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>How it works</h2>
        <ol className="mt-3 space-y-2">
          {STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#333333" }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#097275" }}>{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Meet Mary Hayden */}
      <section className="rounded-2xl border p-5 sm:p-6" style={{ background: "rgba(226, 112, 27, 0.08)", borderColor: "#E2701B" }}>
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>Meet Mary Hayden</h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#333333" }}>
          Mary Hayden works independently with founders, SME leaders and community-focused organisations to help them bring more clarity to what they are building, how they communicate it and how they grow it. With a background in finance, operations and digital transformation, she brings practical outside perspective without the jargon, helping good ideas become clearer, stronger and easier to deliver.
        </p>
        <p className="text-sm mt-3 italic" style={{ color: "#097275" }}>
          Independent strategic partner helping community-focused organisations and SMEs make ideas clearer, more visible and easier to deliver.
        </p>
      </section>
    </div>
  );
}
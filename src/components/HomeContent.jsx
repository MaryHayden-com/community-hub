import { PlusCircle, MapPin, HeartHandshake, Store, CheckCircle2, Users, Calendar, GraduationCap, Handshake, Heart, Compass } from "lucide-react";

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

const ABOUT_CARDS = [
  { icon: Handshake, title: "Welcome newcomers", text: "New to the area? Everything local, in one friendly place — find your people and your next thing to do." },
  { icon: Store, title: "Shop local", text: "Keep the community thriving by finding and supporting the businesses on your doorstep." },
  { icon: Heart, title: "A platform for local business", text: "Be found by the people looking for you — your business, club or event, in front of your local community, for free." },
  { icon: Compass, title: "Less friction, for everyone", text: "No account needed to browse. Adding your listing takes a minute. Finding what you need takes less." },
];

export default function HomeContent({ onAddListing, metrics = {} }) {
  const metricTiles = METRICS.filter((m) => (metrics[m.key] || 0) > 0);

  return (
    <div id="about" className="mt-10 space-y-6 scroll-mt-20">
      {/* Why we built this */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>Why we built this</h2>
        <p className="text-sm mt-3 leading-relaxed max-w-2xl" style={{ color: "#333333" }}>
          Great local businesses, clubs and events shouldn't be hard to find — and finding your feet in a new place shouldn't feel lonely or be so complicated. We put the right people in front of the right business, service, event or community group, and help everything local get seen.
          <span className="block mt-2 font-medium" style={{ color: "#097275" }}>That's how communities come together.</span>
        </p>
      </section>

      {/* Keep this site updated */}
      <section className="rounded-lg p-5 leading-relaxed" style={{ background: "#f5e6d9", border: "1px solid #e68a35" }}>
        <p className="text-sm leading-relaxed" style={{ color: "#333333" }}>
          There are so many ways to find information these days — Facebook, WhatsApp groups, notice boards, a flyer in the shop window. But when it comes down to it, it's still hard to know what's on, where it's on, and what time. Too often we only hear about it after the fact. If we all keep this site updated, we'll have everything local in one place — and no one misses out.
        </p>
      </section>

      {/* Four-card grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ABOUT_CARDS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border bg-card p-5" style={{ borderColor: "hsl(var(--border))" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(230,138,53,0.12)" }}>
              <Icon className="w-5 h-5" style={{ color: "#E2701B" }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: "#097275" }}>{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#333333" }}>{text}</p>
          </div>
        ))}
      </section>

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

      {/* A note from the founder */}
      <section className="rounded-2xl p-5 sm:p-6" style={{ background: "rgba(9,114,117,0.06)", border: "1px solid #097275" }}>
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>A note from the founder — Mary Hayden</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed" style={{ color: "#333333" }}>
          <p>
            I'm Mary Hayden — mother of four and the founder behind Community Hub. I moved to Bandon in West Cork a few years ago, and like so many people who arrive somewhere new, I quickly found that the hardest part wasn't settling in — it was simply finding out what was going on.
          </p>
          <p>
            Local life here is rich and busy: clubs, classes, markets, gigs, community groups, small businesses doing brilliant things. But that information is scattered across Facebook, WhatsApp groups, notice boards and word of mouth. You only seemed to hear about an event after it had happened. I kept thinking — there must be a simpler way.
          </p>
          <p>
            With a background in finance, operations and digital transformation, I work with founders and community-focused organisations to help them bring clarity to what they're building. Community Hub is me turning that same instinct on my own doorstep — one place where everything local gets seen, kept up to date by the people who run it, and free for anyone to browse.
          </p>
          <p>
            I hope you like it; please spread the word. The more people who join in, the better it works for all of us.
          </p>
        </div>
      </section>
    </div>
  );
}
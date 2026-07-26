import { Link } from "react-router-dom";
import { Store, Heart, Leaf, Compass, PlusCircle, Compass as ExploreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

const TEAL = "#006767";
const ORANGE = "#e68a35";
const ORANGE_BTN = "#e67e22";
const PEACH = "#f5e6d9";
const MINT = "#eef5f5";

const CARDS = [
  {
    icon: Heart,
    title: "Welcome newcomers",
    text: "New to the area? Everything local, in one friendly place — find your people and your next thing to do.",
  },
  {
    icon: Store,
    title: "Shop local",
    text: "Keep the community thriving by finding and supporting the businesses on your doorstep.",
  },
  {
    icon: Heart,
    title: "A platform for local business",
    text: "Be found by the people looking for you — your business, club or event, in front of your local community, for free.",
  },
  {
    icon: Leaf,
    title: "Less friction, for everyone",
    text: "No account needed to browse. Adding your listing takes a minute. Finding what you need takes less.",
  },
];

const STEPS = [
  { label: "Discover", icon: Compass, text: "Browse local businesses, clubs, classes and what's on near you." },
  { label: "Connect", icon: Heart, text: "Save your favourites and get involved in what's happening." },
  { label: "Belong", icon: PlusCircle, text: "Add your own business, group or event and help the community grow." },
];

export default function About() {
  usePageTitle("About Hub4Community", {
    description: "Why we built Hub4Community — a free, locally-focused directory for Bandon and West Cork, founded by Mary Hayden.",
    path: "/about",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8" style={{ background: "#fcfcfc" }}>
      {/* Header / Intro */}
      <header className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mt-3">
          <span style={{ color: "#D67D3E" }}>Hub4</span><span style={{ color: "#2A7373" }}>Community</span>
        </h1>
        <h2 className="mt-3 text-base sm:text-lg font-bold" style={{ color: "#333333" }}>Why we built this</h2>
        <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#333333" }}>
          Great local businesses, clubs and events shouldn't be hard to find — and finding your feet in a new place shouldn't feel lonely or be so complicated. We put the right people in front of the right business, service, event or community group, and help everything local get seen.
          <span className="block mt-2 font-medium" style={{ color: TEAL }}>That's how communities come together.</span>
        </p>
      </header>

      {/* Highlighted info box */}
      <section
        className="rounded-lg p-5 sm:p-6 text-sm sm:text-base leading-relaxed"
        style={{ background: PEACH, border: `1px solid ${ORANGE}` }}
      >
        <p style={{ color: "#333333" }}>
          There are so many ways to find information these days — Facebook, WhatsApp groups, notice boards, a flyer in the shop window. But when it comes down to it, it's still hard to know what's on, where it's on, and what time. Too often we only hear about it after the fact. If we all keep this site updated, we'll have everything local in one place — and no one misses out.
        </p>
      </section>

      {/* Four-card grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border bg-white p-5" style={{ borderColor: "#e5e5e5" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "rgba(230,138,53,0.12)" }}>
              <Icon className="w-5 h-5" style={{ color: ORANGE }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: TEAL }}>{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#333333" }}>{text}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="font-display text-2xl font-bold text-center" style={{ color: TEAL }}>How it works</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEPS.map(({ label, icon: Icon, text }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{ background: "#F2F5F5" }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Icon className="w-4 h-4" style={{ color: ORANGE_BTN }} />
                <span className="font-bold text-sm sm:text-base" style={{ color: TEAL }}>{label}</span>
              </div>
              <p className="text-xs sm:text-sm leading-snug" style={{ color: "#333333" }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* A note from the founder */}
      <section className="rounded-xl p-5 sm:p-6" style={{ background: MINT, border: `1px solid ${TEAL}` }}>
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: TEAL }}>A note from the founder — Mary Hayden</h2>
        <div className="mt-3 space-y-3 text-sm sm:text-base leading-relaxed" style={{ color: "#333333" }}>
          <p>
            I'm Mary Hayden — mother of four and the founder behind Community Hub. We recently relocated to Bandon, West Cork, and have thrown ourselves into local community groups and schools, meeting some truly fabulous people along the way.
          </p>
          <p>
            I work independently with founders, SME leaders and community-focused organisations to help them bring more clarity to what they are building, how they communicate it and how they grow it. With a background in finance, operations and digital transformation, I bring practical outside perspective without the jargon, helping good ideas become clearer, stronger and easier to deliver.
          </p>
          <p>
            Now I want to translate that work for our local communities, by "Streamlining communities", if you like — taking the same clarity and structure I bring to businesses, and applying it to making everything local easier to find, and every local organisation easier to be seen. Not everyone has kids to help them integrate to a new place, so I built this app to take the pain out of getting the right people in front of the right Product, Service or Event — and to help others navigate a new community. I hope you like it; please spread the word. The more people who join in, the better it works for all of us.
          </p>
        </div>
      </section>

      {/* Buttons row */}
      <section className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2">
        <Button asChild className="h-11 px-6 text-white" style={{ background: TEAL, border: "none" }}>
          <Link to="/directory"><ExploreIcon className="w-4 h-4 mr-2" /> Explore the directory</Link>
        </Button>
        <Button asChild className="h-11 px-6 text-white" style={{ background: ORANGE_BTN, border: "none" }}>
          <Link to="/directory"><PlusCircle className="w-4 h-4 mr-2" /> Add your listing</Link>
        </Button>
        <Link to="/privacy" className="text-sm underline underline-offset-4" style={{ color: TEAL }}>Privacy policy</Link>
      </section>
    </div>
  );
}
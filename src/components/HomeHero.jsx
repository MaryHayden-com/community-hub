import { useNavigate } from "react-router-dom";
import { Search, Store, Users, GraduationCap, Calendar, Compass, PlusCircle, Heart, HeartHandshake } from "lucide-react";

const TILES = [
  { key: "Business", label: "Business", icon: Store, path: "/directory?type=Business" },
  { key: "Club & Group", label: "Clubs", icon: Users, path: "/directory?type=Club%20%26%20Group" },
  { key: "Community Services", label: "Community", icon: HeartHandshake, path: "/directory?type=Community%20Services" },
  { key: "Education", label: "Education", icon: GraduationCap, path: "/directory?type=Education" },
  { key: "What's On", label: "What's On", icon: Calendar, path: "/directory?type=What's%20On" },
];

const STEPS = [
  { title: "Discover", icon: Compass, desc: "Browse local businesses, clubs, classes and what's on near you.", action: "browse" },
  { title: "Connect", icon: Heart, desc: "Save your favourites and get involved in what's happening.", action: "saved" },
  { title: "Belong", icon: PlusCircle, desc: "Add your own business, group or event and help the community grow.", action: "add" },
];

export default function HomeHero({ onAddListing, onSearch, onSearchWhatsOn, onSuggestBusiness }) {
  const navigate = useNavigate();

  return (
    <section className="mb-6" aria-labelledby="home-brand">
      <div className="relative rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-5 sm:px-8 py-7 sm:py-10 max-w-3xl mx-auto">

          {/* ── Header ── belonging-led, place-first ── */}
          <div className="text-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
              <span style={{ color: "#E2701B" }}>Hub4</span><span style={{ color: "#097275" }}>Community</span>
            </p>
            <h1 id="home-brand" className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight mb-3" style={{ color: "#097275" }}>
              Everything happening in your community, in one place.
            </h1>
            <p className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto" style={{ color: "#333333" }}>
              New here or lifelong local — find the shops, clubs, classes and events that make this place ours. Free to explore, free to be part of.
            </p>
          </div>

          {/* ── Two clear paths (residents vs contributors) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {/* Resident path — teal */}
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "rgba(9, 114, 117, 0.08)", border: "1.5px solid #097275" }}>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 shrink-0" style={{ color: "#097275" }} />
                <h2 className="text-sm sm:text-base font-bold leading-tight" style={{ color: "#097275" }}>Looking for something local?</h2>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "#333333" }}>
                Start here. Everything local, in one friendly place — find your people, your favourites and your next thing to do.
              </p>
              <button
                type="button"
                onClick={onSearch}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm font-bold min-h-[44px]"
                style={{ background: "#097275" }}
              >
                Explore your community
              </button>
            </div>

            {/* Contributor path — orange (the one primary action) */}
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "rgba(226, 112, 27, 0.12)", border: "1.5px solid #E2701B" }}>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 shrink-0" style={{ color: "#E2701B" }} />
                <h2 className="text-sm sm:text-base font-bold leading-tight" style={{ color: "#911B1B" }}>Run a business, club or event?</h2>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "#333333" }}>
                Be found by the people looking for you — get in front of your local community for free. Every listing makes it easier for someone to find what they need.
              </p>
              <button
                type="button"
                onClick={onAddListing}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm font-bold min-h-[44px]"
                style={{ background: "#E2701B" }}
              >
                Add your business or group — free
              </button>
            </div>
          </div>

          {/* ── How it works strip ── Discover / Connect / Belong ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {STEPS.map(({ title, icon: Icon, desc, action }) => (
              <button
                key={title}
                type="button"
                onClick={() => {
                  if (action === "browse") onSearch?.();
                  else if (action === "saved") navigate("/saved");
                  else if (action === "add") onAddListing?.();
                }}
                className="rounded-xl p-3 text-center hover:shadow-md transition-shadow min-h-[44px]"
                style={{ background: "rgba(9, 114, 117, 0.06)" }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="w-4 h-4" style={{ color: "#E2701B" }} />
                  <span className="font-bold text-sm" style={{ color: "#097275" }}>{title}</span>
                </div>
                <p className="text-xs leading-snug" style={{ color: "#555555" }}>{desc}</p>
              </button>
            ))}
          </div>

          {/* ── Search bar (scrolls to the real directory search filter) ── */}
          <div className="mt-5 rounded-xl p-2" style={{ background: "rgba(226, 112, 27, 0.12)" }}>
            <button
              type="button"
              onClick={onSearch}
              className="w-full flex items-center gap-2 bg-card rounded-lg px-4 h-12 text-left"
            >
              <Search className="w-5 h-5 shrink-0" style={{ color: "#E2701B" }} />
              <span className="text-sm" style={{ color: "#999999" }}>Search the directory...</span>
            </button>
          </div>

          {/* ── 2×2 category tiles ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5">
            {TILES.map(({ key, label, icon: Icon, path }) => (
              <button
                key={key}
                type="button"
                onClick={() => { navigate(path); onSearch?.(); }}
                className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-h-[88px]"
                style={{ background: "rgba(226, 112, 27, 0.12)", border: "2px solid #E2701B" }}
              >
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#097275" }} />
                <span className="text-sm sm:text-base font-semibold" style={{ color: "#111111" }}>{label}</span>
              </button>
            ))}
          </div>

          {/* ── Sharing / suggestion nudge ── */}
          <div className="mt-5 text-center">
            <p className="text-xs sm:text-sm" style={{ color: "#555555" }}>
              Know a great local spot that's not here yet?{" "}
              <button
                type="button"
                onClick={onSuggestBusiness}
                className="font-semibold underline underline-offset-2"
                style={{ color: "#E2701B" }}
              >
                Add it — or tell them we'd love to have them
              </button>
              .
            </p>
          </div>
        </div>
      </div>

      {/* ── Why this exists ── the heart, said plainly ── */}
      <div className="mt-4 rounded-2xl bg-card border border-border p-5 sm:p-6 max-w-3xl mx-auto text-center">
        <p className="font-display text-base sm:text-lg leading-relaxed" style={{ color: "#333333" }}>
          Great local businesses, clubs and events shouldn't be hard to find — and finding your feet in a new place shouldn't feel lonely. We put the right people in front of the right things, and help everything local get seen. That's how communities come together.
        </p>
      </div>
    </section>
  );
}
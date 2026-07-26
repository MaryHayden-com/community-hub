import { useNavigate } from "react-router-dom";
import { Search, Store, Users, GraduationCap, Calendar } from "lucide-react";

const TILES = [
  { key: "Business", label: "Business", icon: Store, bg: "#fdf5e1", path: "/directory?type=Business" },
  { key: "Club & Group", label: "Clubs", icon: Users, bg: "#e1f1fb", path: "/directory?type=Club%20%26%20Group" },
  { key: "Education", label: "Education", icon: GraduationCap, bg: "#e4f4e2", path: "/directory?type=Education" },
  { key: "What's On", label: "What's On", icon: Calendar, bg: "#fbe1e1", path: "/directory?type=What's%20On" },
];

export default function HomeHero({ onAddListing, onSearch, onSearchWhatsOn, onSuggestBusiness }) {
  const navigate = useNavigate();

  return (
    <section className="mb-6" aria-labelledby="home-brand">
      <div className="relative rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-5 sm:px-8 py-7 sm:py-10 max-w-3xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center">
            <p className="text-sm sm:text-base mb-2">
              Your <span className="font-semibold" style={{ color: "#E2701B" }}>free</span> community directory
            </p>
            <h1 id="home-brand" className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-2">
              <span style={{ color: "#E2701B" }}>Hub4</span><span style={{ color: "#097275" }}>Community</span>
            </h1>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#333333" }}>
              Find local businesses, clubs and events — or list your own. Free, and always yours to manage.
            </p>
          </div>

          {/* ── Search bar (scrolls to the real directory search filter) ── */}
          <div className="mt-6 rounded-xl p-2" style={{ background: "rgba(226, 112, 27, 0.12)" }}>
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
            {TILES.map(({ key, label, icon: Icon, bg, path }) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-h-[88px]"
                style={{ background: bg }}
              >
                <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: "#097275" }} />
                <span className="text-sm sm:text-base font-semibold" style={{ color: "#111111" }}>{label}</span>
              </button>
            ))}
          </div>

          {/* ── Primary action buttons ── */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={onSearch}
              className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-3 text-white min-h-[64px]"
              style={{ background: "#097275" }}
            >
              <span className="text-sm font-bold leading-tight text-center">I'm looking for something local</span>
              <span className="text-xs opacity-90">(Explore the Hub)</span>
            </button>
            <button
              type="button"
              onClick={onAddListing}
              className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-3 text-white min-h-[64px]"
              style={{ background: "#097275" }}
            >
              <span className="text-sm font-bold leading-tight text-center">I run a business or group</span>
              <span className="text-xs opacity-90">(Set Up My Listing)</span>
            </button>
          </div>

          {/* ── Secondary action buttons ── */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              onClick={onSearch}
              className="flex items-center justify-center rounded-xl px-3 py-3 text-white text-sm font-semibold min-h-[48px]"
              style={{ background: "#E2701B" }}
            >
              Claim your business
            </button>
            <button
              type="button"
              onClick={onSuggestBusiness}
              className="flex items-center justify-center rounded-xl px-3 py-3 text-white text-sm font-semibold min-h-[48px]"
              style={{ background: "#E2701B" }}
            >
              Suggest one
            </button>
          </div>

          {/* ── Footer link ── */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onAddListing}
              className="text-sm font-semibold underline underline-offset-2"
              style={{ color: "#097275" }}
            >
              + Add Listing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
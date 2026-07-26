import { useNavigate } from "react-router-dom";
import { Search, Store, Users, GraduationCap, Calendar, Compass, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";

const TILES = [
  { key: "Business", label: "Business", icon: Store, path: "/directory?type=Business" },
  { key: "Club & Group", label: "Clubs", icon: Users, path: "/directory?type=Club%20%26%20Group" },
  { key: "Education", label: "Education", icon: GraduationCap, path: "/directory?type=Education" },
  { key: "What's On", label: "What's On", icon: Calendar, path: "/directory?type=What's%20On" },
];

export default function HomeHero({ onAddListing, onSearch, onSearchWhatsOn, onSuggestBusiness }) {
  const navigate = useNavigate();

  return (
    <section className="mb-6" aria-labelledby="home-brand">
      <div className="relative rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-5 sm:px-8 py-7 sm:py-10 max-w-3xl mx-auto">

          {/* ── Header ── benefit-led, place-first ── */}
          <div className="text-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
              <span style={{ color: "#E2701B" }}>Hub4</span><span style={{ color: "#097275" }}>Community</span>
            </p>
            <h1 id="home-brand" className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight mb-2" style={{ color: "#097275" }}>
              Everything happening in your community, in one place.
            </h1>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#333333" }}>
              Find local businesses, clubs, classes and events near you — or list your own. Free, and always yours to manage.
            </p>
          </div>

          {/* ── How it works strip ── */}
          <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold flex-wrap">
            <span style={{ color: "#097275" }}>Browse</span>
            <ArrowRight className="w-3.5 h-3.5" style={{ color: "#E2701B" }} />
            <span style={{ color: "#097275" }}>Save</span>
            <ArrowRight className="w-3.5 h-3.5" style={{ color: "#E2701B" }} />
            <span style={{ color: "#097275" }}>Get involved</span>
          </div>

          {/* ── No account needed badge ── */}
          <div className="mt-3 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ background: "rgba(9, 114, 117, 0.10)", color: "#097275" }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              No account needed to browse
            </span>
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

          {/* ── Two clear paths (browsers vs contributors) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {/* Browser path — teal */}
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "rgba(9, 114, 117, 0.08)", border: "1.5px solid #097275" }}>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 shrink-0" style={{ color: "#097275" }} />
                <h2 className="text-sm sm:text-base font-bold leading-tight" style={{ color: "#097275" }}>Looking for something local?</h2>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "#333333" }}>Browse businesses, clubs, classes and events near you.</p>
              <button
                type="button"
                onClick={onSearch}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm font-bold min-h-[44px]"
                style={{ background: "#097275" }}
              >
                Explore the directory
              </button>
            </div>

            {/* Contributor path — orange */}
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "rgba(226, 112, 27, 0.12)", border: "1.5px solid #E2701B" }}>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 shrink-0" style={{ color: "#E2701B" }} />
                <h2 className="text-sm sm:text-base font-bold leading-tight" style={{ color: "#911B1B" }}>Run a business, club or event?</h2>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "#333333" }}>Reach your community — add and manage your listing for free.</p>
              <button
                type="button"
                onClick={onAddListing}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm font-bold min-h-[44px]"
                style={{ background: "#E2701B" }}
              >
                Add your listing
              </button>
            </div>
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
        </div>
      </div>
    </section>
  );
}
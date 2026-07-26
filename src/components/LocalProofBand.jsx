import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, CalendarClock, ChevronRight } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { toArr, expandAndSortEvents } from "@/utils/recurringEvents";

const TODAY = () => new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function relAdded(listing) {
  if (!listing.created_date) return "";
  const days = Math.floor((TODAY() - new Date(listing.created_date)) / 86400000);
  if (days <= 0) return "Added today";
  if (days === 1) return "Added yesterday";
  if (days < 7) return `Added ${days} days ago`;
  if (days < 30) return `Added ${Math.floor(days / 7)}w ago`;
  return `Added ${new Date(listing.created_date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}`;
}

/**
 * Local-proof band: a live, area-scoped headline count + featured listings,
 * the next upcoming event, and recently-added listings.
 *
 * Sits between the HomeHero and the Directory header. Receives the already-
 * loaded browse dataset so no extra fetch is needed.
 */
export default function LocalProofBand({ listings, onSeeWhatsOn }) {
  const scope = useMemo(() => {
    const county = localStorage.getItem("dir_county") || "";
    const town = localStorage.getItem("dir_town") || "";
    const country = localStorage.getItem("dir_country") || "";
    return { county, town, country };
  }, []);

  const scoped = useMemo(() => {
    if (!listings) return [];
    return listings.filter((l) => {
      if (l.status === "pending" || l.status === "rejected") return false;
      if (scope.country && l.country !== scope.country) return false;
      if (scope.county && l.county !== scope.county) return false;
      if (scope.town && l.town !== scope.town) return false;
      return true;
    });
  }, [listings, scope]);

  const scopeLabel = scope.town
    ? `${scope.town}, ${scope.county}`
    : scope.county
    ? `Co. ${scope.county}`
    : scope.country && scope.country !== "Ireland"
    ? scope.country
    : "across the Hub";

  const counts = useMemo(() => {
    const c = { Business: 0, "Club & Group": 0, "Community Services": 0, Education: 0 };
    scoped.forEach((l) => { if (c[l.type] !== undefined) c[l.type] += 1; });
    const events = scoped.filter((l) => l.type === "What's On");
    const weekFrom = iso(TODAY());
    const weekTo = iso(addDays(TODAY(), 7));
    const thisWeek = expandAndSortEvents(events, weekFrom, weekTo).length;
    return { ...c, events: thisWeek };
  }, [scoped]);

  const featured = useMemo(
    () => scoped.filter((l) => l.is_featured).slice(0, 6),
    [scoped]
  );

  const nextEvent = useMemo(() => {
    const events = scoped.filter((l) => l.type === "What's On");
    const from = iso(TODAY());
    const upcoming = expandAndSortEvents(events, from, "");
    return upcoming[0] || null;
  }, [scoped]);

  const recent = useMemo(
    () =>
      [...scoped]
        .filter((l) => l.created_date)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5),
    [scoped]
  );

  const totalShown =
    counts.Business + counts["Club & Group"] + counts["Community Services"] + counts.Education;

  if (totalShown === 0 && counts.events === 0) return null;

  const statPills = [
    { label: "businesses", value: counts.Business },
    { label: "clubs & groups", value: counts["Club & Group"] },
    { label: "services", value: counts["Community Services"] },
    { label: "education", value: counts.Education },
    { label: "events this week", value: counts.events },
  ].filter((s) => s.value > 0);

  return (
    <section className="mb-6" aria-label="What's happening locally">
      {/* Headline count */}
      <div className="rounded-2xl p-4 sm:p-5 mb-4" style={{ background: "#097275" }}>
        <p className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#E2701B" }} /> Live in your area
        </p>
        <h2 className="font-display text-white text-xl sm:text-2xl font-bold mt-1 leading-snug">
          {statPills.map((s, i) => (
            <span key={s.label}>
              {i > 0 && <span className="text-white/50"> · </span>}
              <span>{s.value}</span> <span className="font-normal text-white/85">{s.label}</span>
            </span>
          ))}
        </h2>
        <p className="text-white/70 text-xs mt-1">Showing {scopeLabel}</p>
      </div>

      {/* Featured listings */}
      {featured.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "#097275" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#E2701B" }} /> Featured
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {featured.map((l) => (
              <div key={l.id} className="shrink-0 w-56 snap-start">
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next up + recently added */}
      {(nextEvent || recent.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {nextEvent && (
            <Link
              to={`/listing/${nextEvent.listing.id}`}
              className="block rounded-xl p-4 border bg-card hover:shadow-md transition-shadow"
              style={{ borderColor: "#E2701B" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" style={{ color: "#E2701B" }} /> Next up
              </p>
              <p className="font-bold mt-1 leading-tight" style={{ color: "#097275" }}>
                {nextEvent.listing.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {nextEvent.date
                  ? nextEvent.date.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" }) +
                    (nextEvent.listing.event_time ? ` · ${nextEvent.listing.event_time}` : "")
                  : "Date TBC"}
              </p>
              {nextEvent.listing.town && (
                <p className="text-xs text-muted-foreground mt-0.5">{nextEvent.listing.town}, {nextEvent.listing.county}</p>
              )}
              {onSeeWhatsOn && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: "#E2701B" }}>
                  See all events <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </Link>
          )}

          {recent.length > 0 && (
            <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "hsl(var(--border))" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Recently added
              </p>
              <ul className="mt-1 divide-y divide-border">
                {recent.map((l) => (
                  <li key={l.id}>
                    <Link to={`/listing/${l.id}`} className="flex items-center justify-between gap-2 py-1.5 group">
                      <span className="min-w-0">
                        <span className="font-semibold text-sm truncate block group-hover:underline" style={{ color: "#097275" }}>
                          {l.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block">
                          {l.town ? `${l.town}, ` : ""}{l.county}
                        </span>
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{relAdded(l)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
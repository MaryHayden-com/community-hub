import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Thin, live "this site is alive" signal for the top of the home/browse hero.
// Self-contained: fetches the newest listings once on mount and derives two counts.
export default function LiveActivityBand() {
  const [newListings, setNewListings] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const recent = await base44.entities.CommunityListing.list("-created_date", 200);
        if (cancelled) return;
        const since = Date.now() - WEEK_MS;
        const weekAhead = Date.now() + WEEK_MS;
        let nw = 0, ev = 0;
        for (const l of recent) {
          if (l.created_date && new Date(l.created_date).getTime() >= since) nw++;
          if (l.type === "What's On") {
            if (l.is_recurring) {
              ev++;
            } else if (l.event_date) {
              const d = new Date(l.event_date + "T00:00:00").getTime();
              if (d >= Date.now() - 24 * 60 * 60 * 1000 && d <= weekAhead) ev++;
            }
          }
        }
        setNewListings(nw);
        setUpcomingEvents(ev);
      } catch {
        setNewListings(0);
        setUpcomingEvents(0);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Still loading, or nothing happening this week — render nothing.
  if (newListings === null) return null;
  if (newListings === 0 && upcomingEvents === 0) return null;

  return (
    <div
      className="mb-4 rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm flex-wrap text-center"
      style={{ background: "rgba(9,114,117,0.08)", color: "#097275" }}
    >
      <Sparkles className="w-4 h-4 shrink-0" />
      <span>
        Updated this week ·{" "}
        {newListings > 0 && (
          <>
            <strong>{newListings}</strong> new listing{newListings !== 1 ? "s" : ""}
          </>
        )}
        {newListings > 0 && upcomingEvents > 0 && " · "}
        {upcomingEvents > 0 && (
          <>
            <strong>{upcomingEvents}</strong> event{upcomingEvents !== 1 ? "s" : ""} this week
          </>
        )}
      </span>
    </div>
  );
}
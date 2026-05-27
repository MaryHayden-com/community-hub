import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, MapPin, Clock, Star, Repeat, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMonths, subMonths, format, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO, startOfWeek, endOfWeek } from "date-fns";

const TYPE_COLOURS = {
  "What's On":        { bg: "bg-accent",       dot: "bg-accent",      text: "text-accent-foreground"  },
  "Club & Group":     { bg: "bg-primary/10",   dot: "bg-primary",     text: "text-primary"            },
  "Business":         { bg: "bg-amber-50",      dot: "bg-amber-500",   text: "text-amber-700"          },
  "Community Services":{ bg: "bg-emerald-50",  dot: "bg-emerald-500", text: "text-emerald-700"        },
  "Education":        { bg: "bg-purple-50",    dot: "bg-purple-500",  text: "text-purple-700"         },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getEventDates(listing) {
  // Returns an array of Date objects this listing is relevant to
  const dates = [];
  if (listing.event_date) {
    dates.push(parseISO(listing.event_date));
  }
  return dates;
}

export default function CalendarView() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    base44.entities.CommunityListing.filter({ status: "approved" }, "-event_date", 2000)
      .then((data) => {
        // Include What's On events + recurring clubs that have meeting info
        setListings(data.filter(l =>
          l.type === "What's On" ||
          (l.is_recurring && l.event_date) ||
          (l.type === "Club & Group" && l.event_date)
        ));
      })
      .finally(() => setLoading(false));
  }, []);

  // Build a map: dateString -> listings[]
  const eventMap = useMemo(() => {
    const map = {};
    listings.forEach((l) => {
      if (!l.event_date) return;
      const key = l.event_date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(l);
    });
    return map;
  }, [listings]);

  const calendarStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedEvents = useMemo(() => {
    if (!selectedDateKey) return [];
    const all = eventMap[selectedDateKey] || [];
    if (typeFilter === "all") return all;
    return all.filter(l => l.type === typeFilter);
  }, [selectedDateKey, eventMap, typeFilter]);

  // Events in current month for sidebar / list (when nothing selected)
  const monthEvents = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const results = [];
    Object.entries(eventMap).forEach(([dateStr, evts]) => {
      const d = parseISO(dateStr);
      if (d >= start && d <= end) {
        evts.forEach(e => results.push({ ...e, _dateKey: dateStr }));
      }
    });
    results.sort((a, b) => a._dateKey.localeCompare(b._dateKey));
    if (typeFilter !== "all") return results.filter(l => l.type === typeFilter);
    return results;
  }, [currentMonth, eventMap, typeFilter]);

  const displayEvents = selectedDate ? selectedEvents : monthEvents;
  const panelTitle = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy")
    : format(currentMonth, "MMMM yyyy");

  const allTypes = ["all", ...new Set(listings.map(l => l.type).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Community Calendar</h1>
        <p className="text-muted-foreground mt-1">Upcoming events, clubs, and local activities</p>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {allTypes.map((t) => {
          const colours = TYPE_COLOURS[t];
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize
                ${typeFilter === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* ── Calendar grid ── */}
        <div className="bg-card border rounded-xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-display font-bold text-xl">{format(currentMonth, "MMMM yyyy")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const key = format(day, "yyyy-MM-dd");
              const events = eventMap[key] || [];
              const filtered = typeFilter === "all" ? events : events.filter(l => l.type === typeFilter);
              const inMonth = isSameMonth(day, currentMonth);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <div
                  key={key}
                  onClick={() => setSelectedDate(selected ? null : day)}
                  className={`min-h-[72px] sm:min-h-[90px] p-1.5 sm:p-2 border-b border-r cursor-pointer transition-colors
                    ${!inMonth ? "bg-muted/30 opacity-50" : "hover:bg-muted/40"}
                    ${selected ? "bg-primary/10 ring-2 ring-inset ring-primary" : ""}
                    ${idx % 7 === 6 ? "border-r-0" : ""}
                  `}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold mb-1
                    ${today ? "bg-primary text-primary-foreground" : "text-foreground"}
                  `}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {filtered.slice(0, 3).map((l) => {
                      const col = TYPE_COLOURS[l.type] || TYPE_COLOURS["What's On"];
                      return (
                        <div key={l.id} className={`hidden sm:block truncate text-[10px] font-medium px-1 py-0.5 rounded ${col.bg} ${col.text}`}>
                          {l.name}
                        </div>
                      );
                    })}
                    {/* Mobile: just dots */}
                    <div className="flex gap-0.5 sm:hidden flex-wrap">
                      {filtered.slice(0, 4).map((l) => {
                        const col = TYPE_COLOURS[l.type] || TYPE_COLOURS["What's On"];
                        return <span key={l.id} className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />;
                      })}
                    </div>
                    {filtered.length > 3 && (
                      <div className="hidden sm:block text-[10px] text-muted-foreground px-1">+{filtered.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Event panel ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{panelTitle}</h3>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="text-xs text-muted-foreground hover:text-foreground underline">
                Show all month
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading events…</div>
          ) : displayEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm bg-card rounded-xl border">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {selectedDate ? "No events on this day." : "No events this month."}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-0.5">
              {displayEvents.map((l) => {
                const col = TYPE_COLOURS[l.type] || TYPE_COLOURS["What's On"];
                const dateLabel = l._dateKey ? format(parseISO(l._dateKey), "EEE d MMM") : (l.event_date ? format(parseISO(l.event_date), "EEE d MMM") : "");
                return (
                  <Link
                    key={l.id + (l._dateKey || "")}
                    to={`/listing/${l.id}`}
                    className="block bg-card border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      {l.image_url ? (
                        <img src={l.image_url} alt={l.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${col.bg}`}>
                          <span className={`text-lg font-bold ${col.text}`}>{l.name[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{l.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          {dateLabel && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dateLabel}{l.event_time ? ` · ${l.event_time}` : ""}
                            </span>
                          )}
                          {(l.town || l.county) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {[l.town, l.county].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${col.bg} ${col.text}`}>
                            {l.type}
                          </span>
                          {l.is_free && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Free</span>
                          )}
                          {l.is_recurring && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                              <Repeat className="w-2.5 h-2.5" /> Recurring
                            </span>
                          )}
                          {l.is_featured && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
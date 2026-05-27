import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WhatsOnEventRow from "@/components/WhatsOnEventRow";
import {
  addMonths, subMonths, format, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  parseISO, startOfWeek, endOfWeek
} from "date-fns";

const DAY_MAP = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Returns an array of date strings (YYYY-MM-DD) that a listing falls on within [rangeStart, rangeEnd]
function getListingDatesInRange(listing, rangeStart, rangeEnd) {
  const dates = [];

  if (!listing.is_recurring && listing.event_date) {
    const d = listing.event_date.slice(0, 10);
    if (d >= format(rangeStart, "yyyy-MM-dd") && d <= format(rangeEnd, "yyyy-MM-dd")) {
      dates.push(d);
    }
    // Multi-day span
    if (listing.event_date_end && listing.event_date_end > listing.event_date) {
      let cur = new Date(listing.event_date + "T12:00:00");
      const end = new Date(listing.event_date_end + "T12:00:00");
      while (cur <= end) {
        const key = format(cur, "yyyy-MM-dd");
        if (!dates.includes(key) && key >= format(rangeStart, "yyyy-MM-dd") && key <= format(rangeEnd, "yyyy-MM-dd")) {
          dates.push(key);
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return dates;
  }

  if (listing.is_recurring) {
    const t = listing.recurring_type || "weekly";
    const dayName = listing.recurring_day || "";
    const targetDay = DAY_MAP[dayName];

    if ((t === "weekly" || t === "fortnightly") && targetDay !== undefined) {
      let cur = new Date(rangeStart);
      // Advance to first matching weekday
      while (cur.getDay() !== targetDay) cur.setDate(cur.getDate() + 1);
      const step = t === "fortnightly" ? 14 : 7;
      while (cur <= rangeEnd) {
        dates.push(format(cur, "yyyy-MM-dd"));
        cur.setDate(cur.getDate() + step);
      }
    } else if (t === "2nd_4th_weekday" && targetDay !== undefined) {
      // Find all 2nd and 4th occurrences in the month
      const monthStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
      const monthEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0);
      const occurrences = [];
      let d = new Date(monthStart);
      while (d <= monthEnd) {
        if (d.getDay() === targetDay) occurrences.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      [occurrences[1], occurrences[3]].forEach((o) => {
        if (o) dates.push(format(o, "yyyy-MM-dd"));
      });
    }
    // Other recurring types (monthly_date, etc.) — not pinnable to a specific calendar cell easily; skip
  }

  return dates;
}

export default function CalendarView() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterCounty, setFilterCounty] = useState("");
  const [filterTown, setFilterTown] = useState("");

  useEffect(() => {
    base44.entities.CommunityListing.filter({ status: "approved" }, "-event_date", 2000)
      .then((data) => setListings(data.filter(l => l.type === "What's On")))
      .finally(() => setLoading(false));
  }, []);

  const allCounties = useMemo(() => [...new Set(listings.map(l => l.county).filter(Boolean))].sort(), [listings]);
  const allTowns = useMemo(() =>
    [...new Set(listings.filter(l => !filterCounty || l.county === filterCounty).map(l => l.area || l.town).filter(Boolean))].sort(),
    [listings, filterCounty]
  );

  const filteredListings = useMemo(() => listings.filter(l => {
    if (filterCounty && l.county !== filterCounty) return false;
    if (filterTown && (l.area || l.town) !== filterTown) return false;
    return true;
  }), [listings, filterCounty, filterTown]);

  const calendarStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Build map: dateString -> listings[]
  const eventMap = useMemo(() => {
    const map = {};
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    filteredListings.forEach((l) => {
      const dates = getListingDatesInRange(l, monthStart, monthEnd);
      dates.forEach((d) => {
        if (!map[d]) map[d] = [];
        map[d].push(l);
      });
    });
    return map;
  }, [filteredListings, currentMonth]);

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedEvents = selectedDateKey ? (eventMap[selectedDateKey] || []) : [];

  // All events in current month sorted by date, for the list view
  const monthEventsSorted = useMemo(() => {
    const results = [];
    Object.entries(eventMap).forEach(([dateKey, evts]) => {
      evts.forEach(l => results.push({ listing: l, dateKey }));
    });
    results.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return results;
  }, [eventMap]);

  const showingEvents = selectedDate ? selectedEvents.map(l => ({ listing: l, dateKey: selectedDateKey })) : monthEventsSorted;
  const panelTitle = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy")
    : `All events in ${format(currentMonth, "MMMM yyyy")}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">What's On — Calendar</h1>
        <p className="text-muted-foreground mt-1">Browse upcoming events and activities by date in your area</p>
      </div>

      {/* Location filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={filterCounty} onValueChange={(v) => { setFilterCounty(v === "__all__" ? "" : v); setFilterTown(""); }}>
          <SelectTrigger className="w-[150px] bg-card">
            <SelectValue placeholder="All Counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Counties</SelectItem>
            {allCounties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterTown} onValueChange={(v) => setFilterTown(v === "__all__" ? "" : v)} disabled={!filterCounty}>
          <SelectTrigger className="w-[170px] bg-card">
            <SelectValue placeholder={filterCounty ? "All Towns" : "Select county first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Towns</SelectItem>
            {allTowns.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        {(filterCounty || filterTown) && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setFilterCounty(""); setFilterTown(""); }}>
            Clear filters
          </Button>
        )}

        {filterCounty && (
          <span className="flex items-center gap-1 text-sm text-primary font-medium self-center">
            <MapPin className="w-3.5 h-3.5" />
            {[filterTown, filterCounty].filter(Boolean).join(", ")}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ── Calendar grid ── */}
        <div className="bg-card border rounded-xl overflow-hidden sticky top-20">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => { setCurrentMonth(m => subMonths(m, 1)); setSelectedDate(null); }}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-display font-bold text-xl">{format(currentMonth, "MMMM yyyy")}</h2>
            <Button variant="ghost" size="icon" onClick={() => { setCurrentMonth(m => addMonths(m, 1)); setSelectedDate(null); }}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b bg-muted/30">
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
              const inMonth = isSameMonth(day, currentMonth);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <div
                  key={key}
                  onClick={() => inMonth && setSelectedDate(selected ? null : day)}
                  className={`min-h-[64px] sm:min-h-[80px] p-1 sm:p-1.5 border-b border-r transition-colors
                    ${!inMonth ? "bg-muted/20 opacity-40 cursor-default" : events.length > 0 ? "cursor-pointer hover:bg-muted/40" : "cursor-default"}
                    ${selected ? "bg-primary/10 ring-2 ring-inset ring-primary" : ""}
                    ${idx % 7 === 6 ? "border-r-0" : ""}
                  `}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 transition-colors
                    ${today ? "bg-primary text-primary-foreground" : ""}
                    ${selected && !today ? "text-primary font-bold" : "text-foreground"}
                  `}>
                    {format(day, "d")}
                  </div>

                  {/* Desktop: event name chips */}
                  <div className="hidden sm:block space-y-0.5">
                    {events.slice(0, 2).map((l) => (
                      <div key={l.id} className="truncate text-[10px] font-medium px-1 py-0.5 rounded bg-accent/20 text-accent-foreground" style={{ color: '#E2701B' }}>
                        {l.name}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{events.length - 2}</div>
                    )}
                  </div>

                  {/* Mobile: orange dots */}
                  {events.length > 0 && (
                    <div className="flex gap-0.5 sm:hidden flex-wrap mt-0.5">
                      {events.slice(0, 3).map((l) => (
                        <span key={l.id} className="w-1.5 h-1.5 rounded-full bg-accent" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Event list panel ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base">{panelTitle}</h3>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                Show full month
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading events…</div>
          ) : showingEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{selectedDate ? "No events on this day." : "No events this month."}</p>
              {(filterCounty || filterTown) && (
                <p className="text-xs mt-1">Try clearing the location filter.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {showingEvents.map(({ listing, dateKey }, i) => {
                const dateObj = parseISO(dateKey + "T12:00:00");
                // Show date separator when viewing full month
                const prevDateKey = i > 0 ? showingEvents[i - 1].dateKey : null;
                const showSeparator = !selectedDate && dateKey !== prevDateKey;
                return (
                  <div key={listing.id + dateKey}>
                    {showSeparator && (
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2 pl-1">
                        {format(dateObj, "EEEE, d MMMM")}
                      </p>
                    )}
                    <WhatsOnEventRow listing={listing} overrideDate={dateObj} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  ChevronLeft, ChevronRight, CalendarDays, MapPin, List, Calendar, Loader2, PlusCircle, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WhatsOnEventRow from "@/components/WhatsOnEventRow";
import SubmitEventForm from "@/components/SubmitEventForm";
import NearMeButton from "@/components/NearMeButton";
import { getNextOccurrence, expandAndSortEvents, toArr } from "@/utils/recurringEvents";
import usePageTitle from "@/hooks/usePageTitle";
import {
  addMonths, subMonths, format, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  parseISO, startOfWeek, endOfWeek
} from "date-fns";

const DAYS_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const getTodayStr = () => new Date().toISOString().slice(0, 10);
const DAY_MAP = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

// Returns date strings a listing appears on within [rangeStart, rangeEnd] (for calendar grid)
function getListingDatesInRange(listing, rangeStart, rangeEnd) {
  const rangeStartStr = format(rangeStart, "yyyy-MM-dd");
  const rangeEndStr = format(rangeEnd, "yyyy-MM-dd");
  const dates = [];

  if (!listing.is_recurring && listing.event_date) {
    let cur = new Date(listing.event_date + "T12:00:00");
    const end = new Date((listing.event_date_end || listing.event_date) + "T12:00:00");
    while (cur <= end) {
      const key = format(cur, "yyyy-MM-dd");
      if (key >= rangeStartStr && key <= rangeEndStr) dates.push(key);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  if (listing.is_recurring) {
    const t = listing.recurring_type || "weekly";
    const targetDay = DAY_MAP[listing.recurring_day || ""];
    if ((t === "weekly" || t === "fortnightly") && targetDay !== undefined) {
      let cur = new Date(rangeStart);
      while (cur.getDay() !== targetDay) cur.setDate(cur.getDate() + 1);
      const step = t === "fortnightly" ? 14 : 7;
      while (cur <= rangeEnd) {
        dates.push(format(cur, "yyyy-MM-dd"));
        cur.setDate(cur.getDate() + step);
      }
    } else if (t === "2nd_4th_weekday" && targetDay !== undefined) {
      const occs = [];
      let d = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
      const mEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0);
      while (d <= mEnd) {
        if (d.getDay() === targetDay) occs.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      [occs[1], occs[3]].forEach(o => { if (o) dates.push(format(o, "yyyy-MM-dd")); });
    }
  }
  return dates;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function WhatsOn() {
  usePageTitle("What's On");
  const location = useLocation();
  const { user } = useAuth();
  const { data: listings = [], isLoading: loading, isError: loadError } = useQuery({
    queryKey: ["whatsOn"],
    queryFn: async () => {
      const BATCH = 200;
      let all = [], skip = 0, hasMore = true;
      while (hasMore) {
        const batch = await base44.entities.CommunityListing.filter({ status: "approved", type: "What's On" }, "-created_date", BATCH, skip);
        all = all.concat(batch);
        hasMore = batch.length === BATCH;
        skip += BATCH;
      }
      return all;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const [viewMode, setViewMode] = useState("calendar"); // "list" | "calendar"
  const [filterCounty, setFilterCounty] = useState("");
  const [filterTown, setFilterTown] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [userIsPaid, setUserIsPaid] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ownerListing, setOwnerListing] = useState(null);

  // List view state
  const [dateFrom, setDateFrom] = useState(getTodayStr);
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const panelTodayRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") setIsAdmin(true);
    if (user.email) {
      base44.entities.CommunityListing.filter({ owner_email: user.email }).then(ownedListings => {
        const paidListing = ownedListings.find(
          l => (l.plan === "standard" || l.plan === "premium") && l.plan_status === "active"
        );
        setUserIsPaid(user.role === "admin" || !!paidListing);
        if (paidListing) setOwnerListing(paidListing);
      }).catch(() => {});
    }
  }, [user]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filterCounty, filterTown, dateFrom, dateTo]);

  const allCounties = useMemo(() =>
    [...new Set(listings.map(l => l.county).filter(Boolean))].sort(), [listings]);

  const allTowns = useMemo(() =>
    [...new Set(listings.filter(l => !filterCounty || l.county === filterCounty).map(l => l.area || l.town).filter(Boolean))].sort(),
    [listings, filterCounty]);

  const filteredListings = useMemo(() => listings.filter(l => {
    if (filterCounty && l.county !== filterCounty) return false;
    if (filterTown && (l.area || l.town) !== filterTown) return false;
    return true;
  }), [listings, filterCounty, filterTown]);

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  const listItems = useMemo(() => expandAndSortEvents(filteredListings, dateFrom, dateTo), [filteredListings, dateFrom, dateTo]);

  const pagedItems = useMemo(() => listItems.slice(0, page * PAGE_SIZE), [listItems, page]);
  const hasMore = pagedItems.length < listItems.length;

  // ── CALENDAR VIEW ──────────────────────────────────────────────────────────
  const calendarStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventMap = useMemo(() => {
    const map = {};
    const mStart = startOfMonth(currentMonth);
    const mEnd = endOfMonth(currentMonth);
    filteredListings.forEach(l => {
      getListingDatesInRange(l, mStart, mEnd).forEach(d => {
        if (!map[d]) map[d] = [];
        map[d].push(l);
      });
    });
    return map;
  }, [filteredListings, currentMonth]);

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const calendarPanelItems = useMemo(() => {
    if (selectedDate) {
      return (eventMap[selectedDateKey] || []).map(l => ({ listing: l, dateKey: selectedDateKey }));
    }
    const results = [];
    Object.entries(eventMap).forEach(([dk, evts]) => evts.forEach(l => results.push({ listing: l, dateKey: dk })));
    results.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    // When showing the full month, only show from today onwards
    return results.filter(({ dateKey }) => dateKey >= getTodayStr());
  }, [eventMap, selectedDate, selectedDateKey]);

  const panelTitle = selectedDate
    ? format(selectedDate, "EEEE, d MMMM yyyy")
    : `Events from today`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <SubmitEventForm open={showSubmitForm} onClose={() => setShowSubmitForm(false)} isPaidUser={userIsPaid} isAdmin={isAdmin} ownerListing={ownerListing} />

      {/* Header + view toggle */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#097275' }}>What's On</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Upcoming events and activities across Ireland</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setShowSubmitForm(true)} className="gap-2" style={{ background: '#E2701B', border: 'none' }}>
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add an Event</span>
            <span className="sm:hidden">Add</span>
          </Button>

        {/* List / Calendar toggle */}
        <div className="flex rounded-lg border overflow-hidden bg-card">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${viewMode === "list" ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
            style={viewMode === "list" ? { background: "#097275" } : {}}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${viewMode === "calendar" ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
            style={viewMode === "calendar" ? { background: "#097275" } : {}}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <NearMeButton listings={listings} type="whatson" />
        
        <Select value={filterCounty} onValueChange={v => { setFilterCounty(v === "__all__" ? "" : v); setFilterTown(""); }}>
          <SelectTrigger className="w-[150px] bg-card"><SelectValue placeholder="All Counties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Counties</SelectItem>
            {allCounties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterTown} onValueChange={v => setFilterTown(v === "__all__" ? "" : v)} disabled={!filterCounty}>
          <SelectTrigger className="w-[170px] bg-card">
            <SelectValue placeholder={filterCounty ? "All Towns" : "Select county first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Towns</SelectItem>
            {allTowns.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        {viewMode === "list" && (
          <>
            <input
              type="date"
              value={dateFrom}
              min={getTodayStr()}
              onChange={e => setDateFrom(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <input
              type="date"
              value={dateTo}
              min={dateFrom || getTodayStr()}
              onChange={e => setDateTo(e.target.value)}
              placeholder="To date"
              className="h-9 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </>
        )}

        {(filterCounty || filterTown) && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setFilterCounty(""); setFilterTown(""); }}>
            Clear location
          </Button>
        )}

        {filterCounty && (
          <span className="flex items-center gap-1 text-sm font-medium self-center" style={{ color: '#097275' }}>
            <MapPin className="w-3.5 h-3.5" />
            {[filterTown, filterCounty].filter(Boolean).join(", ")}
          </span>
        )}
      </div>

      {loadError && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">Failed to load events. Please refresh the page.</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "list" ? (
        /* ══ LIST VIEW ══════════════════════════════════════════════════════ */
        <>
          <p className="text-sm text-muted-foreground mb-4">{listItems.length} event{listItems.length !== 1 ? "s" : ""} found</p>
          {listItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No events found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {pagedItems.map((entry, i) => (
                  <WhatsOnEventRow key={entry.listing.id + (entry.sortKey || i)} listing={entry.listing} overrideDate={entry.date} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" className="px-8" onClick={() => setPage(p => p + 1)}>
                    Load more ({listItems.length - pagedItems.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* ══ CALENDAR VIEW ══════════════════════════════════════════════════ */
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Calendar grid */}
          <div className="bg-card border rounded-xl overflow-hidden">
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
              {DAYS_HEADER.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{d}</div>
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
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                      ${today ? "bg-primary text-primary-foreground" : ""}
                      ${selected && !today ? "font-bold" : "text-foreground"}
                    `} style={selected && !today ? { color: '#097275' } : {}}>
                      {format(day, "d")}
                    </div>
                    {/* Desktop chips */}
                    <div className="hidden sm:block space-y-0.5">
                      {events.slice(0, 2).map(l => (
                        <div key={l.id} className="truncate text-[10px] font-medium px-1 py-0.5 rounded" style={{ background: '#E2701B22', color: '#E2701B' }}>
                          {l.name}
                        </div>
                      ))}
                      {events.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{events.length - 2}</div>}
                    </div>
                    {/* Mobile dots */}
                    {events.length > 0 && (
                      <div className="flex gap-0.5 sm:hidden flex-wrap mt-0.5">
                        {events.slice(0, 3).map(l => <span key={l.id} className="w-1.5 h-1.5 rounded-full" style={{ background: '#E2701B' }} />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event panel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">{panelTitle}</h3>
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Show full month
                </button>
              )}
            </div>
            {calendarPanelItems.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{selectedDate ? "No events on this day." : "No events this month."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {calendarPanelItems.map(({ listing, dateKey }, i) => {
                  const dateObj = parseISO(dateKey + "T12:00:00");
                  const prevKey = i > 0 ? calendarPanelItems[i - 1].dateKey : null;
                  const showSep = !selectedDate && dateKey !== prevKey;
                  const isFirstToday = !selectedDate && i === 0 && dateKey >= getTodayStr();
                  return (
                    <div key={listing.id + dateKey} ref={isFirstToday ? panelTodayRef : null}>
                      {showSep && (
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
      )}
    </div>
  );
}
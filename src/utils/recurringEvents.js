/**
 * Shared recurring-event helpers used by Directory, WhatsOn, and CalendarView.
 */

const DAY_MAP = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

/**
 * Returns the next ISO date string (YYYY-MM-DD) a recurring listing will occur on,
 * at or after today.
 */
export function getNextOccurrence(listing) {
  const t = listing.recurring_type || "weekly";
  const d = listing.recurring_day || "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (t === "weekly" || t === "fortnightly") {
    const target = DAY_MAP[d];
    if (target === undefined) return today.toISOString().slice(0, 10);
    const diff = (target - today.getDay() + 7) % 7;
    const next = new Date(today);
    next.setDate(today.getDate() + (diff === 0 ? 0 : diff));
    return next.toISOString().slice(0, 10);
  }

  if (t === "2nd_4th_weekday") {
    const target = DAY_MAP[d];
    if (target === undefined) return today.toISOString().slice(0, 10);
    const candidates = [];
    for (let mo = 0; mo <= 1; mo++) {
      const base = new Date(today.getFullYear(), today.getMonth() + mo, 1);
      const occs = [];
      const cur = new Date(base);
      while (cur.getMonth() === base.getMonth()) {
        if (cur.getDay() === target) occs.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      if (occs[1]) candidates.push(occs[1]); // 2nd occurrence
      if (occs[3]) candidates.push(occs[3]); // 4th occurrence
    }
    const next = candidates.find(c => c >= today);
    return next ? next.toISOString().slice(0, 10) : today.toISOString().slice(0, 10);
  }

  return today.toISOString().slice(0, 10);
}

/**
 * Expands a list of What's On listings into sortable {listing, date, sortKey} entries.
 * Handles multi-day, recurring, and single events.
 * Pass dateFrom / dateTo (YYYY-MM-DD strings) to filter; omit for no date filter.
 */
export function expandAndSortEvents(listings, dateFrom = "", dateTo = "") {
  const expanded = [];

  listings.forEach((l) => {
    if (!l.is_recurring && l.event_date && l.event_date_end && l.event_date_end > l.event_date) {
      // Multi-day: one entry per day
      const start = new Date(l.event_date + "T12:00:00");
      const end = new Date(l.event_date_end + "T12:00:00");
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        expanded.push({ listing: l, date: new Date(d), sortKey: d.toISOString().slice(0, 10) });
      }
    } else if (l.is_recurring) {
      const sortKey = getNextOccurrence(l);
      expanded.push({ listing: l, date: new Date(sortKey + "T12:00:00"), sortKey });
    } else {
      const sortKey = l.event_date || "9999";
      expanded.push({ listing: l, date: sortKey !== "9999" ? new Date(sortKey + "T12:00:00") : null, sortKey });
    }
  });

  expanded.sort((a, b) => {
    const dc = a.sortKey.localeCompare(b.sortKey);
    return dc !== 0 ? dc : (a.listing.event_time || "").localeCompare(b.listing.event_time || "");
  });

  return expanded.filter(({ sortKey }) => {
    if (sortKey === "9999") return true;
    if (dateFrom && sortKey < dateFrom) return false;
    if (dateTo && sortKey > dateTo) return false;
    return true;
  });
}

/**
 * Normalise a field that may be stored as a string or an array.
 */
export function toArr(v) {
  return Array.isArray(v) ? v : (v ? [v] : []);
}
import { Link } from "react-router-dom";
import { Clock, MapPin, Star, RefreshCw } from "lucide-react";
import AddToCalendarButton from "./AddToCalendarButton";

const DAY_MAP = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 };

function recurringLabel(listing) {
  const t = listing.recurring_type || "weekly";
  const d = listing.recurring_day || "";
  if (t === "daily") return "Daily";
  if (t === "weekly") return `Every ${d}`;
  if (t === "fortnightly") return `Every 2nd ${d}`;
  if (t === "monthly_date") return `Monthly on the ${d}${["11","12","13"].includes(d) ? "th" : d.endsWith("1") ? "st" : d.endsWith("2") ? "nd" : d.endsWith("3") ? "rd" : "th"}`;
  if (t === "twice_monthly") return `Twice monthly (${d})`;
  if (t === "monthly_weekday") return `${d} of each month`;
  if (t === "2nd_4th_weekday") return `2nd & 4th ${d}`;
  return d || "Recurring";
}

function nextOccurrence(dayName) {
  const target = DAY_MAP[dayName];
  if (target === undefined) return null;
  const today = new Date();
  const diff = (target - today.getDay() + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next;
}

function next2ndOr4thWeekday(dayName) {
  const target = DAY_MAP[dayName];
  if (target === undefined) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Find all 2nd and 4th occurrences in current and next month
  const candidates = [];
  for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
    const year = today.getFullYear();
    const month = today.getMonth() + monthOffset;
    const d = new Date(year, month, 1);
    const occurrences = [];
    while (d.getMonth() === month % 12 || (month >= 12 && d.getMonth() === month - 12)) {
      if (d.getDay() === target) occurrences.push(new Date(d));
      d.setDate(d.getDate() + 1);
      if (d.getMonth() !== (new Date(year, month, 1)).getMonth()) break;
    }
    if (occurrences[1]) candidates.push(occurrences[1]); // 2nd
    if (occurrences[3]) candidates.push(occurrences[3]); // 4th
  }
  return candidates.find(c => c >= today) || null;
}

function formatTime(t) {
  if (!t) return null;
  // Handle HH:MM 24h format
  const match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const h = parseInt(match[1]);
    const m = match[2];
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 || 12;
    return m === "00" ? `${h12}${ampm}` : `${h12}:${m}${ampm}`;
  }
  return t; // fallback for old free-text values
}


function cleanName(n){ return (n || "").replace(/\s*[—–-]\s*\d{4}-\d{2}-\d{2}\s*$/, "").trim(); }

export default function WhatsOnEventRow({ listing, overrideDate }) {
  let dateObj = overrideDate || null;

  if (!dateObj) {
    if (listing.is_recurring) {
      const t = listing.recurring_type || "weekly";
      const d = listing.recurring_day || "";
      if ((t === "weekly" || t === "fortnightly") && DAY_MAP[d] !== undefined) {
        dateObj = nextOccurrence(d);
      } else if (t === "2nd_4th_weekday" && DAY_MAP[d] !== undefined) {
        dateObj = next2ndOr4thWeekday(d);
      }
      // For other types, leave dateObj null — no single "next" date we can pin down simply
    } else if (listing.event_date) {
      dateObj = new Date(listing.event_date + "T12:00:00");
    }
  }

  const isMultiDay = !listing.is_recurring && listing.event_date && listing.event_date_end && listing.event_date_end > listing.event_date;

  const month = dateObj ? dateObj.toLocaleDateString("en-IE", { month: "short" }).toUpperCase() : null;
  const day = dateObj ? dateObj.getDate() : null;
  const weekday = dateObj ? dateObj.toLocaleDateString("en-IE", { weekday: "short" }) : null;

  const location = listing.address || (listing.town ? `${listing.town}, Co. ${listing.county}` : null);
  const displayTime = formatTime(listing.event_time);

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex items-stretch bg-card rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{ border: '2px solid #E2701B' }}
    >
      {/* Date block */}
      <div className="w-20 shrink-0 flex flex-col items-center justify-center bg-muted/40 border-r py-4 text-center">
        {dateObj ? (
          <>
            <span className="text-xs font-semibold text-muted-foreground tracking-widest">{month}</span>
            <span className="text-3xl font-bold leading-none text-foreground mt-0.5">{day}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{weekday}</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground px-1">Date TBC</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold leading-snug" style={{ color: '#097275' }}>
              {cleanName(listing.name)}
            </h3>
            {listing.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {listing.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
          {displayTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {displayTime}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
          {listing.is_free === true && (
            <span className="border rounded px-2 py-0.5 text-xs border-emerald-300 text-emerald-700 bg-emerald-50">Free</span>
          )}
          {listing.is_free === false && (
            <span className="border rounded px-2 py-0.5 text-xs border-slate-300 text-slate-600 bg-slate-50">Paid</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap mt-2">
          {listing.is_recurring && (
            <span className="flex items-center gap-1 text-xs border rounded-md px-2 py-0.5 text-blue-700 border-blue-200 bg-blue-50 whitespace-nowrap">
              <RefreshCw className="w-3 h-3" />
              {recurringLabel(listing)}
            </span>
          )}
          {isMultiDay && (
            <span className="text-xs border rounded-md px-2 py-0.5 text-purple-700 border-purple-200 bg-purple-50 whitespace-nowrap">
              Multi-day event
            </span>
          )}
          {listing.is_featured && (
            <span className="flex items-center gap-1 text-xs border rounded-md px-2 py-0.5 text-amber-700 border-amber-200 bg-amber-50 whitespace-nowrap">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Featured
            </span>
          )}
          <AddToCalendarButton listing={listing} dateObj={dateObj} size="sm" />
        </div>
      </div>
    </Link>
  );
}
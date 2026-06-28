import { useState, useRef, useEffect } from "react";
import { CalendarPlus, ChevronDown } from "lucide-react";

function buildEventData(listing, dateObj) {
  const pad = (n) => String(n).padStart(2, "0");
  const fmtDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const fmtDateTime = (d, time) => {
    const [h, min] = (time || "12:00").split(":");
    return `${fmtDate(d)}T${pad(parseInt(h))}${pad(parseInt(min))}00`;
  };

  const start = dateObj || (listing.event_date ? new Date(listing.event_date + "T12:00:00") : new Date());
  const hasTime = !!listing.event_time;
  const location = listing.address || (listing.town ? `${listing.town}, Co. ${listing.county}` : "");
  const eventUrl = listing.website || `${window.location.origin}/listing/${listing.id}`;

  let dtStart, dtEnd, dtStartDate, dtEndDate;

  if (hasTime) {
    dtStart = fmtDateTime(start, listing.event_time);
    const endDate = listing.event_date_end ? new Date(listing.event_date_end + "T12:00:00") : start;
    let dtEndRaw = fmtDateTime(endDate, listing.event_time);
    if (dtStart === dtEndRaw) {
      const endTime = new Date(start);
      const [h, m] = listing.event_time.split(":");
      endTime.setHours(parseInt(h) + 2, parseInt(m));
      dtEndRaw = fmtDateTime(endTime, `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}`);
    }
    dtEnd = dtEndRaw;
  } else {
    dtStartDate = fmtDate(start);
    const endDate = listing.event_date_end ? new Date(listing.event_date_end + "T12:00:00") : start;
    const dayAfterEnd = new Date(endDate);
    dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
    dtEndDate = fmtDate(dayAfterEnd);
  }

  return { start, hasTime, dtStart, dtEnd, dtStartDate, dtEndDate, location, eventUrl, fmtDate, fmtDateTime, pad };
}

function addToGoogleCalendar(listing, dateObj) {
  const { start, hasTime, dtStart, dtEnd, dtStartDate, dtEndDate, location, eventUrl } = buildEventData(listing, dateObj);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: listing.name,
    details: (listing.description || "") + (eventUrl ? `\n\n${eventUrl}` : ""),
    location,
  });
  if (hasTime) {
    params.set("dates", `${dtStart}/${dtEnd}`);
  } else {
    params.set("dates", `${dtStartDate}/${dtEndDate}`);
  }
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, "_blank");
}

function addToOutlook(listing, dateObj) {
  const { dtStart, dtEnd, dtStartDate, dtEndDate, hasTime, location, eventUrl } = buildEventData(listing, dateObj);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: listing.name,
    body: (listing.description || "") + (eventUrl ? `\n\n${eventUrl}` : ""),
    location,
    startdt: hasTime ? dtStart : dtStartDate,
    enddt: hasTime ? dtEnd : dtEndDate,
    allday: hasTime ? "false" : "true",
  });
  window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`, "_blank");
}

function downloadIcs(listing, dateObj) {
  const { start, hasTime, dtStart, dtEnd, dtStartDate, dtEndDate, location, eventUrl, fmtDate, fmtDateTime, pad } = buildEventData(listing, dateObj);
  const now = new Date();
  const uid = `${listing.id}-${fmtDate(start)}@h4c`;
  const dtstamp = fmtDateTime(now, `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`) + "Z";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//H4C//Events//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTAMP:${dtstamp}`, `SUMMARY:${listing.name}`,
  ];
  if (hasTime) {
    lines.push(`DTSTART:${dtStart}`, `DTEND:${dtEnd}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${dtStartDate}`, `DTEND;VALUE=DATE:${dtEndDate}`);
  }
  if (listing.description) lines.push(`DESCRIPTION:${listing.description.replace(/[\r\n]+/g, " ")}`);
  if (location) lines.push(`LOCATION:${location}`);
  lines.push(`URL:${eventUrl}`, "END:VEVENT", "END:VCALENDAR");

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${listing.name.replace(/[^a-z0-9]/gi, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const OPTIONS = [
  { label: "Google Calendar", action: addToGoogleCalendar },
  { label: "iCal / Apple Calendar", action: downloadIcs },
  { label: "Outlook", action: addToOutlook },
];

export default function AddToCalendarButton({ listing, dateObj, size = "sm" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  };

  const handleOption = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action(listing, dateObj);
    setOpen(false);
  };

  const isSmall = size === "sm";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 border rounded-md transition-colors whitespace-nowrap
          text-primary border-primary/30 bg-primary/5 hover:bg-primary/10
          ${isSmall ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1.5"}`}
      >
        <CalendarPlus className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
        Add to Calendar
        <ChevronDown className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} opacity-60`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px]">
          {OPTIONS.map(({ label, action }) => (
            <button
              key={label}
              onClick={(e) => handleOption(e, action)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { Link } from "react-router-dom";
import { Clock, MapPin, Star } from "lucide-react";

export default function WhatsOnEventRow({ listing }) {
  const dateObj = listing.event_date ? new Date(listing.event_date + "T12:00:00") : null;

  const month = dateObj ? dateObj.toLocaleDateString("en-IE", { month: "short" }).toUpperCase() : null;
  const day = dateObj ? dateObj.getDate() : null;
  const weekday = dateObj ? dateObj.toLocaleDateString("en-IE", { weekday: "short" }) : null;

  const location = listing.address || (listing.town ? `${listing.town}, Co. ${listing.county}` : null);

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex items-stretch bg-card border rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
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
          <span className="text-xs text-muted-foreground">TBC</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {listing.name}
            </h3>
            {listing.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {listing.description}
              </p>
            )}
          </div>
          {listing.is_featured && (
            <span className="shrink-0 flex items-center gap-1 text-xs border rounded-md px-2 py-0.5 text-amber-700 border-amber-200 bg-amber-50 whitespace-nowrap">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          {listing.event_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {listing.event_time}
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
      </div>
    </Link>
  );
}
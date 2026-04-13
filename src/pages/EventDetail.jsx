import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  MapPin, Phone, Mail, Globe, ArrowLeft, Calendar, Clock, Star, User, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const DAY_MAP = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 };
function nextOccurrence(dayName) {
  const target = DAY_MAP[dayName];
  if (target === undefined) return null;
  const today = new Date();
  const diff = (target - today.getDay() + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next;
}

function DetailRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
      {content}
    </a>
  );
  return <div className="px-2 -mx-2">{content}</div>;
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Event.filter({ id })
      .then((r) => setEvent(r[0] || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!event) return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-lg text-muted-foreground">Event not found</p>
      <Link to="/directory?type=What's+On">
        <button className="mt-4 text-sm text-primary underline">Back to What's On</button>
      </Link>
    </div>
  );

  let dateDisplay = null;
  if (event.is_recurring && event.recurring_day) {
    const next = nextOccurrence(event.recurring_day);
    if (next) {
      dateDisplay = `Every ${event.recurring_day} · Next: ${next.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" })}`;
    }
  } else if (event.event_date) {
    dateDisplay = new Date(event.event_date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/directory?type=What%27s+On"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to What's On
      </Link>

      <div className="bg-card rounded-xl border overflow-hidden">
        {event.image_url && (
          <div className="h-56 sm:h-72">
            <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              <Calendar className="w-3 h-3 mr-1" />
              What's On
            </Badge>
            {event.is_recurring && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <RefreshCw className="w-3 h-3 mr-1" />
                Recurring
              </Badge>
            )}
            {event.is_featured && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                <Star className="w-3 h-3 mr-1 fill-amber-500" />
                Featured
              </Badge>
            )}
            {event.is_free === true && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Free Entry</Badge>
            )}
            {event.is_free === false && (
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">Paid Entry</Badge>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold">{event.name}</h1>
          {event.category && <p className="text-sm text-muted-foreground mt-1">{event.category}</p>}

          {event.description && (
            <p className="mt-6 text-muted-foreground leading-relaxed">{event.description}</p>
          )}

          {/* Date highlight */}
          {dateDisplay && (
            <div className="flex items-center gap-3 py-3 px-3 bg-amber-50 rounded-lg mt-6 border border-amber-100">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs text-amber-600">{event.is_recurring ? "Recurring Schedule" : "Event Date"}</p>
                <p className="text-sm font-semibold text-amber-800">
                  {dateDisplay}{event.event_time ? ` at ${event.event_time}` : ""}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-1 divide-y">
            <DetailRow icon={MapPin} label="Venue" value={event.address || (event.town ? `${event.town}, Co. ${event.county}` : null)} />
            <DetailRow icon={User} label="Contact" value={event.contact_name} />
            <DetailRow icon={Phone} label="Phone" value={event.phone} href={event.phone ? `tel:${event.phone}` : undefined} />
            <DetailRow icon={Mail} label="Email" value={event.email} href={event.email ? `mailto:${event.email}` : undefined} />
            <DetailRow icon={Globe} label="Website / Tickets" value={event.website} href={event.website} />
          </div>

          {/* Link back to parent listing */}
          {event.parent_listing_id && event.parent_listing_name && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground mb-2">Organised by</p>
              <Link
                to={`/listing/${event.parent_listing_id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {event.parent_listing_name} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
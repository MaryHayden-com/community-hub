import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Loader2, ArrowLeft, Building2, Users, GraduationCap, Calendar } from "lucide-react";
import WhatsOnEventRow from "../components/WhatsOnEventRow";
import ListingListRow from "../components/ListingListRow";
import { Badge } from "@/components/ui/badge";

const typeIcons = {
  "Business": Building2,
  "Club & Group": Users,
  "Education": GraduationCap,
  "What's On": Calendar,
};

export default function TownPage() {
  const { county, town } = useParams();
  const decodedCounty = decodeURIComponent(county);
  const decodedTown = decodeURIComponent(town);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("");

  useEffect(() => {
    // Fetch all county listings, then show those whose town OR area matches
    base44.entities.CommunityListing.filter({ county: decodedCounty }, "-created_date", 1000)
      .then((all) => setListings(all.filter((l) => l.town === decodedTown || l.area === decodedTown)))
      .finally(() => setLoading(false));
  }, [decodedCounty, decodedTown]);

  const types = useMemo(() => {
    const counts = {};
    listings.forEach((l) => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [listings]);

  const filtered = useMemo(() => {
    const base = !activeType ? listings : listings.filter((l) => l.type === activeType);
    return [...base].sort((a, b) => {
      const aIsEvent = a.type === "What's On";
      const bIsEvent = b.type === "What's On";
      // What's On always sorts by date
      if (aIsEvent && bIsEvent) {
        const da = a.event_date || '9999';
        const db = b.event_date || '9999';
        return da.localeCompare(db);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [listings, activeType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to={`/county/${encodeURIComponent(decodedCounty)}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Co. {decodedCounty}
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2" style={{ color: '#097275' }}>
          <MapPin className="w-7 h-7" style={{ color: '#097275' }} />
          {decodedTown}
        </h1>
        <p className="text-muted-foreground mt-1">
          Co. {decodedCounty} · {listings.length} listing{listings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Type Filter */}
       <div className="mb-6">
       {types.length > 1 && (
         <div className="flex flex-wrap gap-2">
           <Badge
             variant={activeType === "" ? "default" : "outline"}
             className="cursor-pointer"
             onClick={() => setActiveType("")}
           >
             All ({listings.length})
           </Badge>
           {types.map(([t, count]) => {
             const Icon = typeIcons[t] || Building2;
             return (
               <Badge
                 key={t}
                 variant={activeType === t ? "default" : "outline"}
                 className="cursor-pointer flex items-center gap-1"
                 onClick={() => setActiveType(activeType === t ? "" : t)}
               >
                 <Icon className="w-3 h-3" />
                 {t} ({count})
               </Badge>
             );
           })}
         </div>
       )}
       </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No listings found</p>
        </div>
      ) : activeType === "What's On" ? (
        <div className="flex flex-col gap-3">
          {filtered.map((l) => (
            <WhatsOnEventRow key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((l) => (
            <ListingListRow key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
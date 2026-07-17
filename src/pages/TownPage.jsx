import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Loader2, ArrowLeft, Building2, Users, GraduationCap, Calendar } from "lucide-react";
import WhatsOnEventRow from "../components/WhatsOnEventRow";
import ListingListRow from "../components/ListingListRow";
import { sortByTypeOrder } from "../utils/typeOrder";
import { expandAndSortEvents } from "../utils/recurringEvents";
import { Badge } from "@/components/ui/badge";
import usePageTitle from "@/hooks/usePageTitle";

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
  usePageTitle(`${decodedTown}, Co. ${decodedCounty}`);

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
    // What's On sorts by next upcoming occurrence (handled by shared helper);
    // recurring events use their next date so the list is truly chronological.
    if (activeType === "What's On") {
      return expandAndSortEvents(base);
    }
    return sortByTypeOrder(base);
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
           <button
             onClick={() => setActiveType("")}
             className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
               activeType === "" 
                 ? "bg-primary text-primary-foreground" 
                 : "bg-secondary text-secondary-foreground hover:bg-accent"
             }`}
           >
             All ({listings.length})
           </button>
           {types.map(([t, count]) => {
             const Icon = typeIcons[t] || Building2;
             return (
               <button
                 key={t}
                 onClick={() => setActiveType(activeType === t ? "" : t)}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                   activeType === t 
                     ? "bg-primary text-primary-foreground" 
                     : "bg-secondary text-secondary-foreground hover:bg-accent"
                 }`}
               >
                 <Icon className="w-3 h-3" />
                 {t} ({count})
               </button>
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
          {filtered.map((entry) => (
            <WhatsOnEventRow key={entry.listing.id} listing={entry.listing} overrideDate={entry.date} />
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
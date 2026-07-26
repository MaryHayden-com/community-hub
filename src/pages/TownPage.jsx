import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Loader2, ArrowLeft, Building2, Users, GraduationCap, Calendar, Search, X } from "lucide-react";
import WhatsOnEventRow from "../components/WhatsOnEventRow";
import ListingListRow from "../components/ListingListRow";
import { sortByTypeOrder } from "../utils/typeOrder";
import { expandAndSortEvents, toArr } from "../utils/recurringEvents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import usePageTitle from "@/hooks/usePageTitle";

const typeIcons = {
  "Business": Building2,
  "Club & Group": Users,
  "Education": GraduationCap,
  "What's On": Calendar,
};

const BATCH_SIZE = 200;
const PAGE_SIZE = 30;

export default function TownPage() {
  const { county, town } = useParams();
  const decodedCounty = decodeURIComponent(county);
  const decodedTown = decodeURIComponent(town);
  const townPath = `/town/${encodeURIComponent(decodedCounty)}/${encodeURIComponent(decodedTown)}`;
  usePageTitle(`${decodedTown}, Co. ${decodedCounty}`, {
    description: `Everything happening in ${decodedTown}, Co. ${decodedCounty}: local businesses, clubs, events and community resources, all in one place.`,
    path: townPath,
    schema: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://hub4community.com/" },
        { "@type": "ListItem", position: 2, name: "Directory", item: "https://hub4community.com/directory" },
        { "@type": "ListItem", position: 3, name: `Co. ${decodedCounty}`, item: `https://hub4community.com/county/${encodeURIComponent(decodedCounty)}` },
        { "@type": "ListItem", position: 4, name: decodedTown, item: `https://hub4community.com${townPath}` },
        {
          "@type": "ListItem",
          position: 5,
          name: `Local businesses, clubs & events in ${decodedTown}, Co. ${decodedCounty}`,
        },
      ],
    },
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Load county listings in batches (removes the 1000-record cap) and filter to this town
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let all = [], skip = 0, hasMore = true, first = true;
      while (hasMore && !cancelled) {
        const batch = await base44.entities.CommunityListing.filter({ county: decodedCounty }, "-created_date", BATCH_SIZE, skip);
        if (cancelled) return;
        const townBatch = batch.filter((l) => l.town === decodedTown || l.area === decodedTown);
        all = all.concat(townBatch);
        hasMore = batch.length === BATCH_SIZE;
        skip += BATCH_SIZE;
        setListings(all);
        if (first && (all.length > 0 || !hasMore)) { setLoading(false); first = false; }
      }
    })();
    return () => { cancelled = true; };
  }, [decodedCounty, decodedTown]);

  // Keyword-filtered set (search across name, description, category) — counts + tabs reflect this
  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((l) =>
      (l.name || "").toLowerCase().includes(q) ||
      (l.description || "").toLowerCase().includes(q) ||
      toArr(l.category).some((c) => (c || "").toLowerCase().includes(q))
    );
  }, [listings, query]);

  const types = useMemo(() => {
    const counts = {};
    matched.forEach((l) => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [matched]);

  const filtered = useMemo(() => {
    const base = !activeType ? matched : matched.filter((l) => l.type === activeType);
    // What's On sorts by next upcoming occurrence (handled by shared helper);
    // recurring events use their next date so the list is truly chronological.
    if (activeType === "What's On") {
      return expandAndSortEvents(base);
    }
    return sortByTypeOrder(base);
  }, [matched, activeType]);

  // Reset paging when filters change
  useEffect(() => { setPage(1); }, [query, activeType]);

  const pagedItems = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = pagedItems.length < filtered.length;

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
          Co. {decodedCounty} · {query ? `${filtered.length} of ${listings.length}` : listings.length} listing{listings.length !== 1 ? "s" : ""}
        </p>
        </div>

        {/* Keyword search */}
        <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search listings in ${decodedTown}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-9 h-11 bg-card"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
              All ({matched.length})
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
          {pagedItems.map((entry) => (
            <WhatsOnEventRow key={entry.listing.id} listing={entry.listing} overrideDate={entry.date} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pagedItems.map((l) => (
            <ListingListRow key={l.id} listing={l} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="gap-2 px-8" onClick={() => setPage(p => p + 1)}>
            Load more listings ({filtered.length - pagedItems.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  MapPin, ChevronRight, Loader2, ArrowLeft,
  Building2, Users, GraduationCap, Calendar, HeartHandshake,
  Search, X, PlusCircle,
} from "lucide-react";
import ViewToggle from "../components/ViewToggle";
import ListingListRow from "../components/ListingListRow";
import ListingCard from "../components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sortByTypeOrder } from "../utils/typeOrder";
import { toArr } from "../utils/recurringEvents";
import SubmitListingForm from "../components/SubmitListingForm";
import usePageTitle from "@/hooks/usePageTitle";

const typeIcons = {
  "Business": Building2,
  "Club & Group": Users,
  "Education": GraduationCap,
  "Community Services": HeartHandshake,
  "What's On": Calendar,
};

const BATCH_SIZE = 200;
const PAGE_SIZE = 24;

export default function CountyPage() {
  const { county } = useParams();
  const decodedCounty = decodeURIComponent(county);
  usePageTitle(`Co. ${decodedCounty}`, {
    description: `Discover businesses, clubs, events and community services across County ${decodedCounty}. Browse by town or search the ${decodedCounty} directory.`,
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [page, setPage] = useState(1);

  // Load all county listings in batches (removes the 1000-record cap; shows first batch fast)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let all = [], skip = 0, hasMore = true, first = true;
      while (hasMore && !cancelled) {
        const batch = await base44.entities.CommunityListing.filter({ county: decodedCounty }, "-created_date", BATCH_SIZE, skip);
        if (cancelled) return;
        all = all.concat(batch);
        hasMore = batch.length === BATCH_SIZE;
        skip += BATCH_SIZE;
        setListings(all);
        if (first) { setLoading(false); first = false; }
      }
    })();
    return () => { cancelled = true; };
  }, [decodedCounty]);

  const towns = useMemo(() => {
    const map = {};
    listings.forEach((l) => {
      if (!l.town) return;
      if (!map[l.town]) map[l.town] = 0;
      map[l.town]++;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [listings]);

  // Keyword search across name, description, category
  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((l) =>
      (l.name || "").toLowerCase().includes(q) ||
      (l.description || "").toLowerCase().includes(q) ||
      toArr(l.category).some((c) => (c || "").toLowerCase().includes(q))
    );
  }, [listings, query]);

  // Type tabs with live counts (reflect the keyword-filtered set)
  const types = useMemo(() => {
    const counts = {};
    matched.forEach((l) => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [matched]);

  const filtered = useMemo(() => {
    const base = !activeType ? matched : matched.filter((l) => l.type === activeType);
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
      <SubmitListingForm open={showSubmitForm} onClose={() => setShowSubmitForm(false)} />

      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2" style={{ color: '#097275' }}>
            <MapPin className="w-7 h-7" style={{ color: '#097275' }} />
            Co. {decodedCounty}
          </h1>
          <p className="text-muted-foreground mt-1">
            {query || activeType
              ? `${filtered.length} of ${listings.length} listing${listings.length !== 1 ? "s" : ""} across ${towns.length} town${towns.length !== 1 ? "s" : ""}`
              : `${listings.length} listing${listings.length !== 1 ? "s" : ""} across ${towns.length} town${towns.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setShowSubmitForm(true)} className="gap-2 shrink-0" style={{ background: '#E2701B', border: 'none' }}>
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Your Listing</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Towns Grid */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#097275' }}>Towns</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {towns.map(([townName, count]) => (
            <Link
              key={townName}
              to={`/town/${encodeURIComponent(decodedCounty)}/${encodeURIComponent(townName)}`}
              className="group flex items-center justify-between bg-card rounded-lg p-3 hover:shadow-md transition-all"
              style={{ border: '2px solid #E2701B' }}
            >
              <div>
                <p className="font-bold text-sm" style={{ color: '#097275' }}>{townName}</p>
                <p className="text-xs text-muted-foreground">{count} listing{count !== 1 ? "s" : ""}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>

      {/* Keyword search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search listings in Co. ${decodedCounty}...`}
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

      {/* Type filter tabs */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {/* All Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold" style={{ color: '#097275' }}>
            All Listings in Co. {decodedCounty}
          </h2>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No listings found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
            <Button className="mt-4 gap-2" style={{ background: '#E2701B', border: 'none' }} onClick={() => setShowSubmitForm(true)}>
              <PlusCircle className="w-4 h-4" /> Add Your Listing
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedItems.map((l) => (
              <ListingCard key={l.id} listing={l} />
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
    </div>
  );
}
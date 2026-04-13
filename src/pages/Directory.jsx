import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IRELAND_COUNTIES, getTownsForCounty } from "../utils/irelandData";
import ListingCard from "../components/ListingCard";
import SearchFilter from "../components/SearchFilter";
import { Loader2 } from "lucide-react";
import ViewToggle from "../components/ViewToggle";
import ListingListRow from "../components/ListingListRow";
import WhatsOnEventRow from "../components/WhatsOnEventRow";

export default function Directory() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [type, setType] = useState(params.get("type") || "");
  const [county, setCounty] = useState(params.get("county") || "");
  const [town, setTown] = useState(params.get("town") || "");
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setType(params.get("type") || "");
    setCounty(params.get("county") || "");
    setTown(params.get("town") || "");
  }, [location.search]);

  useEffect(() => {
    base44.entities.CommunityListing.list("-created_date", 1000)
      .then(setListings)
      .finally(() => setLoading(false));
  }, []);

  const counties = useMemo(() => IRELAND_COUNTIES.map(c => c.county), []);
  const towns = useMemo(() => {
    if (!county) return [];
    const staticTowns = getTownsForCounty(county);
    const listingTowns = listings.filter((l) => l.county === county).map((l) => l.town).filter(Boolean);
    return [...new Set([...staticTowns, ...listingTowns])].sort();
  }, [listings, county]);

  const filtered = useMemo(() => {
    const isWhatsOn = type === "What's On";
    const base = listings.filter((l) => {
      if (type && l.type !== type) return false;
      if (county && l.county !== county) return false;
      if (town && l.town !== town) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          (l.name || "").toLowerCase().includes(s) ||
          (l.description || "").toLowerCase().includes(s) ||
          (l.category || "").toLowerCase().includes(s) ||
          (l.town || "").toLowerCase().includes(s)
        );
      }
      return true;
    });

    if (!isWhatsOn) {
      return base.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    // Expand multi-day events into individual day entries
    const expanded = [];
    base.forEach((l) => {
      if (!l.is_recurring && l.event_date && l.event_date_end && l.event_date_end > l.event_date) {
        const start = new Date(l.event_date + "T12:00:00");
        const end = new Date(l.event_date_end + "T12:00:00");
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          expanded.push({ listing: l, date: new Date(d), sortKey: d.toISOString().slice(0, 10) });
        }
      } else if (l.is_recurring) {
        expanded.push({ listing: l, date: null, sortKey: todayStr });
      } else {
        expanded.push({ listing: l, date: null, sortKey: l.event_date || "9999" });
      }
    });

    expanded.sort((a, b) => {
      const dateComp = a.sortKey.localeCompare(b.sortKey);
      if (dateComp !== 0) return dateComp;
      return (a.listing.event_time || "").localeCompare(b.listing.event_time || "");
    });

    // Filter by date range
    return expanded.filter((entry) => {
      const key = entry.sortKey;
      if (key === "9999") return true; // recurring, always show
      if (dateFrom && key < dateFrom) return false;
      if (dateTo && key > dateTo) return false;
      return true;
    });
  }, [listings, search, type, county, town]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Directory</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <SearchFilter
        search={search} setSearch={setSearch}
        type={type} setType={setType}
        county={county} setCounty={setCounty}
        town={town} setTown={setTown}
        counties={counties} towns={towns}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        todayStr={todayStr}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No listings found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : type === "What's On" ? (
        <div className="flex flex-col gap-3 mt-6">
          {filtered.map((entry, i) => (
            <WhatsOnEventRow
              key={entry.listing.id + (entry.sortKey || i)}
              listing={entry.listing}
              overrideDate={entry.date}
            />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-6">
          {filtered.map((l) => (
            <ListingListRow key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
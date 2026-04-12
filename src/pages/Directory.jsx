import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IRELAND_COUNTIES, getTownsForCounty } from "../utils/irelandData";
import ListingCard from "../components/ListingCard";
import SearchFilter from "../components/SearchFilter";
import { Loader2 } from "lucide-react";
import ViewToggle from "../components/ViewToggle";
import ListingListView from "../components/ListingListView";

export default function Directory() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [type, setType] = useState(params.get("type") || "");
  const [county, setCounty] = useState(params.get("county") || "");
  const [town, setTown] = useState(params.get("town") || "");

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
    return listings.filter((l) => {
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Directory</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <ViewToggle view={view} setView={setView} />
      </div>

      <SearchFilter
        search={search} setSearch={setSearch}
        type={type} setType={setType}
        county={county} setCounty={setCounty}
        town={town} setTown={setTown}
        counties={counties} towns={towns}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No listings found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : view === "list" ? (
        <div className="mt-6"><ListingListView listings={filtered} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
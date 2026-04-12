import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import ViewToggle from "../components/ViewToggle";
import ListingListView from "../components/ListingListView";
import { Button } from "@/components/ui/button";
import ListingCard from "../components/ListingCard";

export default function CountyPage() {
  const { county } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");

  useEffect(() => {
    base44.entities.CommunityListing.filter({ county }, "-created_date", 1000)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [county]);

  const towns = useMemo(() => {
    const map = {};
    listings.forEach((l) => {
      if (!l.town) return;
      if (!map[l.town]) map[l.town] = 0;
      map[l.town]++;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [listings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-7 h-7 text-primary" />
          Co. {decodeURIComponent(county)}
        </h1>
        <p className="text-muted-foreground mt-1">
          {listings.length} listing{listings.length !== 1 ? "s" : ""} across {towns.length} town{towns.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Towns Grid */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-semibold mb-4">Towns</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {towns.map(([townName, count]) => (
            <Link
              key={townName}
              to={`/town/${encodeURIComponent(county)}/${encodeURIComponent(townName)}`}
              className="group flex items-center justify-between bg-card rounded-lg border p-3 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{townName}</p>
                <p className="text-xs text-muted-foreground">{count} listing{count !== 1 ? "s" : ""}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>

      {/* All Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">All Listings in Co. {decodeURIComponent(county)}</h2>
          <ViewToggle view={view} setView={setView} />
        </div>
        {view === "list" ? (
          <ListingListView listings={listings} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
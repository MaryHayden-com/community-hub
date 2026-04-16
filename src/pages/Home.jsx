import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IRELAND_COUNTIES } from "../utils/irelandData";
import { MapPin, Building2, Users, GraduationCap, Calendar, ArrowRight, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountyCard from "../components/CountyCard";
import ListingCard from "../components/ListingCard";

const categories = [
  { type: "Business", label: "Businesses", icon: Building2, desc: "Local shops, services & trades" },
  { type: "Club & Group", label: "Clubs & Groups", icon: Users, desc: "Sports, social & community groups" },
  { type: "Education", label: "Education", icon: GraduationCap, desc: "Schools, colleges & courses" },
  { type: "What's On", label: "What's On", icon: Calendar, desc: "Events, festivals & activities" },
];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CommunityListing.list("-created_date", 500)
      .then(setListings)
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => listings.filter((l) => l.is_featured).slice(0, 6), [listings]);

  const countyData = useMemo(() => {
    // Start with all Irish counties, merge in listing counts
    const map = {};
    listings.forEach((l) => {
      if (!l.county) return;
      if (!map[l.county]) map[l.county] = { count: 0, towns: new Set() };
      map[l.county].count++;
      if (l.town) map[l.county].towns.add(l.town);
    });
    return IRELAND_COUNTIES.map(({ county, towns }) => ({
      county,
      count: map[county]?.count || 0,
      towns: map[county] ? [...map[county].towns].sort() : towns.slice(0, 5),
    })).sort((a, b) => b.count - a.count || a.county.localeCompare(b.county));
  }, [listings]);

  const typeCounts = useMemo(() => {
    const counts = {};
    listings.forEach((l) => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return counts;
  }, [listings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Your town. Your <span className="text-primary">Community</span>.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover the businesses, clubs, schools and events that bring your town's community together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/directory">
              <Button size="lg" className="gap-2 h-12 px-6">
                <Search className="w-4 h-4" />
                Explore Directory
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <span className="font-medium">{listings.length} Listings</span>
            <span>·</span>
            <span className="font-medium">{countyData.length} Counties</span>
            <span>·</span>
            <span className="font-medium">{new Set(listings.map(l => l.town)).size} Towns</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.type}
                to={`/directory?type=${encodeURIComponent(cat.type)}`}
                className="group bg-card rounded-xl border p-4 sm:p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="mt-3 font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{cat.desc}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {typeCounts[cat.type] || 0} listings
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-accent fill-accent" />
                Featured
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Highlighted listings from the community</p>
            </div>
            <Link to="/directory" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Counties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Browse by County</h2>
            <p className="text-sm text-muted-foreground mt-1">Explore what's happening in each county</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countyData.map((cd) => (
            <CountyCard key={cd.county} county={cd.county} count={cd.count} towns={cd.towns} />
          ))}
        </div>
      </section>
    </div>
  );
}
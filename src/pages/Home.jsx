import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IRELAND_COUNTIES } from "../utils/irelandData";
import { MapPin, Building2, Users, GraduationCap, Calendar, ArrowRight, Star, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountyCard from "../components/CountyCard";
import ListingCard from "../components/ListingCard";
import SubmitListingForm from "../components/SubmitListingForm";

const categories = [
  { type: "Business", label: "Businesses", icon: Building2, desc: "Local shops, services & trades" },
  { type: "Club & Group", label: "Clubs & Groups", icon: Users, desc: "Sports, social & community groups" },
  { type: "Education", label: "Education", icon: GraduationCap, desc: "Schools, colleges & courses" },
  { type: "What's On", label: "What's On", icon: Calendar, desc: "Events, festivals & activities" },
];

export default function Home() {
   const [listings, setListings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showSubmitForm, setShowSubmitForm] = useState(false);
   const [userEmail, setUserEmail] = useState(null);

   useEffect(() => {
     Promise.all([
       base44.entities.CommunityListing.list("-created_date", 2000).then(setListings),
       base44.auth.me().then((u) => setUserEmail(u?.email || null)).catch(() => setUserEmail(null)),
     ]).finally(() => setLoading(false));
   }, []);

   useEffect(() => {
     const unsubscribe = base44.entities.CommunityListing.subscribe((event) => {
       if (event.type === 'update') {
         setListings((prev) => prev.map((l) => l.id === event.id ? event.data : l));
       } else if (event.type === 'create') {
         setListings((prev) => [event.data, ...prev]);
       }
     });
     return unsubscribe;
   }, []);

   const ownedListing = useMemo(() => listings.find((l) => l.owner_email === userEmail), [listings, userEmail]);

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
      <SubmitListingForm open={showSubmitForm} onClose={() => setShowSubmitForm(false)} />
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#097275' }}>
        {/* Decorative orange arc top-right */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: '#E2701B' }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10" style={{ background: '#E2701B' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* MH Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28">
              {/* Teal circle base */}
              <div className="absolute inset-0 rounded-full border-4 border-white/30 flex items-center justify-center"
                style={{ background: '#097275' }}>
                {/* Orange half-arc */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-full rounded-l-full"
                  style={{ background: '#E2701B' }} />
                <span className="relative z-10 font-display font-bold text-white text-3xl sm:text-4xl tracking-widest select-none">MH</span>
              </div>
            </div>
          </div>

          <p className="text-white/70 text-sm font-sans uppercase tracking-widest mb-2">Mary Hayden · Business & Operations</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Your Local <span style={{ color: '#E2701B' }}>Community</span>.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Discover the businesses, clubs, schools and events that bring your town's community together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/directory">
              <Button size="lg" className="gap-2 h-12 px-6 text-white font-semibold" style={{ background: '#E2701B', border: 'none' }}>
                <Search className="w-4 h-4" />
                Explore Directory
              </Button>
            </Link>
            {ownedListing ? (
              <Link to={`/dashboard`}>
                <Button size="lg" variant="outline" className="gap-2 h-12 px-6 border-white/50 text-white hover:bg-white/10 bg-transparent">
                  <PlusCircle className="w-4 h-4" />
                  Edit Your Listing
                </Button>
              </Link>
            ) : (
              <Button size="lg" variant="outline" className="gap-2 h-12 px-6 border-white/50 text-white hover:bg-white/10 bg-transparent" onClick={() => setShowSubmitForm(true)}>
                <PlusCircle className="w-4 h-4" />
                Add Your Listing
              </Button>
            )}
          </div>
          <div className="mt-6 flex justify-center gap-6 text-sm text-white/60">
            <span className="font-medium">{listings.length} Listings</span>
            <span>·</span>
            <span className="font-medium">{countyData.length} Counties</span>
            <span>·</span>
            <span className="font-medium">{new Set(listings.map(l => l.town)).size} Towns</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const accent = i % 2 === 0 ? '#097275' : '#E2701B';
            return (
              <Link
                key={cat.type}
                to={`/directory?type=${encodeURIComponent(cat.type)}`}
                className="group bg-card rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300"
                style={{ border: '2px solid #E2701B' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-opacity"
                  style={{ background: '#E2701B22' }}>
                  <Icon className="w-5 h-5" style={{ color: '#097275' }} />
                </div>
                <h3 className="mt-3 font-semibold text-sm sm:text-base" style={{ color: '#097275' }}>
                  {cat.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{cat.desc}</p>
                <p className="text-xs font-medium mt-1" style={{ color: '#E2701B' }}>
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
              <h2 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: '#097275' }}>
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
              <ListingCard key={l.id} listing={l} isOwned={l.owner_email === userEmail} />
            ))}
          </div>
        </section>
      )}

      {/* Counties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: '#097275' }}>Browse by County</h2>
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
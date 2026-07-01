import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Heart, MapPin, Calendar, Building2, Users, GraduationCap, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function SavedListings() {
  usePageTitle("Saved Listings");
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedListing.filter({ user_email: user.email }, "-created_date")
      .then((results) => {
        setSaved(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h1 className="font-display text-2xl font-bold mb-2">Saved Listings</h1>
        <p className="text-muted-foreground mb-4">Log in to view your saved listings</p>
        <Link to="/directory">
          <Button>Browse Directory</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#097275' }}>Saved Listings</h1>
      <p className="text-muted-foreground mb-6">Your bookmarked businesses, clubs, and events</p>

      {saved.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-lg font-medium mb-1">No saved listings yet</p>
          <p className="text-sm text-muted-foreground mb-4">Click the heart icon on any listing to save it here</p>
          <Link to="/directory">
            <Button>Browse Directory</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {saved.map((item) => {
            const config = typeConfig[item.listing_type] || typeConfig["Business"];
            const Icon = config.icon;
            return (
              <Link
                key={item.id}
                to={`/listing/${item.listing_id}`}
                className="flex items-center gap-4 bg-card rounded-xl px-4 py-3 hover:shadow-md transition-all border-2 border-accent group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate" style={{ color: '#097275' }}>{item.listing_name}</p>
                  <p className="text-xs text-muted-foreground">{item.listing_type} · {item.county}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    base44.entities.SavedListing.delete(item.id)
                      .then(() => setSaved((prev) => prev.filter((s) => s.id !== item.id)));
                  }}
                >
                  <Heart className="w-4 h-4 fill-primary text-primary" />
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { Link } from "react-router-dom";
import { MapPin, Star, Building2, Users, GraduationCap, Calendar, ExternalLink, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function ListingListView({ listings }) {
  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {listings.map((listing, i) => {
        const config = typeConfig[listing.type] || typeConfig["Business"];
        const Icon = config.icon;
        return (
          <Link
            key={listing.id}
            to={`/listing/${listing.id}`}
            className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors ${i !== 0 ? "border-t" : ""}`}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{listing.name}</span>
                {listing.is_featured && <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {listing.town}
                  {listing.area && listing.area !== listing.town && ` · ${listing.area}`}
                  , {listing.county}
                </span>
              </div>
              {listing.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">{listing.description}</p>
              )}
            </div>

            {/* Type badge */}
            <div className="shrink-0 hidden sm:block">
              <Badge variant="outline" className={`text-xs ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {listing.type}
              </Badge>
            </div>

            {/* Contact icons */}
            <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
              {listing.phone && <Phone className="w-3.5 h-3.5" />}
              {listing.website && <ExternalLink className="w-3.5 h-3.5" />}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
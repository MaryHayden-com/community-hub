import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, GraduationCap, Calendar, MapPin, Star, Globe, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const typeGradients = {
  "Business": "from-blue-50 to-blue-100",
  "Club & Group": "from-purple-50 to-purple-100",
  "Education": "from-emerald-50 to-emerald-100",
  "What's On": "from-amber-50 to-amber-100",
};

export default function ListingCard({ listing, isOwned }) {
  const config = typeConfig[listing.type] || typeConfig["Business"];
  const Icon = config.icon;
  const gradient = typeGradients[listing.type] || "from-slate-50 to-slate-100";
  const [imgError, setImgError] = useState(false);

    return (
    <Link
      to={`/listing/${listing.id}`}
      className={`group block rounded-xl transition-all duration-300 overflow-hidden hover:shadow-lg ${isOwned ? "bg-emerald-50" : "bg-card"}`}
      style={{ border: `2px solid ${isOwned ? '#6ee7b7' : '#E2701B'}` }}
    >
      <div className="h-36 overflow-hidden relative">
        {listing.image_url && !imgError ? (
          <img
            src={listing.image_url}
            alt={listing.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-10 h-10 text-current opacity-20" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold truncate" style={{ color: '#097275' }}>
                {listing.name}
              </h3>
              {isOwned && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs shrink-0">Yours</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {listing.town}
                {listing.area && listing.area !== listing.town && ` · ${listing.area}`}
                , {listing.county}
              </span>
            </div>
          </div>
          {listing.is_featured && (
            <Star className="w-4 h-4 text-accent shrink-0 fill-accent" />
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={`text-xs ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {listing.type}
          </Badge>
          {listing.type === "What's On" && listing.event_date && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              {new Date(listing.event_date + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}
              {listing.event_time ? ` · ${listing.event_time}` : ''}
            </span>
          )}
        </div>

        {(() => {
          const cats = Array.isArray(listing.category) ? listing.category : (listing.category ? [listing.category] : []);
          if (cats.length === 0) return null;
          return <p className="text-xs text-muted-foreground">{cats.join(" · ")}</p>;
        })()}

        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          {listing.phone && <Phone className="w-3.5 h-3.5 text-muted-foreground" />}
          {listing.email && <Mail className="w-3.5 h-3.5 text-muted-foreground" />}
          {listing.website && (
            <a href={listing.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <Globe className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
            </a>
          )}
          {listing.facebook_url && (
            <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <Facebook className="w-3.5 h-3.5 text-blue-600 hover:opacity-80 transition-opacity" />
            </a>
          )}
          {listing.instagram_url && (
            <a href={listing.instagram_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <Instagram className="w-3.5 h-3.5 text-pink-500 hover:opacity-80 transition-opacity" />
            </a>
          )}
          {listing.linkedin_url && (
            <a href={listing.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <Linkedin className="w-3.5 h-3.5 text-blue-700 hover:opacity-80 transition-opacity" />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
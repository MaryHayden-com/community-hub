import { Link } from "react-router-dom";
import { Building2, Users, GraduationCap, Calendar, MapPin, Star, Globe, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function ListingListRow({ listing }) {
  const config = typeConfig[listing.type] || typeConfig["Business"];
  const Icon = config.icon;

  // Normalise fields that may be stored as a string or an array
  const normalise = (val) => Array.isArray(val) ? val[0] : val || null;
  const group = normalise(listing.subcategory_group);
  const subgroup = normalise(listing.subgroup);
  const category = normalise(listing.category);

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="flex items-center gap-4 bg-card rounded-xl px-4 py-3 hover:shadow-md transition-all group"
      style={{ border: '2px solid #E2701B' }}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center ${config.color}`}>
            <Icon className="w-5 h-5 opacity-60" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Line 1: Name */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm truncate" style={{ color: '#097275' }}>{listing.name}</span>
          {listing.is_featured && <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />}
        </div>
        {/* Line 2: Type (mobile: own line, desktop: inline with Group › Subgroup › Category) */}
        {/* Mobile: Type on its own line */}
        <div className="flex items-center gap-1.5 mt-0.5 md:hidden">
          <Badge variant="outline" className={`text-xs shrink-0 ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />{listing.type}
          </Badge>
        </div>
        {/* Mobile: Group / Subgroup / Category on next line */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap md:hidden">
          {group && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {group}
            </Badge>
          )}
          {subgroup && subgroup !== "All Types" && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {subgroup}
            </Badge>
          )}
          {category && category !== subgroup && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {category}
            </Badge>
          )}
        </div>
        {/* Desktop: all badges inline */}
        <div className="hidden md:flex items-center gap-1.5 mt-0.5 flex-wrap">
          <Badge variant="outline" className={`text-xs shrink-0 ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />{listing.type}
          </Badge>
          {group && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {group}
            </Badge>
          )}
          {subgroup && subgroup !== "All Types" && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {subgroup}
            </Badge>
          )}
          {category && category !== subgroup && (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {category}
            </Badge>
          )}
        </div>
        {/* Line 3: Address */}
        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{listing.town}{listing.area && listing.area !== listing.town ? ` · ${listing.area}` : ""}, {listing.county}</span>
        </div>
        {listing.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{listing.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {listing.phone && <Phone className="w-3.5 h-3.5 text-muted-foreground" />}
        {listing.email && <Mail className="w-3.5 h-3.5 text-muted-foreground" />}
        {listing.website && <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
        {listing.facebook_url && <Facebook className="w-3.5 h-3.5 text-blue-600" />}
        {listing.instagram_url && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
        {listing.linkedin_url && <Linkedin className="w-3.5 h-3.5 text-blue-700" />}
      </div>
    </Link>
  );
}
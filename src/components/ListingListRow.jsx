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
      className="flex items-center gap-4 bg-card rounded-xl px-4 py-3 hover:shadow-md transition-all group border-2 border-accent"
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
          <span className="font-bold text-base sm:text-lg truncate leading-tight" style={{ color: '#097275' }}>{listing.name}</span>
          {listing.is_featured && <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />}
        </div>
        {/* Badges row — shared data */}
        {(() => {
          const hasSub = (group || (subgroup && subgroup !== "All Types") || (category && category !== subgroup));
          const SlateTag = ({ children }) => (
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 shrink-0">
              {children}
            </Badge>
          );
          const TypeTag = () => (
            <Badge variant="outline" className={`text-xs shrink-0 ${config.color}`}>
              <Icon className="w-3 h-3 mr-1" />{listing.type}
            </Badge>
          );
          return (
            <>
              {/* Mobile: Type alone, then sub-badges on next line only if they exist */}
              <div className="flex items-center gap-1.5 mt-0.5 md:hidden">
                <TypeTag />
              </div>
              {hasSub && (
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap md:hidden">
                  {group && <SlateTag>{group}</SlateTag>}
                  {subgroup && subgroup !== "All Types" && <SlateTag>{subgroup}</SlateTag>}
                  {category && category !== subgroup && <SlateTag>{category}</SlateTag>}
                </div>
              )}
              {/* Desktop: all inline */}
              <div className="hidden md:flex items-center gap-1.5 mt-0.5 flex-wrap">
                <TypeTag />
                {group && <SlateTag>{group}</SlateTag>}
                {subgroup && subgroup !== "All Types" && <SlateTag>{subgroup}</SlateTag>}
                {category && category !== subgroup && <SlateTag>{category}</SlateTag>}
              </div>
            </>
          );
        })()}
        {/* Line 3: Address */}
        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{listing.town}{listing.area && listing.area !== listing.town ? ` · ${listing.area}` : ""}, {listing.county}</span>
        </div>
        {(listing.newcomer_status === "just_turn_up" || listing.newcomer_status === "come_and_try" || listing.beginner_friendly || listing.volunteer_needed || listing.facility_available) && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {(listing.newcomer_status === "just_turn_up" || listing.newcomer_status === "come_and_try") && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Open to newcomers</span>
            )}
            {listing.beginner_friendly && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">Beginners</span>
            )}
            {listing.volunteer_needed && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">Volunteers</span>
            )}
            {listing.facility_available && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">Space to hire</span>
            )}
          </div>
        )}
        {listing.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-2">{listing.description}</p>
        )}
        {listing.updated_date && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Updated {new Date(listing.updated_date).toLocaleDateString("en-IE", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>

      {(() => {
        // Contact details and socials are public; the owner can hide individual
        // fields via hidden_fields. Website is always public.
        const hidden = listing.hidden_fields || [];
        const canShow = (f) => !hidden.includes(f);
        const any = (canShow("phone") && listing.phone) || (canShow("email") && listing.email) || listing.website || (canShow("facebook_url") && listing.facebook_url) || (canShow("instagram_url") && listing.instagram_url) || (canShow("linkedin_url") && listing.linkedin_url);
        if (!any) return null;
        return (
          <div className="flex items-center gap-2 shrink-0">
            {canShow("phone") && listing.phone && <Phone className="w-3.5 h-3.5 text-muted-foreground" />}
            {canShow("email") && listing.email && <Mail className="w-3.5 h-3.5 text-muted-foreground" />}
            {listing.website && <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
            {canShow("facebook_url") && listing.facebook_url && <Facebook className="w-3.5 h-3.5 text-blue-600" />}
            {canShow("instagram_url") && listing.instagram_url && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
            {canShow("linkedin_url") && listing.linkedin_url && <Linkedin className="w-3.5 h-3.5 text-blue-700" />}
          </div>
        );
      })()}
    </Link>
  );
}
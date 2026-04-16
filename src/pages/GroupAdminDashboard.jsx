import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Lock, Tag, Building2, Pencil, Eye, Users, GraduationCap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminListingForm from "../components/AdminListingForm";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function matchesTags(listing, tags) {
  if (!tags || tags.length === 0) return true;
  return tags.some((tag) => {
    const [key, value] = tag.split(":").map((s) => s.trim());
    if (key === "county") return listing.county?.toLowerCase() === value?.toLowerCase();
    if (key === "town") return listing.town?.toLowerCase() === value?.toLowerCase();
    if (key === "type") return listing.type?.toLowerCase() === value?.toLowerCase();
    if (key === "category") return listing.category?.toLowerCase() === value?.toLowerCase();
    if (key === "subcategory_group") return listing.subcategory_group?.toLowerCase() === value?.toLowerCase();
    return false;
  });
}

export default function GroupAdminDashboard() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.role === "group_admin") {
        base44.entities.CommunityListing.list("-created_date", 2000)
          .then((all) => setListings(all.filter((l) => matchesTags(l, u.managed_tags))))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const reload = () => {
    base44.entities.CommunityListing.list("-created_date", 2000)
      .then((all) => setListings(all.filter((l) => matchesTags(l, user.managed_tags))));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!user || user.role !== "group_admin") return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground mt-1">This area is for Group Admins only.</p>
      <Link to="/"><Button className="mt-4" variant="outline">Go Home</Button></Link>
    </div>
  );

  const tags = user.managed_tags || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Group Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Managing listings in your assigned area.</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 flex items-center gap-1">
                <Tag className="w-3 h-3" />{t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{listings.length} listing{listings.length !== 1 ? "s" : ""} in your area</p>
      </div>

      {listings.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          <p>No listings match your assigned tags yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {listings.map((listing) => {
            const cfg = typeConfig[listing.type] || typeConfig["Business"];
            const Icon = cfg.icon;
            return (
              <div key={listing.id} className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                      <Icon className="w-3 h-3 mr-1" />{listing.type}
                    </Badge>
                    {listing.is_verified && <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Verified</Badge>}
                    {listing.is_featured && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Featured</Badge>}
                  </div>
                  <p className="font-semibold text-sm mt-0.5 truncate">{listing.name}</p>
                  <p className="text-xs text-muted-foreground">{listing.town}, Co. {listing.county}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link to={`/listing/${listing.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingListing(listing)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingListing && (
        <AdminListingForm
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSave={() => { setEditingListing(null); reload(); }}
        />
      )}
    </div>
  );
}
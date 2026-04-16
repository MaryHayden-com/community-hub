import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Lock, Tag, Search, X, AlertCircle, Clock, CheckCircle2, Building2, Users, GraduationCap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListingDetailPanel from "../components/ListingDetailPanel.jsx";
import ActionDueBadge from "../components/ActionDueBadge";
import { isToday, isPast, parseISO } from "date-fns";
import { ShieldCheck, Star, UserCheck } from "lucide-react";

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
    return false;
  });
}

function getPriority(nextAction) {
  if (!nextAction) return "no_action";
  if (nextAction.is_done) return "done";
  if (!nextAction.due_date) return "no_action";
  const date = parseISO(nextAction.due_date);
  if (isPast(date) && !isToday(date)) return "overdue";
  if (isToday(date)) return "today";
  return "upcoming";
}

const PRIORITY_ORDER = { overdue: 0, today: 1, upcoming: 2, no_action: 3 };

export default function GroupAdminDashboard() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.role === "group_admin") {
        Promise.all([
          base44.entities.CommunityListing.list("-created_date", 2000),
          base44.entities.ListingAction.filter({ is_done: false }),
        ]).then(([all, acts]) => {
          setListings(all.filter((l) => matchesTags(l, u.managed_tags)));
          setActions(acts);
        }).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const reload = () => {
    Promise.all([
      base44.entities.CommunityListing.list("-created_date", 2000),
      base44.entities.ListingAction.filter({ is_done: false }),
    ]).then(([all, acts]) => {
      setListings(all.filter((l) => matchesTags(l, user.managed_tags)));
      setActions(acts);
    });
  };

  const listingsWithActions = useMemo(() => {
    return listings.map((l) => {
      const listingActions = actions.filter((a) => a.listing_id === l.id);
      const next = listingActions
        .filter((a) => !a.is_done)
        .sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        })[0] || null;
      return { ...l, _nextAction: next, _priority: getPriority(next) };
    });
  }, [listings, actions]);

  const filtered = useMemo(() => {
    return listingsWithActions
      .filter((l) => {
        if (filterStatus === "overdue" && l._priority !== "overdue") return false;
        if (filterStatus === "today" && l._priority !== "today") return false;
        if (filterStatus === "no_action" && l._priority !== "no_action") return false;
        if (search) {
          const s = search.toLowerCase();
          return (l.name || "").toLowerCase().includes(s) || (l.town || "").toLowerCase().includes(s);
        }
        return true;
      })
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a._priority] ?? 3;
        const pb = PRIORITY_ORDER[b._priority] ?? 3;
        if (pa !== pb) return pa - pb;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [listingsWithActions, filterStatus, search]);

  const stats = useMemo(() => ({
    overdue: listingsWithActions.filter((l) => l._priority === "overdue").length,
    today: listingsWithActions.filter((l) => l._priority === "today").length,
    no_action: listingsWithActions.filter((l) => l._priority === "no_action").length,
  }), [listingsWithActions]);

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">My Area</h1>
        <p className="text-muted-foreground mt-1">Action stream for your assigned area.</p>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatPill icon={<AlertCircle className="w-4 h-4 text-red-500" />} label="Overdue" value={stats.overdue} color="text-red-600" onClick={() => setFilterStatus("overdue")} />
        <StatPill icon={<Clock className="w-4 h-4 text-amber-500" />} label="Due Today" value={stats.today} color="text-amber-600" onClick={() => setFilterStatus("today")} />
        <StatPill icon={<CheckCircle2 className="w-4 h-4 text-muted-foreground" />} label="No Action" value={stats.no_action} color="text-muted-foreground" onClick={() => setFilterStatus("no_action")} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 bg-card" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9 bg-card text-sm"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="overdue">🔴 Overdue</SelectItem>
            <SelectItem value="today">🟡 Due Today</SelectItem>
            <SelectItem value="no_action">⚪ No Action</SelectItem>
          </SelectContent>
        </Select>
        {(search || filterStatus !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus("all"); }}>
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {listings.length} listings</span>
      </div>

      {/* Stream */}
      <div className="bg-card border rounded-xl overflow-hidden divide-y">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {listings.length === 0 ? "No listings match your assigned tags yet." : "No listings match your filters."}
          </div>
        ) : filtered.map((listing) => {
          const cfg = typeConfig[listing.type] || typeConfig["Business"];
          const TypeIcon = cfg.icon;
          const priority = listing._priority;
          const next = listing._nextAction;
          const isExpanded = expandedId === listing.id;

          const rowBg =
            priority === "overdue" ? "bg-red-50/40 hover:bg-red-50/60" :
            priority === "today" ? "bg-amber-50/40 hover:bg-amber-50/60" :
            "hover:bg-muted/30";

          return (
            <div key={listing.id} className="divide-y">
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${rowBg} ${isExpanded ? "border-l-2 border-primary" : ""}`}
                onClick={() => setExpandedId(isExpanded ? null : listing.id)}
              >
                <div className={`w-1 h-10 rounded-full shrink-0 ${
                  priority === "overdue" ? "bg-red-400" :
                  priority === "today" ? "bg-amber-400" :
                  priority === "upcoming" ? "bg-blue-300" : "bg-muted"
                }`} />

                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{listing.name}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">· {listing.town}, {listing.county}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className={`text-xs py-0 px-1.5 ${cfg.color}`}>
                      <TypeIcon className="w-2.5 h-2.5 mr-0.5" />{listing.type}
                    </Badge>
                    {listing.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    {listing.owner_email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <UserCheck className="w-3 h-3" />{listing.owner_email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right min-w-[120px] hidden sm:block">
                  {next ? (
                    <div className="flex flex-col items-end gap-1">
                      <ActionDueBadge dueDate={next.due_date} isDone={next.is_done} />
                      <span className="text-xs text-muted-foreground truncate max-w-[110px]">{next.note || next.action_type}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No next action</span>
                  )}
                </div>
              </div>

              {isExpanded && (
                <ListingDetailPanel
                  listing={listing}
                  currentUser={user}
                  onClose={() => setExpandedId(null)}
                  onListingUpdated={() => { setExpandedId(null); reload(); }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all text-left w-full"
    >
      {icon}
      <div>
        <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </button>
  );
}
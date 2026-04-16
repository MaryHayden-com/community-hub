import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, X, ShieldCheck, Star, UserCheck, Building2, Users, GraduationCap, Calendar, AlertCircle, Clock, CheckCircle2, CheckSquare, Square } from "lucide-react";
import ListingDetailPanel from "./ListingDetailPanel";
import ActionDueBadge from "./ActionDueBadge";
import { isToday, isPast, parseISO } from "date-fns";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const PRIORITY_ORDER = { overdue: 0, today: 1, upcoming: 2, no_action: 3, done: 4 };

function getListingPriority(nextAction) {
  if (!nextAction) return "no_action";
  if (nextAction.is_done) return "no_action";
  if (!nextAction.due_date) return "no_action";
  const date = parseISO(nextAction.due_date);
  if (isPast(date) && !isToday(date)) return "overdue";
  if (isToday(date)) return "today";
  return "upcoming";
}

export default function AdminActionStream({ listings, onListingUpdated, currentUser }) {
  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const loadActions = () => {
    setLoadingActions(true);
    base44.entities.ListingAction.filter({ is_done: false })
      .then(setActions)
      .finally(() => setLoadingActions(false));
  };

  useEffect(() => { loadActions(); }, []);

  const listingsWithActions = useMemo(() => {
    return listings
      .filter((l) => l.type !== "What's On")
      .map((l) => {
        const listingActions = actions.filter((a) => a.listing_id === l.id);
        const next = listingActions
          .filter((a) => !a.is_done)
          .sort((a, b) => {
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
          })[0] || null;
        return { ...l, _nextAction: next, _priority: getListingPriority(next) };
      });
  }, [listings, actions]);

  const allCounties = [...new Set(listings.map((l) => l.county).filter(Boolean))].sort();
  const allTypes = [...new Set(listings.filter(l => l.type !== "What's On").map((l) => l.type).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    return listingsWithActions
      .filter((l) => {
        if (filterCounty && l.county !== filterCounty) return false;
        if (filterType && l.type !== filterType) return false;
        if (filterStatus !== "all") {
          if (filterStatus === "overdue" && l._priority !== "overdue") return false;
          if (filterStatus === "today" && l._priority !== "today") return false;
          if (filterStatus === "no_action" && l._priority !== "no_action") return false;
          if (filterStatus === "verified" && !l.is_verified) return false;
          if (filterStatus === "unverified" && l.is_verified) return false;
          if (filterStatus === "unclaimed" && l.owner_email) return false;
          if (filterStatus === "claimed" && !l.owner_email) return false;
        }
        if (search) {
          const s = search.toLowerCase();
          return (
            (l.name || "").toLowerCase().includes(s) ||
            (l.town || "").toLowerCase().includes(s) ||
            (l.county || "").toLowerCase().includes(s) ||
            (l.owner_email || "").toLowerCase().includes(s)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a._priority] ?? 3;
        const pb = PRIORITY_ORDER[b._priority] ?? 3;
        if (pa !== pb) return pa - pb;
        if (a._nextAction?.due_date && b._nextAction?.due_date) {
          return new Date(a._nextAction.due_date) - new Date(b._nextAction.due_date);
        }
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [listingsWithActions, filterCounty, filterType, filterStatus, search]);

  const stats = useMemo(() => ({
    overdue: listingsWithActions.filter((l) => l._priority === "overdue").length,
    today: listingsWithActions.filter((l) => l._priority === "today").length,
    no_action: listingsWithActions.filter((l) => l._priority === "no_action").length,
    total: listingsWithActions.length,
  }), [listingsWithActions]);

  if (loadingActions) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={<AlertCircle className="w-4 h-4 text-red-500" />} label="Overdue" value={stats.overdue} color="text-red-600" onClick={() => setFilterStatus("overdue")} active={filterStatus === "overdue"} />
        <StatPill icon={<Clock className="w-4 h-4 text-amber-500" />} label="Due Today" value={stats.today} color="text-amber-600" onClick={() => setFilterStatus("today")} active={filterStatus === "today"} />
        <StatPill icon={<CheckCircle2 className="w-4 h-4 text-muted-foreground" />} label="No Action" value={stats.no_action} color="text-muted-foreground" onClick={() => setFilterStatus("no_action")} active={filterStatus === "no_action"} />
        <StatPill icon={<Building2 className="w-4 h-4 text-primary" />} label="Total" value={stats.total} color="text-primary" onClick={() => setFilterStatus("all")} active={filterStatus === "all"} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 bg-card" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9 bg-card text-sm"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="overdue">🔴 Overdue</SelectItem>
            <SelectItem value="today">🟡 Due Today</SelectItem>
            <SelectItem value="no_action">⚪ No Action</SelectItem>
            <SelectItem value="unclaimed">Unclaimed</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCounty} onValueChange={(v) => setFilterCounty(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-36 h-9 bg-card text-sm"><SelectValue placeholder="All Counties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Counties</SelectItem>
            {allCounties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => setFilterType(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-36 h-9 bg-card text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            {allTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || filterCounty || filterType || filterStatus !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterCounty(""); setFilterType(""); setFilterStatus("all"); }}>
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} listings</span>
        <Button
          variant={selectMode ? "secondary" : "outline"}
          size="sm"
          onClick={() => { setSelectMode(!selectMode); setSelectedIds([]); }}
        >
          <CheckSquare className="w-4 h-4 mr-1" />
          {selectMode ? "Cancel" : "Select"}
        </Button>
      </div>

      {/* Bulk action bar */}
      {selectMode && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={async () => {
              for (const id of selectedIds) {
                const listing = listings.find(l => l.id === id);
                if (listing) await base44.entities.CommunityListing.update(id, { is_verified: true });
              }
              onListingUpdated?.();
              setSelectedIds([]);
            }}>
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Verify All
            </Button>
            <Button size="sm" variant="outline" onClick={async () => {
              for (const id of selectedIds) {
                await base44.entities.ListingAction.create({ listing_id: id, listing_name: listings.find(l => l.id === id)?.name || "", action_type: "follow_up", note: "Bulk follow-up", due_date: new Date().toISOString().split("T")[0] });
              }
              loadActions();
              setSelectedIds([]);
            }}>
              <Clock className="w-4 h-4 mr-1 text-amber-600" /> Add Follow-Up
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
      )}

      {/* Stream list */}
      <div className="bg-card border rounded-xl overflow-hidden divide-y">
        {selectMode && filtered.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/40 border-b">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={selectedIds.length === filtered.length}
              onChange={() => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(l => l.id))}
            />
            <span className="text-xs text-muted-foreground">Select all ({filtered.length})</span>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">No listings match your filters</div>
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
              {/* Row */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${rowBg} ${isExpanded ? "border-l-2 border-primary" : ""}`}
                onClick={() => {
                  if (selectMode) {
                    setSelectedIds(prev => prev.includes(listing.id) ? prev.filter(id => id !== listing.id) : [...prev, listing.id]);
                  } else {
                    setExpandedId(isExpanded ? null : listing.id);
                  }
                }}
              >
                {/* Checkbox (select mode) */}
                {selectMode && (
                  <input
                    type="checkbox"
                    className="cursor-pointer shrink-0"
                    checked={selectedIds.includes(listing.id)}
                    onChange={() => {}}
                  />
                )}
                {/* Priority stripe */}
                <div className={`w-1 h-10 rounded-full shrink-0 ${
                  priority === "overdue" ? "bg-red-400" :
                  priority === "today" ? "bg-amber-400" :
                  priority === "upcoming" ? "bg-blue-300" :
                  "bg-muted"
                }`} />

                {/* Thumbnail */}
                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">{listing.name}</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">· {listing.town}, {listing.county}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="outline" className={`text-xs py-0 px-1.5 ${cfg.color}`}>
                      <TypeIcon className="w-2.5 h-2.5 mr-0.5" />{listing.type}
                    </Badge>
                    {listing.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                    {listing.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    {listing.owner_email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <UserCheck className="w-3 h-3" />{listing.owner_email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Next action */}
                <div className="shrink-0 text-right min-w-[140px] hidden sm:block">
                  {next ? (
                    <div className="flex flex-col items-end gap-1">
                      <ActionDueBadge dueDate={next.due_date} isDone={next.is_done} />
                      <span className="text-xs text-muted-foreground truncate max-w-[130px]">{next.note || next.action_type}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No next action</span>
                  )}
                </div>
              </div>

              {/* Inline expanded panel */}
              {isExpanded && (
                <ListingDetailPanel
                  listing={listing}
                  currentUser={currentUser}
                  onClose={() => setExpandedId(null)}
                  onListingUpdated={() => { onListingUpdated?.(); loadActions(); setExpandedId(null); }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`bg-card border rounded-xl px-4 py-3 flex items-center gap-3 hover:border-primary/40 hover:shadow-sm transition-all text-left w-full ${active ? "border-primary/40 shadow-sm" : ""}`}
    >
      {icon}
      <div>
        <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </button>
  );
}
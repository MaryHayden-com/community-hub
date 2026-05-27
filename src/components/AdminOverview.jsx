import { useMemo } from "react";
import {
  LayoutGrid, Calendar, Flag, CheckCircle2, Clock,
  Plus, FileDown, Inbox, TrendingUp, Star, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

function StatCard({ icon: Icon, label, value, sub, color = "text-primary", bg = "bg-primary/10" }) {
  return (
    <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeading({ children }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{children}</h2>;
}

export default function AdminOverview({ listings, pendingClaimsCount, onAddListing, onAddEvent, onGoToTab, onExport }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const nonEvents = listings.filter(l => l.type !== "What's On");
    const events = listings.filter(l => l.type === "What's On");
    const claimed = listings.filter(l => l.owner_email);
    const featured = listings.filter(l => l.is_featured);
    const verified = listings.filter(l => l.is_verified);

    const upcomingWeek = events.filter(l => {
      if (l.is_recurring) return true;
      return l.event_date && l.event_date >= todayStr && l.event_date <= weekEndStr;
    });
    const upcomingMonth = events.filter(l => {
      if (l.is_recurring) return true;
      return l.event_date && l.event_date >= todayStr && l.event_date <= monthEnd;
    });

    const byType = {};
    nonEvents.forEach(l => { byType[l.type] = (byType[l.type] || 0) + 1; });

    const recentListings = [...listings]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 5);

    return { nonEvents, events, claimed, featured, verified, upcomingWeek, upcomingMonth, byType, recentListings };
  }, [listings]);

  return (
    <div className="space-y-8">

      {/* Quick Actions */}
      <div>
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onAddListing} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
          <Button size="sm" variant="outline" onClick={onAddEvent} className="gap-1.5">
            <Calendar className="w-4 h-4" /> Add Event
          </Button>
          <Button size="sm" variant="outline" onClick={onExport} className="gap-1.5">
            <FileDown className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => onGoToTab("claims")} className="gap-1.5 relative">
            <Inbox className="w-4 h-4" /> Approve Claims
            {pendingClaimsCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                {pendingClaimsCount}
              </span>
            )}
          </Button>

        </div>
      </div>

      {/* Listing Stats */}
      <div>
        <SectionHeading>Listings</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={LayoutGrid} label="Total Listings" value={stats.nonEvents.length} sub="Excluding What's On" />
          <StatCard icon={Flag} label="Claimed" value={stats.claimed.length} sub={`${listings.length - stats.claimed.length} unclaimed`} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={CheckCircle2} label="Verified" value={stats.verified.length} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={Star} label="Featured" value={stats.featured.length} color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* Breakdown by type */}
        {Object.keys(stats.byType).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <button
                key={type}
                onClick={() => onGoToTab("listings")}
                className="flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80 transition-colors"
              >
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{count}</span> {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Breakdown by Type */}
      <div>
        <SectionHeading>Listings by Category</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const subCats = {};
            listings.filter(l => l.type === type).forEach(l => {
              const cats = Array.isArray(l.subcategory_group) ? l.subcategory_group : (l.subcategory_group ? [l.subcategory_group] : []);
              if (cats.length === 0) { subCats["Uncategorised"] = (subCats["Uncategorised"] || 0) + 1; }
              else cats.forEach(c => { subCats[c] = (subCats[c] || 0) + 1; });
            });
            return (
              <div key={type} className="bg-card border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm">{type}</p>
                  <span className="text-2xl font-bold text-primary">{count}</span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(subCats).sort((a, b) => b[1] - a[1]).map(([cat, n]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round((n / count) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-5 text-right font-medium">{n}</span>
                      <span className="text-xs text-muted-foreground w-28 truncate">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Events card */}
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">What's On</p>
              <span className="text-2xl font-bold text-violet-600">{stats.events.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">{stats.upcomingWeek.length} upcoming this week</p>
            <p className="text-xs text-muted-foreground">{stats.upcomingMonth.length} upcoming this month</p>
          </div>
        </div>
      </div>

      {/* Events Stats */}
      <div>
        <SectionHeading>What's On</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Calendar} label="Total Events" value={stats.events.length} sub="All What's On entries" color="text-violet-600" bg="bg-violet-50" />
          <StatCard icon={TrendingUp} label="This Week" value={stats.upcomingWeek.length} sub="Upcoming 7 days + recurring" color="text-primary" bg="bg-primary/10" />
          <StatCard icon={Clock} label="This Month" value={stats.upcomingMonth.length} sub="Upcoming 30 days + recurring" color="text-orange-600" bg="bg-orange-50" />
        </div>
      </div>

      {/* Pending Claims */}
      {pendingClaimsCount > 0 && (
        <div>
          <SectionHeading>Needs Attention</SectionHeading>
          <button
            onClick={() => onGoToTab("claims")}
            className="w-full flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">{pendingClaimsCount} Claim Request{pendingClaimsCount !== 1 ? "s" : ""} Pending</p>
                <p className="text-sm text-amber-700">Review and approve or reject listing claims</p>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700 underline shrink-0">Review →</span>
          </button>
        </div>
      )}

      {/* Recent Additions */}
      <div>
        <SectionHeading>Recently Added</SectionHeading>
        <div className="bg-card border rounded-xl overflow-hidden">
          {stats.recentListings.map((l, i) => (
            <div key={l.id} className={`flex items-center gap-3 px-4 py-3 ${i < stats.recentListings.length - 1 ? "border-b" : ""}`}>
              {l.image_url
                ? <img src={l.image_url} alt={l.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                : <div className="w-8 h-8 rounded-lg bg-primary/10 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.type} · {l.town}, {l.county}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {new Date(l.created_date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
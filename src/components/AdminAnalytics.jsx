import { useMemo, useState } from "react";
import {
  LayoutGrid, Calendar, TrendingUp, TrendingDown, Users, Star,
  CheckCircle2, Flag, Globe, Phone, Mail, Image,
  CreditCard, BarChart2, Activity, Building2, ChevronDown, ChevronUp,
  BadgeCheck, AlertCircle, X, Filter
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── helpers ───────────────────────────────────────────────────────────────

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(y, m - 1, 1).toLocaleDateString("en-IE", { month: "short", year: "2-digit" });
}

function last12MonthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function pct(num, den) {
  if (!den) return "0%";
  return `${Math.round((num / den) * 100)}%`;
}

function delta(curr, prev) {
  if (!prev) return null;
  const diff = curr - prev;
  return { diff, sign: diff >= 0 ? "+" : "", up: diff >= 0 };
}

// ─── sub-components ────────────────────────────────────────────────────────

function Metric({ label, value, sub, icon: Icon, color = "text-primary", bg = "bg-primary/10", badge, trend }) {
  return (
    <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="text-sm font-medium leading-tight">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {trend !== undefined && trend !== null && (
          <p className={`text-xs font-medium mt-1 flex items-center gap-0.5 ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
            {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.sign}{trend.diff} vs prev month
          </p>
        )}
        {badge && (
          <span className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color = "bg-primary" }) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${w}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

function CollapsibleSection({ title, sub, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        className="flex items-center justify-between w-full mb-3 group"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground mt-0.5 text-left">{sub}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && children}
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────

export default function AdminAnalytics({ listings }) {
  const monthKeys = useMemo(() => last12MonthKeys(), []);
  const currentMonthKey = monthKeys[monthKeys.length - 1];
  const prevMonthKey = monthKeys[monthKeys.length - 2];

  // ── Filter state ──
  const [filterCounty, setFilterCounty] = useState("");
  const [filterTown, setFilterTown] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPlan, setFilterPlan] = useState("");

  // ── Derived filter options ──
  const allCounties = useMemo(() =>
    [...new Set(listings.map(l => l.county).filter(Boolean))].sort(), [listings]);

  const allTowns = useMemo(() =>
    [...new Set(
      listings
        .filter(l => !filterCounty || l.county === filterCounty)
        .map(l => l.town)
        .filter(Boolean)
    )].sort(), [listings, filterCounty]);

  const allTypes = useMemo(() =>
    [...new Set(listings.map(l => l.type).filter(Boolean))].sort(), [listings]);

  const hasFilters = filterCounty || filterTown || filterType || filterPlan;

  // ── Apply filters to raw listings ──
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      if (filterCounty && l.county !== filterCounty) return false;
      if (filterTown && l.town !== filterTown) return false;
      if (filterType && l.type !== filterType) return false;
      if (filterPlan && l.plan !== filterPlan) return false;
      return true;
    });
  }, [listings, filterCounty, filterTown, filterType, filterPlan]);

  // ── Analytics computed on filtered set ──
  const analytics = useMemo(() => {
    const nonEvents = filteredListings.filter(l => l.type !== "What's On");
    const events = filteredListings.filter(l => l.type === "What's On");
    const businesses = nonEvents.filter(l => l.type === "Business");
    const clubs = nonEvents.filter(l => l.type === "Club & Group");
    const education = nonEvents.filter(l => l.type === "Education");

    // Growth
    const sortedNonEvents = [...nonEvents].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    let running = 0;
    const monthlyCreated = {};
    sortedNonEvents.forEach(l => {
      const k = monthKey(new Date(l.created_date));
      monthlyCreated[k] = (monthlyCreated[k] || 0) + 1;
    });
    const growthChartData = monthKeys.map(k => {
      running += (monthlyCreated[k] || 0);
      return { month: monthLabel(k), new: monthlyCreated[k] || 0, total: running };
    });

    // Events per month
    const eventsByMonth = {};
    events.forEach(l => {
      const k = monthKey(new Date(l.created_date));
      eventsByMonth[k] = (eventsByMonth[k] || 0) + 1;
    });

    const thisMonthNew = monthlyCreated[currentMonthKey] || 0;
    const lastMonthNew = monthlyCreated[prevMonthKey] || 0;
    const thisMonthEvents = eventsByMonth[currentMonthKey] || 0;
    const lastMonthEvents = eventsByMonth[prevMonthKey] || 0;

    const claimed = nonEvents.filter(l => l.owner_email);
    const verified = nonEvents.filter(l => l.is_verified);
    const featured = filteredListings.filter(l => l.is_featured);

    // Profile completeness
    const fields = ["phone", "email", "description", "image_url", "website", "address"];
    const completenessScores = nonEvents.map(l => {
      return fields.filter(f => l[f] && l[f].toString().trim() !== "").length;
    });
    const avgCompleteness = nonEvents.length
      ? Math.round((completenessScores.reduce((a, b) => a + b, 0) / nonEvents.length / fields.length) * 100)
      : 0;
    const fieldFill = fields.map(f => ({
      field: f,
      count: nonEvents.filter(l => l[f] && l[f].toString().trim() !== "").length
    }));

    // By type / county / town / group
    const byType = {};
    nonEvents.forEach(l => { byType[l.type] = (byType[l.type] || 0) + 1; });

    const byCounty = {};
    nonEvents.forEach(l => { if (l.county) byCounty[l.county] = (byCounty[l.county] || 0) + 1; });
    const topCounties = Object.entries(byCounty).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const byTown = {};
    nonEvents.forEach(l => { if (l.area || l.town) { const k = l.area || l.town; byTown[k] = (byTown[k] || 0) + 1; } });
    const topTowns = Object.entries(byTown).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const activatedTowns = Object.entries(byTown).filter(([, c]) => c >= 20);
    const growingTowns = Object.entries(byTown).filter(([, c]) => c >= 5 && c < 20);

    // Revenue
    const standard = nonEvents.filter(l => l.plan === "standard" && l.plan_status === "active");
    const premium = nonEvents.filter(l => l.plan === "premium" && l.plan_status === "active");
    const paid = [...standard, ...premium];

    // Contact presence
    const withPhone = nonEvents.filter(l => l.phone).length;
    const withEmail = nonEvents.filter(l => l.email).length;
    const withWebsite = nonEvents.filter(l => l.website).length;
    const withSocial = nonEvents.filter(l => l.facebook_url || l.instagram_url || l.linkedin_url).length;
    const withImage = nonEvents.filter(l => l.image_url).length;

    // Groups
    const byGroup = {};
    nonEvents.forEach(l => {
      const gs = Array.isArray(l.subcategory_group) ? l.subcategory_group : [l.subcategory_group].filter(Boolean);
      gs.forEach(g => { byGroup[g] = (byGroup[g] || 0) + 1; });
    });
    const topGroups = Object.entries(byGroup).sort((a, b) => b[1] - a[1]).slice(0, 12);

    return {
      total: nonEvents.length, events: events.length, businesses, clubs, education,
      thisMonthNew, lastMonthNew, thisMonthEvents, lastMonthEvents,
      claimed, verified, featured, avgCompleteness, fieldFill, fields,
      byType, topCounties, topTowns, activatedTowns, growingTowns,
      standard, premium, paid,
      withPhone, withEmail, withWebsite, withSocial, withImage,
      topGroups, growthChartData
    };
  }, [filteredListings, monthKeys, currentMonthKey, prevMonthKey]);

  const newListingTrend = delta(analytics.thisMonthNew, analytics.lastMonthNew);
  const newEventTrend = delta(analytics.thisMonthEvents, analytics.lastMonthEvents);
  const mrrVal = analytics.standard.length * 49 + analytics.premium.length * 99;
  const arrVal = mrrVal * 12;

  const fieldLabels = {
    phone: "Phone", email: "Email", description: "Description",
    image_url: "Image", website: "Website", address: "Address"
  };

  return (
    <div className="space-y-8">

      {/* ── Filter Bar ── */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Filter Analytics</p>
          {hasFilters && (
            <button
              onClick={() => { setFilterCounty(""); setFilterTown(""); setFilterType(""); setFilterPlan(""); }}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1 bg-muted/50 hover:border-primary/40 transition-colors"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterCounty} onValueChange={v => { setFilterCounty(v === "__all__" ? "" : v); setFilterTown(""); }}>
            <SelectTrigger className="w-[150px] h-8 text-xs bg-background">
              <SelectValue placeholder="All Counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Counties</SelectItem>
              {allCounties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterTown} onValueChange={v => setFilterTown(v === "__all__" ? "" : v)} disabled={!filterCounty}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
              <SelectValue placeholder={filterCounty ? "All Towns" : "Select county first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Towns</SelectItem>
              {allTowns.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={v => setFilterType(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {allTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterPlan} onValueChange={v => setFilterPlan(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Plans</SelectItem>
              <SelectItem value="basic">Basic (Free)</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filterCounty && <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">County: {filterCounty}</span>}
            {filterTown && <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">Town: {filterTown}</span>}
            {filterType && <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">Type: {filterType}</span>}
            {filterPlan && <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">Plan: {filterPlan}</span>}
            <span className="text-xs text-muted-foreground ml-1">→ {filteredListings.length} listings</span>
          </div>
        )}
      </div>

      {/* ── 1. Supply ── */}
      <CollapsibleSection title="Supply — Listings" sub="How much content is in the directory">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          <Metric icon={LayoutGrid} label="Total Listings Live" value={analytics.total} sub="Excl. What's On" />
          <Metric icon={Calendar} label="Total Events" value={analytics.events} sub="What's On entries" color="text-violet-600" bg="bg-violet-50" />
          <Metric icon={TrendingUp} label="New This Month" value={analytics.thisMonthNew} sub="Non-event listings" trend={newListingTrend} color="text-emerald-600" bg="bg-emerald-50" />
          <Metric icon={Calendar} label="Events Added" value={analytics.thisMonthEvents} sub="This month" trend={newEventTrend} color="text-violet-600" bg="bg-violet-50" />
          <Metric icon={Flag} label="Claimed" value={analytics.claimed.length} sub={pct(analytics.claimed.length, analytics.total) + " of listings"} color="text-blue-600" bg="bg-blue-50" />
          <Metric icon={CheckCircle2} label="Verified" value={analytics.verified.length} sub={pct(analytics.verified.length, analytics.total) + " verified"} color="text-emerald-600" bg="bg-emerald-50" />
          <Metric icon={Star} label="Featured" value={analytics.featured.length} sub="Highlighted listings" color="text-amber-600" bg="bg-amber-50" />
          <Metric icon={Building2} label="Businesses" value={analytics.businesses.length} sub={`${analytics.clubs.length} clubs · ${analytics.education.length} edu`} />
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm font-semibold mb-4">Listing Growth — Last 12 Months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.growthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} labelStyle={{ fontWeight: 600 }} />
              <Bar dataKey="new" name="New this month" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-4 mt-3">
          <p className="text-sm font-semibold mb-4">Cumulative Total Listings</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={analytics.growthChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="total" name="Total listings" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CollapsibleSection>

      {/* ── 2. Quality ── */}
      <CollapsibleSection title="Quality — Profile Completeness" sub="How well-filled listings are across key fields">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <Metric
            icon={BadgeCheck} label="Avg. Completeness" value={`${analytics.avgCompleteness}%`}
            sub={`Across ${analytics.fields.length} key fields`}
            badge={analytics.avgCompleteness >= 70 ? { label: "Good", color: "bg-emerald-100 text-emerald-700" } : analytics.avgCompleteness >= 40 ? { label: "Fair", color: "bg-amber-100 text-amber-700" } : { label: "Needs work", color: "bg-red-100 text-red-600" }}
            color="text-primary" bg="bg-primary/10"
          />
          <Metric icon={Image} label="Has Image" value={analytics.withImage} sub={pct(analytics.withImage, analytics.total)} color="text-pink-600" bg="bg-pink-50" />
          <Metric icon={Globe} label="Has Website" value={analytics.withWebsite} sub={pct(analytics.withWebsite, analytics.total)} color="text-blue-600" bg="bg-blue-50" />
          <Metric icon={Phone} label="Has Phone" value={analytics.withPhone} sub={pct(analytics.withPhone, analytics.total)} color="text-green-600" bg="bg-green-50" />
          <Metric icon={Mail} label="Has Email" value={analytics.withEmail} sub={pct(analytics.withEmail, analytics.total)} color="text-orange-600" bg="bg-orange-50" />
          <Metric icon={Activity} label="Has Social" value={analytics.withSocial} sub={pct(analytics.withSocial, analytics.total)} color="text-purple-600" bg="bg-purple-50" />
        </div>

        <div className="bg-card border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold mb-2">Field Fill Rate</p>
          {analytics.fieldFill.map(({ field, count }) => (
            <ProgressBar
              key={field}
              label={fieldLabels[field] || field}
              value={count}
              max={analytics.total}
              color={analytics.total && count / analytics.total >= 0.7 ? "bg-emerald-500" : analytics.total && count / analytics.total >= 0.4 ? "bg-amber-400" : "bg-red-400"}
            />
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">Listings Missing Key Data</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {analytics.fieldFill.map(({ field, count }) => {
              const missing = analytics.total - count;
              if (!missing) return null;
              return (
                <div key={field} className="text-amber-800">
                  <span className="font-bold">{missing}</span> missing {fieldLabels[field] || field}
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 3. Geographic ── */}
      <CollapsibleSection title="Geographic Reach" sub="Coverage by county and town">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">Top Counties</p>
            <div className="space-y-2">
              {analytics.topCounties.length === 0
                ? <p className="text-xs text-muted-foreground">No data for this filter</p>
                : analytics.topCounties.map(([county, count]) => (
                  <ProgressBar key={county} label={county} value={count} max={analytics.topCounties[0]?.[1] || 1} />
                ))}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">Top Towns / Areas</p>
            <div className="space-y-2">
              {analytics.topTowns.length === 0
                ? <p className="text-xs text-muted-foreground">No data for this filter</p>
                : analytics.topTowns.map(([town, count]) => (
                  <ProgressBar key={town} label={town} value={count} max={analytics.topTowns[0]?.[1] || 1} color="bg-accent" />
                ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-900 mb-1">✅ Activated Towns <span className="text-xs font-normal">(20+ listings)</span></p>
            {analytics.activatedTowns.length === 0
              ? <p className="text-xs text-emerald-700">None yet</p>
              : <div className="flex flex-wrap gap-1.5 mt-1">
                  {analytics.activatedTowns.map(([t, c]) => (
                    <span key={t} className="text-xs bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 font-medium">{t} ({c})</span>
                  ))}
                </div>
            }
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-1">🔄 Growing Towns <span className="text-xs font-normal">(5–19 listings)</span></p>
            {analytics.growingTowns.length === 0
              ? <p className="text-xs text-amber-700">No towns in this range</p>
              : <div className="flex flex-wrap gap-1.5 mt-1">
                  {analytics.growingTowns.map(([t, c]) => (
                    <span key={t} className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-medium">{t} ({c})</span>
                  ))}
                </div>
            }
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 4. Category ── */}
      <CollapsibleSection title="Category Breakdown" sub="Listings by type and group">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">By Type</p>
            <div className="space-y-2">
              {Object.entries(analytics.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <ProgressBar key={type} label={type} value={count} max={analytics.total} color="bg-primary" />
              ))}
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">Top Groups</p>
            <div className="space-y-2">
              {analytics.topGroups.map(([group, count]) => (
                <ProgressBar key={group} label={group} value={count} max={analytics.topGroups[0]?.[1] || 1} color="bg-accent" />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 5. Ownership ── */}
      <CollapsibleSection title="Ownership & Retention" sub="Self-managed listings and engagement signals">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric icon={Flag} label="Claimed" value={analytics.claimed.length} sub={pct(analytics.claimed.length, analytics.total) + " claimed"} color="text-blue-600" bg="bg-blue-50" />
          <Metric icon={Users} label="Unclaimed" value={analytics.total - analytics.claimed.length} sub="No owner yet" color="text-muted-foreground" bg="bg-muted" />
          <Metric icon={CheckCircle2} label="Verified" value={analytics.verified.length} sub={pct(analytics.verified.length, analytics.total) + " verified"} color="text-emerald-600" bg="bg-emerald-50" />
          <Metric icon={Star} label="Featured" value={analytics.featured.length} sub={pct(analytics.featured.length, analytics.total) + " featured"} color="text-amber-600" bg="bg-amber-50" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-2">Claimed Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600">{pct(analytics.claimed.length, analytics.total)}</span>
              <span className="text-sm text-muted-foreground mb-0.5">have an owner</span>
            </div>
            <div className="mt-2 bg-muted rounded-full h-3 overflow-hidden">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: pct(analytics.claimed.length, analytics.total) }} />
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-2">Verification Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-emerald-600">{pct(analytics.verified.length, analytics.total)}</span>
              <span className="text-sm text-muted-foreground mb-0.5">verified</span>
            </div>
            <div className="mt-2 bg-muted rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: pct(analytics.verified.length, analytics.total) }} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── 6. Revenue ── */}
      <CollapsibleSection title="Revenue" sub="Subscription and plan metrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric icon={CreditCard} label="MRR" value={`€${mrrVal}`} sub="Monthly recurring" color="text-emerald-600" bg="bg-emerald-50" />
          <Metric icon={TrendingUp} label="ARR" value={`€${arrVal}`} sub="Annualised run rate" color="text-primary" bg="bg-primary/10" />
          <Metric icon={Star} label="Standard Plans" value={analytics.standard.length} sub="€49/yr each" color="text-blue-600" bg="bg-blue-50" />
          <Metric icon={BarChart2} label="Premium Plans" value={analytics.premium.length} sub="€99/yr each" color="text-purple-600" bg="bg-purple-50" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-1">Paid Listings</p>
            <p className="text-2xl font-bold">{analytics.paid.length}</p>
            <p className="text-xs text-muted-foreground">{pct(analytics.paid.length, analytics.total)} of listings</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-1">Free → Paid Rate</p>
            <p className="text-2xl font-bold">{pct(analytics.paid.length, analytics.total)}</p>
            <p className="text-xs text-muted-foreground">{analytics.total - analytics.paid.length} on free plan</p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <p className="text-sm font-semibold mb-1">Avg Revenue / Paid</p>
            <p className="text-2xl font-bold">
              {analytics.paid.length ? `€${Math.round((analytics.standard.length * 49 + analytics.premium.length * 99) / analytics.paid.length)}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Per paid listing per year</p>
          </div>
        </div>
        {analytics.paid.length === 0 && (
          <div className="bg-muted/50 border rounded-xl p-4 mt-3 text-center text-sm text-muted-foreground">
            No paid plans yet — revenue metrics will populate once listings upgrade.
          </div>
        )}
      </CollapsibleSection>

    </div>
  );
}
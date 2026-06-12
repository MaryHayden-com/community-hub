import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, Phone, Globe, Mail, Facebook, Instagram, Linkedin, Loader2, TrendingUp, Award, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const EVENT_ICONS = {
  view: Eye,
  phone_click: Phone,
  website_click: Globe,
  email_click: Mail,
  facebook_click: Facebook,
  instagram_click: Instagram,
  linkedin_click: Linkedin,
};

const EVENT_LABELS = {
  view: "Views",
  phone_click: "Phone",
  website_click: "Website",
  email_click: "Email",
  facebook_click: "Facebook",
  instagram_click: "Instagram",
  linkedin_click: "LinkedIn",
};

const EVENT_COLORS = {
  view: "text-blue-600",
  phone_click: "text-green-600",
  website_click: "text-violet-600",
  email_click: "text-orange-600",
  facebook_click: "text-sky-600",
  instagram_click: "text-pink-600",
  linkedin_click: "text-blue-800",
};

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(y, m - 1, 1).toLocaleDateString("en-IE", { month: "short", year: "2-digit" });
}

function last6MonthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d.toISOString()));
  }
  return keys;
}

export default function AdminEngagementReport({ listings }) {
  const [engagement, setEngagement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    base44.entities.ListingEngagement.list("-created_date", 5000)
      .then(setEngagement)
      .finally(() => setLoading(false));
  }, []);

  const monthKeys = useMemo(() => last6MonthKeys(), []);

  const monthOptions = useMemo(() => [
    { value: "all", label: "All Time" },
    ...monthKeys.map(k => ({ value: k, label: monthLabel(k) })).reverse(),
  ], [monthKeys]);

  // Filter engagement by selected month
  const filtered = useMemo(() => {
    if (selectedMonth === "all") return engagement;
    return engagement.filter(e => monthKey(e.created_date) === selectedMonth);
  }, [engagement, selectedMonth]);

  // Build per-listing stats
  const listingStats = useMemo(() => {
    const map = {};
    filtered.forEach(e => {
      if (!map[e.listing_id]) map[e.listing_id] = { total: 0 };
      map[e.listing_id].total++;
      map[e.listing_id][e.event_type] = (map[e.listing_id][e.event_type] || 0) + 1;
    });

    return Object.entries(map)
      .map(([id, stats]) => {
        const listing = listings.find(l => l.id === id);
        return { id, name: listing?.name || "Unknown Listing", town: listing?.town, county: listing?.county, type: listing?.type, image_url: listing?.image_url, ...stats };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  }, [filtered, listings]);

  // Monthly trend for top 5 listings
  const trendData = useMemo(() => {
    const top5 = listingStats.slice(0, 5).map(l => l.id);
    return monthKeys.map(mk => {
      const row = { month: monthLabel(mk) };
      top5.forEach(id => {
        const name = listings.find(l => l.id === id)?.name || id;
        row[name] = engagement.filter(e => e.listing_id === id && monthKey(e.created_date) === mk).length;
      });
      return row;
    });
  }, [engagement, listingStats, monthKeys, listings]);

  const top5Names = listingStats.slice(0, 5).map(l => l.name);
  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#8b5cf6", "#10b981", "#f59e0b"];

  // Summary totals
  const totalViews = filtered.filter(e => e.event_type === "view").length;
  const totalClicks = filtered.filter(e => e.event_type !== "view").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (engagement.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No engagement data yet</p>
        <p className="text-sm mt-1">Engagement is tracked when users view or interact with listings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header + filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-lg">Engagement Report</h2>
          <p className="text-sm text-muted-foreground">Which listings are getting the most views and clicks</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Profile Views</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalClicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold">{listingStats.length}</p>
            <p className="text-xs text-muted-foreground">Active Listings</p>
          </div>
        </div>
      </div>

      {/* Monthly trend chart */}
      {top5Names.length > 0 && selectedMonth === "all" && (
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm font-semibold mb-4">Top 5 Listings — Monthly Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              {top5Names.map((name, i) => (
                <Bar key={name} dataKey={name} stackId="a" fill={COLORS[i]} radius={i === top5Names.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3">
            {top5Names.map((name, i) => (
              <div key={name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i] }} />
                <span className="truncate max-w-[120px]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top listings table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <p className="text-sm font-semibold">Top Listings by Engagement</p>
        </div>
        <div className="divide-y">
          {listingStats.map((l, idx) => (
            <div key={l.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
              {/* Rank */}
              <span className={`text-sm font-bold w-6 text-center shrink-0 ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                {idx + 1}
              </span>
              {/* Image */}
              {l.image_url
                ? <img src={l.image_url} alt={l.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                : <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground text-xs font-bold">{l.name?.[0]}</div>
              }
              {/* Name + location */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{l.name}</p>
                <p className="text-xs text-muted-foreground truncate">{[l.type, l.town, l.county].filter(Boolean).join(" · ")}</p>
              </div>
              {/* Breakdown */}
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {Object.keys(EVENT_LABELS).map(key => {
                  const count = l[key] || 0;
                  if (!count) return null;
                  const Icon = EVENT_ICONS[key];
                  return (
                    <div key={key} className="flex items-center gap-1" title={EVENT_LABELS[key]}>
                      <Icon className={`w-3.5 h-3.5 ${EVENT_COLORS[key]}`} />
                      <span className="text-xs font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
              {/* Total */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-primary">{l.total}</p>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
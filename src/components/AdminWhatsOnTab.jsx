import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit, Trash2, Search, X, ShieldCheck, ShieldOff, RefreshCw, ImagePlus, CheckSquare } from "lucide-react";
import BulkEditBar from "./BulkEditBar";

export default function AdminWhatsOnTab({ listings, loading, onEdit, onDelete, onListingUpdated, onFetchWhatsOn, fetchingWhatsOn }) {
  const [search, setSearch] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [fetchingImageId, setFetchingImageId] = useState(null);
  const [sortKey, setSortKey] = useState("event_date");
  const [sortDir, setSortDir] = useState("asc");

  const whatsOnListings = useMemo(() => listings.filter((l) => l.type === "What's On"), [listings]);

  const allCounties = useMemo(() => [...new Set(whatsOnListings.map((l) => l.county).filter(Boolean))].sort(), [whatsOnListings]);

  const filtered = useMemo(() => {
    return whatsOnListings
      .filter((l) => {
        if (filterCounty && l.county !== filterCounty) return false;
        if (filterFeatured && !l.is_featured) return false;
        if (filterVerified === "verified" && !l.is_verified) return false;
        if (filterVerified === "unverified" && l.is_verified) return false;
        if (search) {
          const s = search.toLowerCase();
          return (
            (l.name || "").toLowerCase().includes(s) ||
            (l.town || "").toLowerCase().includes(s) ||
            (l.description || "").toLowerCase().includes(s)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortKey === "event_date") {
          const av = a.event_date || "9999";
          const bv = b.event_date || "9999";
          return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        const av = (a[sortKey] || "").toLowerCase();
        const bv = (b[sortKey] || "").toLowerCase();
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [whatsOnListings, filterCounty, filterFeatured, filterVerified, search, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleSelect = (l) => setSelectedIds((prev) =>
    prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]
  );

  const handleToggleVerified = async (listing, e) => {
    e.stopPropagation();
    const newVerified = !listing.is_verified;
    try {
      await base44.entities.CommunityListing.update(listing.id, { is_verified: newVerified });
      toast({ title: newVerified ? "Verified" : "Unverified", description: `${listing.name} marked as ${newVerified ? "verified" : "unverified"}.` });
      onListingUpdated();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleFetchSingleImage = async (l, e) => {
    e.stopPropagation();
    const urls = [l.website, l.facebook_url, l.instagram_url].filter(Boolean);
    if (!urls.length) {
      toast({ title: "No URLs", description: "This listing has no website or social links to fetch from." });
      return;
    }
    setFetchingImageId(l.id);
    try {
      const res = await base44.functions.invoke('fetchOgImage', { urls });
      if (res.data?.image_url) {
        await base44.entities.CommunityListing.update(l.id, { image_url: res.data.image_url });
        toast({ title: "Image fetched", description: `Updated image for ${l.name}.` });
        onListingUpdated();
      } else {
        toast({ title: "No image found", description: "Couldn't find an image from the provided URLs." });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFetchingImageId(null);
    }
  };

  const clearFilters = () => { setSearch(""); setFilterCounty(""); setFilterVerified(""); setFilterFeatured(false); };
  const hasFilters = search || filterCounty || filterVerified || filterFeatured;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onEdit({ type: "What's On" })} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
        <Button variant="outline" size="sm" onClick={onFetchWhatsOn} disabled={fetchingWhatsOn}>
          {fetchingWhatsOn ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          {fetchingWhatsOn ? "Fetching…" : "Fetch What's On"}
        </Button>
        <Button
          variant={selectMode ? "secondary" : "outline"}
          size="sm"
          onClick={() => { setSelectMode(!selectMode); setSelectedIds([]); }}
        >
          <CheckSquare className="w-4 h-4 mr-1" />
          {selectMode ? "Cancel Select" : "Select"}
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} events</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Select value={filterCounty} onValueChange={(v) => setFilterCounty(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[150px] bg-card"><SelectValue placeholder="All Counties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Counties</SelectItem>
            {allCounties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterVerified} onValueChange={(v) => setFilterVerified(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[140px] bg-card"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => setFilterFeatured(!filterFeatured)}
          className={`flex items-center gap-1 text-xs border rounded-md px-2 py-1.5 transition-colors ${filterFeatured ? "bg-amber-100 border-amber-400 text-amber-700 font-semibold" : "bg-card text-muted-foreground hover:text-foreground"}`}
        >
          ★ Featured only
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1.5 bg-card hover:border-primary/40 transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Bulk edit bar */}
      {selectMode && selectedIds.length > 0 && (
        <BulkEditBar
          selected={listings.filter((l) => selectedIds.includes(l.id))}
          allListings={listings}
          onDone={() => { setSelectedIds([]); setSelectMode(false); onListingUpdated(); }}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {selectMode && (
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox"
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={() => selectedIds.length === filtered.length ? setSelectedIds([]) : setSelectedIds(filtered.map(l => l.id))}
                        className="cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 w-12 text-left font-medium">Image</th>
                  <th className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-primary" onClick={() => handleSort("name")}>
                    Name {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-muted-foreground/40">↕</span>}
                  </th>
                  <th className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-primary" onClick={() => handleSort("event_date")}>
                    Date / Schedule {sortKey === "event_date" ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-muted-foreground/40">↕</span>}
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-primary" onClick={() => handleSort("county")}>
                    County {sortKey === "county" ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-muted-foreground/40">↕</span>}
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Town</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${selectMode && selectedIds.includes(l.id) ? "bg-primary/10" : ""}`}
                    onClick={() => selectMode ? toggleSelect(l) : onEdit(l)}
                  >
                    {selectMode && (
                      <td className="px-4 py-3 w-10" onClick={(e) => { e.stopPropagation(); toggleSelect(l); }}>
                        <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l)} className="cursor-pointer" />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {l.image_url
                        ? <img src={l.image_url} alt={l.name} className="h-8 w-8 rounded object-cover" />
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{l.name}</span>
                        {l.is_featured && <span className="text-amber-500 text-xs">★</span>}
                        {!l.is_verified && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">Unverified</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {l.is_recurring
                        ? `Every ${l.recurring_day}${l.event_time ? ` at ${l.event_time}` : ""}`
                        : l.event_date
                          ? `${l.event_date}${l.event_date_end && l.event_date_end !== l.event_date ? ` → ${l.event_date_end}` : ""}${l.event_time ? ` at ${l.event_time}` : ""}`
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{Array.isArray(l.category) ? l.category.join(", ") : (l.category || "—")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.county}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.town}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${l.is_verified ? "text-emerald-600" : "text-muted-foreground"}`} onClick={(e) => handleToggleVerified(l, e)} title={l.is_verified ? "Unverify" : "Verify"}>
                          {l.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => handleFetchSingleImage(l, e)} disabled={fetchingImageId === l.id} title="Fetch image">
                          {fetchingImageId === l.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(l)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y">
            {filtered.map((l) => (
              <div
                key={l.id}
                className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${selectMode && selectedIds.includes(l.id) ? "bg-primary/10" : ""}`}
                onClick={() => selectMode ? toggleSelect(l) : onEdit(l)}
              >
                <div className="flex items-start gap-3">
                  {selectMode && (
                    <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l)} className="mt-1 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                  )}
                  {l.image_url && <img src={l.image_url} alt={l.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{l.name}</p>
                      {l.is_featured && <span className="text-amber-500 text-xs">★</span>}
                      {l.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.county} · {l.town}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {l.is_recurring ? `Every ${l.recurring_day}` : (l.event_date || "No date")}
                      {l.event_time ? ` at ${l.event_time}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className={`h-8 w-8 ${l.is_verified ? "text-emerald-600" : "text-muted-foreground"}`} onClick={(e) => handleToggleVerified(l, e)}>
                      {l.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(l)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(l.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No What's On events found</div>
          )}
        </div>
      )}
    </div>
  );
}
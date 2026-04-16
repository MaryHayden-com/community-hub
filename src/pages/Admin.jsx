import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, Plus, Trash2, Edit, Search, LayoutGrid, List, CheckSquare, RefreshCw, Columns3, X, ShieldCheck, ShieldOff, Inbox, Users, Zap, ImagePlus } from "lucide-react";
import AdminActionStream from "../components/AdminActionStream";
import AdminClaimRequests from "../components/AdminClaimRequests";
import AdminOverview from "../components/AdminOverview";
import AdminUsersTab from "../components/AdminUsersTab";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import ImportExport from "../components/ImportExport";
import MergeListingsDialog from "../components/MergeListingsDialog";
import AdminListingForm from "../components/AdminListingForm";
import BulkEditBar from "../components/BulkEditBar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [deleteId, setDeleteId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelected, setMergeSelected] = useState([]);
  const [mergeListings, setMergeListings] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterTown, setFilterTown] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [fetchingWhatsOn, setFetchingWhatsOn] = useState(false);
  const [bulkFetchingImages, setBulkFetchingImages] = useState(false);
  const [bulkFetchProgress, setBulkFetchProgress] = useState(null);
  const [fetchingImageId, setFetchingImageId] = useState(null);
  const [fetchResult, setFetchResult] = useState(null);
  const [expandingRecurring, setExpandingRecurring] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [triggerImport, setTriggerImport] = useState(false);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState({ image: true, name: true, type: true, subcategory_group: true, category: true, county: true, town: true, area: false, address: false, phone: false, email: false, website: false, contact_name: false, is_featured: false });


  const ALL_COLUMNS = [
    { key: "image", label: "Image" },
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "subcategory_group", label: "Group" },
    { key: "category", label: "Category" },
    { key: "county", label: "County" },
    { key: "town", label: "Townland" },
    { key: "area", label: "Nearest Town" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
    { key: "contact_name", label: "Contact" },
    { key: "is_featured", label: "Featured" },
  ];

  const toggleColumn = (key) => setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleBulkFetchImages = async () => {
    const needsImage = listings.filter((l) => !l.image_url && (l.website || l.facebook_url || l.instagram_url));
    if (!needsImage.length) {
      toast({ title: "Nothing to fetch", description: "All listings with URLs already have images." });
      return;
    }
    setBulkFetchingImages(true);
    setBulkFetchProgress({ done: 0, total: needsImage.length, updated: 0 });
    let updated = 0;
    for (let i = 0; i < needsImage.length; i++) {
      const l = needsImage[i];
      const urls = [l.website, l.facebook_url, l.instagram_url].filter(Boolean);
      try {
        const res = await base44.functions.invoke('fetchOgImage', { urls });
        if (res.data?.image_url) {
          await base44.entities.CommunityListing.update(l.id, { image_url: res.data.image_url });
          updated++;
        }
      } catch {}
      setBulkFetchProgress({ done: i + 1, total: needsImage.length, updated });
    }
    setBulkFetchingImages(false);
    setBulkFetchProgress(null);
    toast({ title: "Bulk image fetch complete", description: `Updated ${updated} of ${needsImage.length} listings.` });
    loadListings();
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
        loadListings();
      } else {
        toast({ title: "No image found", description: "Couldn't find an image from the provided URLs." });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFetchingImageId(null);
    }
  };

  const handleFetchWhatsOn = async () => {
    setFetchingWhatsOn(true);
    setFetchResult(null);
    try {
      const res = await base44.functions.invoke('fetchWhatsOn', {});
      setFetchResult(res.data);
      toast({ title: "What's On Updated", description: `Found ${res.data.found} events, added ${res.data.created} new listings.` });
      loadListings();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFetchingWhatsOn(false);
    }
  };

  const toggleSelect = (l) => {
    setSelectedIds((prev) =>
      prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((l) => l.id));
  };

  const handleMergeSelect = (l) => {
    if (mergeSelected.find((x) => x.id === l.id)) {
      setMergeSelected(mergeSelected.filter((x) => x.id !== l.id));
    } else if (mergeSelected.length < 2) {
      const next = [...mergeSelected, l];
      setMergeSelected(next);
      if (next.length === 2) setMergeListings(next);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };; // "list" or "grid"

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const loadListings = () => {
    setLoading(true);
    base44.entities.CommunityListing.list("-created_date", 2000)
      .then(setListings)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadListings(); }, []);

  useEffect(() => {
    base44.entities.ClaimRequest.filter({ status: "pending" })
      .then((r) => setPendingClaimsCount(r.length))
      .catch(() => {});
  }, []);

  const handleToggleVerified = async (listing, e) => {
    e.stopPropagation();
    await base44.entities.CommunityListing.update(listing.id, { is_verified: !listing.is_verified });
    toast({ title: listing.is_verified ? "Unverified" : "Verified", description: `${listing.name} marked as ${listing.is_verified ? "unverified" : "verified"}.` });
    loadListings();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await base44.entities.CommunityListing.delete(deleteId);
    toast({ title: "Deleted", description: "Listing removed." });
    setDeleteId(null);
    loadListings();
  };

  if (user && user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold">Admin Access Required</h1>
        <p className="text-muted-foreground mt-1">You don't have permission to access this page.</p>
      </div>
    );
  }

  const allTypes = [...new Set(listings.map((l) => l.type).filter(Boolean))].sort();
  const allCounties = [...new Set(listings.map((l) => l.county).filter(Boolean))].sort();
  const allTowns = [...new Set(
    listings.filter((l) => !filterCounty || l.county === filterCounty).map((l) => l.town).filter(Boolean)
  )].sort();

  const filtered = listings
    .filter((l) => {
      if (l.type === "What's On") return false; // excluded from main listings tab
      if (filterType && l.type !== filterType) return false;
      if (filterCounty && l.county !== filterCounty) return false;
      if (filterTown && l.town !== filterTown) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (l.name || "").toLowerCase().includes(s) ||
        (l.town || "").toLowerCase().includes(s) ||
        (l.type || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const filteredWhatsOn = listings
    .filter((l) => {
      if (l.type !== "What's On") return false;
      if (filterCounty && l.county !== filterCounty) return false;
      if (filterTown && l.town !== filterTown) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (l.name || "").toLowerCase().includes(s) ||
        (l.town || "").toLowerCase().includes(s) ||
        (l.description || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">{listings.length} total listings</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkFetchImages}
            disabled={bulkFetchingImages}
          >
            {bulkFetchingImages
              ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />{bulkFetchProgress ? `${bulkFetchProgress.done}/${bulkFetchProgress.total}` : "Fetching…"}</>
              : "Bulk Fetch Images"}
          </Button>
        {(activeTab === "listings" || activeTab === "whatson") && activeTab !== "overview" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none h-9"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none h-9"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <Button
                variant={selectMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => { setSelectMode(!selectMode); setSelectedIds([]); }}
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                {selectMode ? "Cancel Select" : "Select"}
              </Button>
            <Button
                variant={mergeMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => { setMergeMode(!mergeMode); setMergeSelected([]); }}
              >
                {mergeMode ? `Select 2 to merge (${mergeSelected.length}/2)` : "Merge Duplicates"}
              </Button>
            {activeTab === "whatson" && <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setExpandingRecurring(true);
                  try {
                    const res = await base44.functions.invoke('expandRecurringEvents', {});
                    toast({ title: "Recurring Events Expanded", description: res.data.message });
                    loadListings();
                  } catch (err) {
                    toast({ title: "Error", description: err.message, variant: "destructive" });
                  } finally {
                    setExpandingRecurring(false);
                  }
                }}
                disabled={expandingRecurring}
              >
                {expandingRecurring ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                {expandingRecurring ? "Expanding…" : "Expand Recurring"}
              </Button>}
            {activeTab === "whatson" && <Button
                variant="outline"
                size="sm"
                onClick={handleFetchWhatsOn}
                disabled={fetchingWhatsOn}
              >
                {fetchingWhatsOn ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                {fetchingWhatsOn ? "Searching…" : "Fetch What's On"}
              </Button>}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="w-4 h-4 mr-1" /> Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Show Columns</p>
                <div className="space-y-1.5">
                  {ALL_COLUMNS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={!!visibleColumns[key]}
                        onChange={() => toggleColumn(key)}
                        className="cursor-pointer"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <ImportExport listings={listings} onImportComplete={loadListings} />
            <Button onClick={() => setEditing({})} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Listing
            </Button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "listings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Listings
        </button>
        <button
          onClick={() => setActiveTab("whatson")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "whatson" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          What's On
        </button>
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "claims" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Claim Requests
          {pendingClaimsCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
              {pendingClaimsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab("stream")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "stream" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="w-4 h-4" />
          Action Stream
        </button>
      </div>

      {activeTab === "overview" && (
        <AdminOverview
          listings={listings}
          pendingClaimsCount={pendingClaimsCount}
          onAddListing={() => { setEditing({}); }}
          onAddEvent={() => { setEditing({ type: "What's On" }); }}
          onGoToTab={(tab) => setActiveTab(tab)}
          onImport={() => setTriggerImport(true)}
        />
      )}

      {activeTab === "claims" && <AdminClaimRequests />}
      {activeTab === "users" && <AdminUsersTab />}
      {activeTab === "stream" && (
        <AdminActionStream
          listings={listings}
          currentUser={user}
          onListingUpdated={loadListings}
        />
      )}

      {activeTab === "listings" && selectMode && selectedIds.length > 0 && (
        <BulkEditBar
          selected={listings.filter((l) => selectedIds.includes(l.id))}
          allListings={listings}
          onDone={() => { setSelectedIds([]); setSelectMode(false); loadListings(); }}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {(activeTab === "listings" || activeTab === "whatson") && <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {activeTab === "listings" && <Select value={filterType} onValueChange={(v) => setFilterType(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-[140px] bg-card">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            {allTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>}

        <Select value={filterCounty} onValueChange={(v) => { setFilterCounty(v === "__all__" ? "" : v); setFilterTown(""); }}>
          <SelectTrigger className="w-[150px] bg-card">
            <SelectValue placeholder="All Counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Counties</SelectItem>
            {allCounties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterTown} onValueChange={(v) => setFilterTown(v === "__all__" ? "" : v)} disabled={!filterCounty}>
          <SelectTrigger className="w-[160px] bg-card">
            <SelectValue placeholder={filterCounty ? "All Towns" : "Select county first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Towns</SelectItem>
            {allTowns.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        {(filterType || filterCounty || filterTown || search) && (
          <button
            onClick={() => { setFilterType(""); setFilterCounty(""); setFilterTown(""); setSearch(""); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1.5 bg-card hover:border-primary/40 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">{activeTab === "whatson" ? filteredWhatsOn.length : filtered.length} results</span>
      </div>}

      {activeTab === "whatson" && (loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-primary" onClick={() => handleSort("name")}>Name {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-muted-foreground/40">↕</span>}</th>
                  <th className="text-left px-4 py-3 font-medium">Date / Schedule</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-primary" onClick={() => handleSort("county")}>County {sortKey === "county" ? (sortDir === "asc" ? "↑" : "↓") : <span className="text-muted-foreground/40">↕</span>}</th>
                  <th className="text-left px-4 py-3 font-medium">Town</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWhatsOn.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setEditing(l)}>
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {l.is_recurring
                        ? `Every ${l.recurring_day}${l.event_time ? ` at ${l.event_time}` : ""}`
                        : l.event_date
                          ? `${l.event_date}${l.event_date_end && l.event_date_end !== l.event_date ? ` → ${l.event_date_end}` : ""}${l.event_time ? ` at ${l.event_time}` : ""}`
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.category || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.county}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.town}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(l)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredWhatsOn.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No What's On events found</div>
          )}
        </div>
      ))}

      {activeTab === "listings" && (loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {selectMode && (
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
                    </th>
                  )}
                  {ALL_COLUMNS.filter(({ key }) => visibleColumns[key]).map(({ key, label }) => (
                    <th key={key} className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-primary transition-colors" onClick={() => handleSort(key)}>
                      <span className="flex items-center gap-1">
                        {label}
                        {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : <span className="text-muted-foreground/40"> ↕</span>}
                      </span>
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                      mergeMode && mergeSelected.find((x) => x.id === l.id) ? "bg-primary/10" : ""
                    } ${
                      selectMode && selectedIds.includes(l.id) ? "bg-primary/10" : ""
                    }`}
                    onClick={() => {
                      if (mergeMode) handleMergeSelect(l);
                      else if (selectMode) toggleSelect(l);
                      else setEditing(l);
                    }}
                  >
                    {selectMode && (
                      <td className="px-4 py-3 w-10" onClick={(e) => { e.stopPropagation(); toggleSelect(l); }}>
                        <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l)} className="cursor-pointer" />
                      </td>
                    )}
                    {ALL_COLUMNS.filter(({ key }) => visibleColumns[key]).map(({ key }) => {
                       let content;
                       if (key === "image") {
                         content = l.image_url ? <img src={l.image_url} alt={l.name} className="h-8 w-8 rounded object-cover" /> : <span className="text-xs text-muted-foreground">—</span>;
                       } else if (key === "name") {
                         content = <span className="font-medium text-foreground">{l.name}</span>;
                       } else if (key === "is_featured") {
                         content = l.is_featured ? "★" : "";
                       } else if (key === "website") {
                         content = l.website ? <a href={l.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>{l.website}</a> : "";
                       } else {
                         content = l[key] || "";
                       }
                       return (
                         <td key={key} className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                           {content}
                         </td>
                       );
                     })}
                     <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon" className={`h-8 w-8 ${l.is_verified ? "text-emerald-600" : "text-muted-foreground"}`}
                          onClick={(e) => handleToggleVerified(l, e)}
                          title={l.is_verified ? "Unverify" : "Mark as Verified"}
                        >
                          {l.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
                          onClick={(e) => handleFetchSingleImage(l, e)}
                          disabled={fetchingImageId === l.id}
                          title="Fetch image from website/social links"
                        >
                          {fetchingImageId === l.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(l)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(l.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No listings found</div>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((l) => (
            <div
              key={l.id}
              className="group bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all"
              onClick={() => setEditing(l)}
            >
              {l.image_url ? (
                <div className="h-36 overflow-hidden">
                  <img src={l.image_url} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary/30" />
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{l.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l.type}</p>
                <p className="text-xs text-muted-foreground">{l.town}, {l.county}</p>
                <div className="flex items-center justify-end gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(l)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(l.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">No listings found</div>
          )}
        </div>
      ))}

      {/* Merge Dialog */}
      {mergeListings && (
        <MergeListingsDialog
          listingA={mergeListings[0]}
          listingB={mergeListings[1]}
          onClose={() => { setMergeListings(null); setMergeSelected([]); setMergeMode(false); }}
          onMerged={() => { setMergeListings(null); setMergeSelected([]); setMergeMode(false); loadListings(); }}
        />
      )}

      {/* Edit / Create Form */}
      {editing !== null && (
        <AdminListingForm
          listing={editing}
          onClose={() => setEditing(null)}
          onSave={() => { setEditing(null); loadListings(); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
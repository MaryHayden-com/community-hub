import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, Plus, Trash2, Edit, Search, LayoutGrid, List, CheckSquare, RefreshCw, Columns3, X, ShieldCheck, ShieldOff, Inbox, Users, Zap, ImagePlus, Clock, CalendarDays, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import AdminActionStream from "../components/AdminActionStream";
import AdminAnalyticsDashboard from "../components/AdminAnalyticsDashboard";
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
import AdminWhatsOnTab from "../components/AdminWhatsOnTab";
import AdminSurveyResults from "../components/AdminSurveyResults";
import AdminEngagementReport from "../components/AdminEngagementReport";
import AdminPendingTab from "../components/AdminPendingTab";
import usePageTitle from "@/hooks/usePageTitle";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function Admin() {
  usePageTitle("Admin Panel");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [deleteId, setDeleteId] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSelected, setMergeSelected] = useState([]);
  const [mergeListings, setMergeListings] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterTown, setFilterTown] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [fetchingWhatsOn, setFetchingWhatsOn] = useState(false);
  const [bulkFetchingImages, setBulkFetchingImages] = useState(false);
  const [bulkFetchProgress, setBulkFetchProgress] = useState(null);
  const [fetchingImageId, setFetchingImageId] = useState(null);
  const [fetchResult, setFetchResult] = useState(null);
  const [expandingRecurring, setExpandingRecurring] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    const valid = ["overview","pending","listings","whatson","claims","stream","users","engagement","analytics","survey"];
    return valid.includes(hash) ? hash : "overview";
  });
  const [triggerImport, setTriggerImport] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const pendingListingsCount = listings.filter(l => l.status === "pending").length;
  const DEFAULT_COLUMNS = { image: true, name: true, type: true, subcategory_group: true, category: true, county: true, town: true, area: false, address: false, phone: false, email: false, website: false, contact_name: false, is_featured: true };
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_columns")) || DEFAULT_COLUMNS; } catch { return DEFAULT_COLUMNS; }
  });


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

  const toggleColumn = (key) => setVisibleColumns((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    localStorage.setItem("admin_columns", JSON.stringify(next));
    return next;
  });

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
      // Small delay to avoid hitting API rate limits
      await new Promise(r => setTimeout(r, 300));
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
  };

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

  const refreshClaimsCount = () => {
    base44.entities.ClaimRequest.filter({ status: "pending" })
      .then((r) => setPendingClaimsCount(r.length))
      .catch(() => {});
  };

  useEffect(() => {
    refreshClaimsCount();
    // Refresh when the tab regains focus (admin may leave and come back)
    const handleFocus = () => refreshClaimsCount();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleToggleVerified = async (listing, e) => {
    e.stopPropagation();
    const newVerified = !listing.is_verified;
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, is_verified: newVerified } : l));
    if (newVerified) { setFlashId(listing.id); setTimeout(() => setFlashId(null), 1000); }
    try {
      await base44.entities.CommunityListing.update(listing.id, { is_verified: newVerified });
    } catch (err) {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, is_verified: listing.is_verified } : l));
      toast({ title: "Error", description: "Failed to update verification status.", variant: "destructive" });
    }
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

  const allTypes = [...new Set(listings.filter(l => l.type !== "What's On").map((l) => l.type).filter(Boolean))].sort();
  const allCounties = [...new Set(listings.map((l) => l.county).filter(Boolean))].sort();
  const allTowns = [...new Set(
    listings.filter((l) => !filterCounty || l.county === filterCounty).map((l) => l.town).filter(Boolean)
  )].sort();

  const filtered = listings
    .filter((l) => {
      if (l.type === "What's On") return false; // What's On has its own tab
      if (filterType && l.type !== filterType) return false;
      if (filterCounty && l.county !== filterCounty) return false;
      if (filterTown && l.town !== filterTown) return false;
      if (filterFeatured && !l.is_featured) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (l.name || "").toLowerCase().includes(s) ||
        (l.town || "").toLowerCase().includes(s) ||
        (l.type || "").toLowerCase().includes(s) ||
        (l.description || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-14 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">{listings.length} total listings</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Always-visible utility buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkFetchImages}
            disabled={bulkFetchingImages}
            title="Bulk fetch images for all listings missing one"
          >
            {bulkFetchingImages
              ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />{bulkFetchProgress ? `${bulkFetchProgress.done}/${bulkFetchProgress.total}` : "Fetching…"}</>
              : <><ImagePlus className="w-4 h-4 mr-1" />Fetch Images</>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchWhatsOn}
            disabled={fetchingWhatsOn}
          >
            {fetchingWhatsOn ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            {fetchingWhatsOn ? "Searching…" : "Fetch What's On"}
          </Button>
          <Button
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
          </Button>

          {/* Listings-tab specific buttons */}
          {activeTab === "listings" && (
            <>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className="rounded-none h-9" onClick={() => setViewMode("list")}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="rounded-none h-9" onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
              <Button variant={selectMode ? "secondary" : "outline"} size="sm" onClick={() => { setSelectMode(!selectMode); setSelectedIds([]); }}>
                <CheckSquare className="w-4 h-4 mr-1" />
                {selectMode ? "Cancel Select" : "Select"}
              </Button>
              <Button variant={mergeMode ? "secondary" : "outline"} size="sm" onClick={() => { setMergeMode(!mergeMode); setMergeSelected([]); }}>
                {mergeMode ? `Select 2 to merge (${mergeSelected.length}/2)` : "Merge Duplicates"}
              </Button>
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
                        <input type="checkbox" checked={!!visibleColumns[key]} onChange={() => toggleColumn(key)} className="cursor-pointer" />
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
            </>
          )}
        </div>
      </div>

      {/* Sticky pending alert bar */}
      {pendingListingsCount > 0 && (
        <div
          onClick={() => setActiveTab("pending")}
          className="flex items-center justify-between px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors mb-4"
        >
          <span className="text-sm font-medium text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending approval
            <span className="bg-amber-400 text-amber-950 text-xs font-semibold rounded-full px-2 py-0.5">
              {pendingListingsCount}
            </span>
          </span>
          <span className="text-xs text-amber-700 font-medium">Review →</span>
        </div>
      )}

      {/* Tab Navigation — desktop only */}
      <div className="hidden sm:flex gap-1 border-b mb-6 overflow-x-auto">
        {[
          { key: "overview", label: "Overview" },
          { key: "pending", label: "Pending Approval", badge: pendingListingsCount, badgeColor: "bg-amber-500 text-white" },
          { key: "listings", label: "Listings" },
          { key: "whatson", label: "🗓️ What's On", badge: listings.filter(l => l.type === "What's On" && !l.is_verified).length, badgeColor: "bg-amber-500 text-white" },
          { key: "claims", label: "Claim Requests", icon: <Inbox className="w-4 h-4" />, badge: pendingClaimsCount, badgeColor: "bg-primary text-primary-foreground" },
          { key: "stream", label: "Action Stream", icon: <Zap className="w-4 h-4" /> },
          { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
          { key: "engagement", label: "📈 Engagement" },
          { key: "analytics", label: "📊 Analytics" },
          { key: "survey", label: "📋 Survey Results" },
        ].map(({ key, label, icon, badge, badgeColor }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {icon}{label}
            {badge > 0 && (
              <span className={`${badgeColor} text-xs rounded-full px-1.5 py-0.5 leading-none`}>{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden bg-background border-t h-14">
        {[
          { key: "overview", icon: <LayoutGrid className="w-5 h-5" />, label: "Overview" },
          { key: "pending", icon: <Clock className="w-5 h-5" />, label: "Pending", badge: pendingListingsCount },
          { key: "listings", icon: <List className="w-5 h-5" />, label: "Listings" },
          { key: "whatson", icon: <CalendarDays className="w-5 h-5" />, label: "Events", badge: listings.filter(l => l.type === "What's On" && !l.is_verified).length },
          { key: "more", icon: <MoreHorizontal className="w-5 h-5" />, label: "More" },
        ].map(({ key, icon, label, badge }) => (
          <button
            key={key}
            onClick={() => key === "more" ? setShowMoreMenu(true) : setActiveTab(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${activeTab === key ? "text-primary" : "text-muted-foreground"}`}
          >
            {icon}
            <span className="text-[10px]">{label}</span>
            {badge > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-14px)] bg-amber-400 text-amber-950 text-[9px] font-semibold rounded-full px-1 min-w-[14px] text-center">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile "More" menu */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setShowMoreMenu(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
            <h3 className="font-medium mb-3">More</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "claims", label: "Claim Requests", badge: pendingClaimsCount },
                { key: "stream", label: "Action Stream" },
                { key: "users", label: "Users" },
                { key: "engagement", label: "Engagement" },
                { key: "analytics", label: "Analytics" },
                { key: "survey", label: "Survey Results" },
              ].map(({ key, label, badge }) => (
                <button key={key} onClick={() => { setActiveTab(key); setShowMoreMenu(false); }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border bg-card text-sm font-medium hover:bg-muted transition-colors">
                  {label}
                  {badge > 0 && <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5">{badge}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <AdminOverview
          listings={listings}
          pendingClaimsCount={pendingClaimsCount}
          onAddListing={() => { setEditing({}); }}
          onAddEvent={() => { setEditing({ type: "What's On" }); }}
          onGoToTab={(tab) => setActiveTab(tab)}
          onImport={() => setTriggerImport(true)}
          onExport={() => {
            const headers = ["Type","Name","Category/Trade Type","County","Town","Description","Address","Phone","Email","Website","Facebook URL","Instagram URL","LinkedIn URL","Contact Name","Meeting Info","Is Featured"];
            const rows = listings.map((l) => [l.type,l.name, Array.isArray(l.category) ? l.category.join(";") : (l.category||""),l.county,l.town,l.description,l.address,l.phone,l.email,l.website,l.facebook_url,l.instagram_url,l.linkedin_url,l.contact_name,l.meeting_info,l.is_featured?"Yes":"No"]);
            const csv = [headers,...rows].map((r)=>r.map((c)=>{const val = Array.isArray(c) ? c.join(";") : (c||""); return `"${String(val).replace(/"/g,'""')}"`}).join(",")).join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
            a.download = `community-hub-export-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
          }}
        />
      )}

      {activeTab === "pending" && (
        <AdminPendingTab
          listings={listings}
          onListingUpdated={loadListings}
          onEdit={setEditing}
        />
      )}

      {activeTab === "whatson" && (
        <AdminWhatsOnTab
          listings={listings}
          loading={loading}
          onEdit={setEditing}
          onDelete={setDeleteId}
          onListingUpdated={loadListings}
          onFetchWhatsOn={handleFetchWhatsOn}
          fetchingWhatsOn={fetchingWhatsOn}
        />
      )}
      {activeTab === "engagement" && <AdminEngagementReport listings={listings} />}
      {activeTab === "analytics" && <AdminAnalyticsDashboard />}
      {activeTab === "survey" && <AdminSurveyResults />}
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

      {activeTab === "listings" && <>
        {/* Mobile: search + filter button */}
        <div className="flex sm:hidden gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card" />
          </div>
          <Button variant="outline" onClick={() => setFilterSheetOpen(true)} className="gap-1.5 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {(filterType || filterCounty || filterFeatured) && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5">{[filterType, filterCounty, filterFeatured].filter(Boolean).length}</span>
            )}
          </Button>
        </div>

        {/* Desktop: full filter row */}
        <div className="hidden sm:flex flex-wrap gap-2 mb-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card" />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-[140px] bg-card"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {allTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCounty} onValueChange={(v) => { setFilterCounty(v === "__all__" ? "" : v); setFilterTown(""); }}>
            <SelectTrigger className="w-[150px] bg-card"><SelectValue placeholder="All Counties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Counties</SelectItem>
              {allCounties.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTown} onValueChange={(v) => setFilterTown(v === "__all__" ? "" : v)} disabled={!filterCounty}>
            <SelectTrigger className="w-[160px] bg-card"><SelectValue placeholder={filterCounty ? "All Towns" : "Select county first"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Towns</SelectItem>
              {allTowns.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <button onClick={() => setFilterFeatured(!filterFeatured)}
            className={`flex items-center gap-1 text-xs border rounded-md px-2 py-1.5 transition-colors ${filterFeatured ? "bg-amber-100 border-amber-400 text-amber-700 font-semibold" : "bg-card text-muted-foreground hover:text-foreground"}`}>
            ★ Featured only
          </button>
          {(filterType || filterCounty || filterTown || search || filterFeatured) && (
            <button onClick={() => { setFilterType(""); setFilterCounty(""); setFilterTown(""); setSearch(""); setFilterFeatured(false); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1.5 bg-card hover:border-primary/40 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
        </div>

        {/* Filter bottom sheet (mobile) */}
        {filterSheetOpen && (
          <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setFilterSheetOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
              <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4" />
              <h3 className="font-medium mb-4">Filter listings</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Type</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {allTypes.map(t => (
                  <button key={t} onClick={() => setFilterType(filterType === t ? "" : t)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${filterType === t ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">County</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {allCounties.map(c => (
                  <button key={c} onClick={() => setFilterCounty(filterCounty === c ? "" : c)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${filterCounty === c ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => { setFilterType(""); setFilterCounty(""); setFilterFeatured(false); setFilterSheetOpen(false); }}>Clear all</Button>
                <Button className="flex-1" onClick={() => setFilterSheetOpen(false)}>Show {filtered.length} results</Button>
              </div>
            </div>
          </div>
        )}
      </>}



      {activeTab === "listings" && (loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-card rounded-xl border overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
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
                    className={`border-b transition-colors cursor-pointer ${
                      flashId === l.id ? "bg-emerald-100" : "hover:bg-muted/30"
                    } ${
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
                         content = l.is_featured ? <span className="text-amber-500 text-base">★</span> : <span className="text-muted-foreground/30 text-base">☆</span>;
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
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${l.is_verified ? "text-emerald-600" : "text-muted-foreground"}`} onClick={(e) => handleToggleVerified(l, e)} title={l.is_verified ? "Unverify" : "Mark as Verified"}>
                          {l.is_verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => handleFetchSingleImage(l, e)} disabled={fetchingImageId === l.id} title="Fetch image">
                          {fetchingImageId === l.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(l)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
                onClick={() => {
                  if (mergeMode) handleMergeSelect(l);
                  else if (selectMode) toggleSelect(l);
                  else setEditing(l);
                }}
              >
                <div className="flex items-start gap-3">
                  {selectMode && (
                    <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l)} className="mt-1 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                  )}
                  {l.image_url && (
                    <img src={l.image_url} alt={l.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{l.name}</p>
                      {l.is_featured && <span className="text-amber-500 text-xs">★</span>}
                      {l.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{l.type}</p>
                    <p className="text-xs text-muted-foreground">{l.town}, {l.county}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditing(l)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setDeleteId(l.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Quick-add FAB */}
      {activeTab === "listings" && (
        <button
          onClick={() => setEditing({})}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

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
            <AlertDialogTitle>Delete "{listings.find(l => l.id === deleteId)?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">"{listings.find(l => l.id === deleteId)?.name}"</span>{" "}
              from the directory. This cannot be undone.
            </AlertDialogDescription>
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
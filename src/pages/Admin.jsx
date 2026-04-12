import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, Plus, Trash2, Edit, Search, LayoutGrid, List, CheckSquare } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">{listings.length} total listings</p>
        </div>
        <div className="flex items-center gap-2">
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
          <ImportExport listings={listings} onImportComplete={loadListings} />
          <Button onClick={() => setEditing({})} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </div>
      </div>

      {/* Bulk Edit Bar */}
      {selectMode && selectedIds.length > 0 && (
        <BulkEditBar
          selected={listings.filter((l) => selectedIds.includes(l.id))}
          allListings={listings}
          onDone={() => { setSelectedIds([]); setSelectMode(false); loadListings(); }}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Search */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Type filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground font-medium">Type:</span>
            {allTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(filterType === t ? "" : t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"
                }`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* County filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground font-medium">County:</span>
            {allCounties.map((c) => (
              <button
                key={c}
                onClick={() => { setFilterCounty(filterCounty === c ? "" : c); setFilterTown(""); }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterCounty === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>
        {allTowns.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-muted-foreground font-medium">Town:</span>
              {allTowns.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTown(filterTown === t ? "" : t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    filterTown === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
        )}
        {(filterType || filterCounty || filterTown) && (
          <button
            onClick={() => { setFilterType(""); setFilterCounty(""); setFilterTown(""); }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >Clear filters</button>
        )}
      </div>

      {loading ? (
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
                  {[["name","Name",""],["type","Type","hidden sm:table-cell"],["town","Town","hidden md:table-cell"],["county","County","hidden lg:table-cell"]].map(([key, label, cls]) => (
                    <th key={key} className={`text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-primary transition-colors ${cls}`} onClick={() => handleSort(key)}>
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
                    <td className="px-4 py-3">
                      <span className="font-medium">{l.name}</span>
                      <span className="sm:hidden text-xs text-muted-foreground ml-2">({l.type})</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{l.type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{l.town}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{l.county}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
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
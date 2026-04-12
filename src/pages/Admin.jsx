import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, Plus, Trash2, Edit, Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import ImportExport from "../components/ImportExport";
import AdminListingForm from "../components/AdminListingForm";
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
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

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

  const filtered = listings.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (l.name || "").toLowerCase().includes(s) || (l.town || "").toLowerCase().includes(s) || (l.type || "").toLowerCase().includes(s);
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
          <ImportExport listings={listings} onImportComplete={loadListings} />
          <Button onClick={() => setEditing({})} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card"
        />
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
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Town</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">County</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setEditing(l)}>
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
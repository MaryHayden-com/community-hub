import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Search, Calendar } from "lucide-react";
import AdminListingForm from "./AdminListingForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function WhatsOnAdmin({ onCountChange }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.CommunityListing.filter({ type: "What's On" }, "event_date", 2000)
      .then((r) => { setListings(r); onCountChange?.(r.length); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return listings.filter((l) => {
      if (!showPastEvents && l.event_date && l.event_date < today) return false;
      if (!s) return true;
      return (
        (l.name || "").toLowerCase().includes(s) ||
        (l.town || "").toLowerCase().includes(s) ||
        (l.county || "").toLowerCase().includes(s) ||
        (l.description || "").toLowerCase().includes(s)
      );
    }).sort((a, b) => {
      // Sort by date ascending, undated go to end
      const ad = a.event_date || "9999";
      const bd = b.event_date || "9999";
      return ad.localeCompare(bd);
    });
  }, [listings, search, showPastEvents, today]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await base44.entities.CommunityListing.delete(deleteId);
    toast({ title: "Deleted" });
    setDeleteId(null);
    load();
  };

  const handleToggleActive = async (l) => {
    await base44.entities.CommunityListing.update(l.id, { is_featured: !l.is_featured });
    load();
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground text-sm">Loading What's On…</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={showPastEvents} onChange={(e) => setShowPastEvents(e.target.checked)} className="cursor-pointer" />
          Show past events
        </label>
        <span className="text-xs text-muted-foreground">{filtered.length} events</span>
        <Button size="sm" onClick={() => setEditing({ type: "What's On" })} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium w-36">Date</th>
                <th className="text-left px-4 py-3 font-medium w-44">Time</th>
                <th className="text-left px-4 py-3 font-medium">Event Name</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium max-w-xs">Description</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Active</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const isPast = l.event_date && l.event_date < today;
                return (
                  <tr
                    key={l.id}
                    className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${isPast ? "opacity-50" : ""}`}
                    onClick={() => setEditing(l)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {l.event_date ? (
                        <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {formatDate(l.event_date)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No date</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.event_time || "—"}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.town}{l.county ? `, ${l.county}` : ""}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.category || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{l.description || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.contact_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.phone || "—"}</td>
                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); handleToggleActive(l); }}>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.is_featured ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {l.is_featured ? "Active" : "Inactive"}
                      </span>
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No events found</div>
        )}
      </div>

      {editing !== null && (
        <AdminListingForm
          listing={editing}
          onClose={() => setEditing(null)}
          onSave={() => { setEditing(null); load(); }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
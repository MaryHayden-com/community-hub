import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Edit, MapPin, Phone, Mail, Globe, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AdminPendingTab({ listings, onListingUpdated, onEdit }) {
  const [loadingId, setLoadingId] = useState(null);

  const pending = listings.filter((l) => l.status === "pending");

  const handleApprove = async (l) => {
    setLoadingId(l.id + "_approve");
    try {
      await base44.entities.CommunityListing.update(l.id, { status: "approved" });
      toast({ title: "Approved", description: `"${l.name}" is now live in the directory.` });
      onListingUpdated();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (l) => {
    setLoadingId(l.id + "_reject");
    try {
      await base44.entities.CommunityListing.update(l.id, { status: "rejected" });
      toast({ title: "Rejected", description: `"${l.name}" has been rejected.` });
      onListingUpdated();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  if (pending.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">All clear!</p>
        <p className="text-sm mt-1">No listings are awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{pending.length} listing{pending.length !== 1 ? "s" : ""} awaiting your review</p>
      {pending.map((l) => (
        <div key={l.id} className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row gap-4">
          {/* Image */}
          {l.image_url ? (
            <img src={l.image_url} alt={l.name} className="w-full sm:w-24 h-24 object-cover rounded-lg shrink-0" />
          ) : (
            <div className="w-full sm:w-24 h-24 bg-muted rounded-lg shrink-0 flex items-center justify-center text-muted-foreground text-xs">No image</div>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-semibold text-base">{l.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{l.type}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 shrink-0">Pending</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              {(l.town || l.county) && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[l.town, l.county].filter(Boolean).join(", ")}</span>
              )}
              {l.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{l.phone}</span>}
              {l.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{l.email}</span>}
              {l.website && <a href={l.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Globe className="w-3 h-3" />{l.website.replace(/^https?:\/\//, "")}</a>}
            </div>

            {l.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{l.description}</p>
            )}

            {l.contact_name && (
              <p className="text-xs text-muted-foreground mt-1">Submitted by: <span className="font-medium text-foreground">{l.contact_name}</span></p>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
            <Button
              size="sm"
              className="gap-1.5"
              style={{ background: "#097275" }}
              onClick={() => handleApprove(l)}
              disabled={!!loadingId}
            >
              {loadingId === l.id + "_approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => onEdit(l)}
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => handleReject(l)}
              disabled={!!loadingId}
            >
              {loadingId === l.id + "_reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
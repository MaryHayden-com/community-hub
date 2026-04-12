import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Trash2 } from "lucide-react";

const FIELDS = [
  ["name", "Name"], ["type", "Type"], ["category", "Category"],
  ["county", "County"], ["town", "Town"], ["description", "Description"],
  ["address", "Address"], ["phone", "Phone"], ["email", "Email"],
  ["website", "Website"], ["facebook_url", "Facebook"], ["instagram_url", "Instagram"],
  ["linkedin_url", "LinkedIn"], ["contact_name", "Contact Name"], ["meeting_info", "Meeting Info"],
];

export default function MergeListingsDialog({ listingA, listingB, onClose, onMerged }) {
  const [keepId, setKeepId] = useState(listingA.id);
  const [saving, setSaving] = useState(false);

  const keep = keepId === listingA.id ? listingA : listingB;
  const remove = keepId === listingA.id ? listingB : listingA;

  const handleMerge = async () => {
    setSaving(true);
    try {
      // Keep the chosen record, delete the other
      await base44.entities.CommunityListing.delete(remove.id);
      toast({ title: "Merged", description: `"${remove.name}" was removed. "${keep.name}" kept.` });
      onMerged();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Merge Duplicate Listings</DialogTitle>
          <DialogDescription>
            Choose which listing to <strong>keep</strong>. The other will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {[listingA, listingB].map((l) => {
            const isKeep = keepId === l.id;
            return (
              <div
                key={l.id}
                onClick={() => setKeepId(l.id)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  isKeep ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={isKeep ? "default" : "outline"}>
                    {isKeep ? <><CheckCircle2 className="w-3 h-3 mr-1" />Keep</> : <><Trash2 className="w-3 h-3 mr-1" />Remove</>}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {FIELDS.map(([key, label]) => l[key] ? (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium break-words">{String(l[key])}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <strong className="text-foreground">"{keep.name}"</strong> will be kept &nbsp;·&nbsp;
          <strong className="text-destructive">"{remove.name}"</strong> will be deleted
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleMerge} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Confirm Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, X } from "lucide-react";

const BULK_FIELDS = [
  { key: "type", label: "Type", options: ["Business", "Club & Group", "Education", "What's On"] },
  { key: "county", label: "County", options: null },
  { key: "town", label: "Town", options: null },
  { key: "is_featured", label: "Featured", options: ["true", "false"] },
];

export default function BulkEditBar({ selected, allListings, onDone, onClearSelection }) {
  const [field, setField] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const counties = [...new Set(allListings.map((l) => l.county).filter(Boolean))].sort();
  const towns = [...new Set(allListings.map((l) => l.town).filter(Boolean))].sort();

  const fieldConfig = BULK_FIELDS.find((f) => f.key === field);
  const options = fieldConfig?.options || (field === "county" ? counties : field === "town" ? towns : []);

  const handleApply = async () => {
    if (!field || value === "") return;
    setSaving(true);
    const updateValue = field === "is_featured" ? value === "true" : value;
    try {
      await Promise.all(selected.map((l) => base44.entities.CommunityListing.update(l.id, { [field]: updateValue })));
      toast({ title: "Updated", description: `${selected.length} listing(s) updated.` });
      onDone();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ${selected.length} listing(s)?`)) return;
    setSaving(true);
    try {
      await Promise.all(selected.map((l) => base44.entities.CommunityListing.delete(l.id)));
      toast({ title: "Deleted", description: `${selected.length} listing(s) removed.` });
      onDone();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl mb-4">
      <span className="text-sm font-semibold text-primary">{selected.length} selected</span>

      <div className="flex items-center gap-2 flex-wrap flex-1">
        <Select value={field} onValueChange={(v) => { setField(v); setValue(""); }}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="Change field…" />
          </SelectTrigger>
          <SelectContent>
            {BULK_FIELDS.map((f) => (
              <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {field && (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="New value…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button size="sm" onClick={handleApply} disabled={!field || value === "" || saving} className="h-8">
          {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
          Apply
        </Button>

        <Button size="sm" variant="destructive" onClick={handleDeleteAll} disabled={saving} className="h-8">
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete all
        </Button>
      </div>

      <Button size="icon" variant="ghost" className="h-8 w-8 ml-auto" onClick={onClearSelection}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
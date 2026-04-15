import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const NOTICE_TYPES = [
  { value: "volunteers_wanted", label: "Volunteers Wanted" },
  { value: "job", label: "Job / Employment" },
  { value: "announcement", label: "Announcement" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

export default function NoticeForm({ notice, listingId, ownerEmail, onClose, onSave }) {
  const isNew = !notice.id;
  const [form, setForm] = useState({
    title: notice.title || "",
    body: notice.body || "",
    notice_type: notice.notice_type || "announcement",
    is_active: notice.is_active !== false,
    expires_on: notice.expires_on || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, listing_id: listingId, listing_owner_email: ownerEmail };
    if (isNew) {
      await base44.entities.ListingNotice.create(data);
    } else {
      await base44.entities.ListingNotice.update(notice.id, data);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-xl border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{isNew ? "Add Notice" : "Edit Notice"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Type</label>
            <Select value={form.notice_type} onValueChange={(v) => setForm({ ...form, notice_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTICE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Volunteers needed for summer fair"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Details *</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Describe what you need, how to apply, contact details, etc."
              required
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Expires On (optional)</label>
            <Input
              type="date"
              value={form.expires_on}
              onChange={(e) => setForm({ ...form, expires_on: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm cursor-pointer">Active (visible on listing page)</label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : isNew ? "Post Notice" : "Save Changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
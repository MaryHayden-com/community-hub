import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Link as LinkIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminEventForm({ event, allListings = [], onClose, onSave }) {
  const isNew = !event?.id;
  const [form, setForm] = useState({
    name: event?.name || "",
    description: event?.description || "",
    category: event?.category || "",
    county: event?.county || "",
    town: event?.town || "",
    area: event?.area || "",
    address: event?.address || "",
    event_date: event?.event_date || "",
    event_time: event?.event_time || "",
    is_recurring: event?.is_recurring || false,
    recurring_day: event?.recurring_day || "",
    is_free: event?.is_free ?? null,
    contact_name: event?.contact_name || "",
    phone: event?.phone || "",
    email: event?.email || "",
    website: event?.website || "",
    image_url: event?.image_url || "",
    is_featured: event?.is_featured || false,
    parent_listing_id: event?.parent_listing_id || "",
    parent_listing_name: event?.parent_listing_name || "",
  });
  const [saving, setSaving] = useState(false);
  const [listingSearch, setListingSearch] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const filteredListings = allListings
    .filter((l) => l.type !== "What's On")
    .filter((l) => {
      if (!listingSearch) return true;
      const s = listingSearch.toLowerCase();
      return (l.name || "").toLowerCase().includes(s) || (l.town || "").toLowerCase().includes(s);
    })
    .slice(0, 20);

  const linkListing = (listing) => {
    update("parent_listing_id", listing.id);
    update("parent_listing_name", listing.name);
    // Auto-fill location if empty
    if (!form.county) update("county", listing.county || "");
    if (!form.town) update("town", listing.town || "");
    if (!form.area) update("area", listing.area || "");
    if (!form.address) update("address", listing.address || "");
    setListingSearch("");
  };

  const unlinkListing = () => {
    update("parent_listing_id", "");
    update("parent_listing_name", "");
  };

  const handleSave = async () => {
    if (!form.name || !form.county || !form.town) {
      toast({ title: "Missing fields", description: "Name, county and town are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await base44.entities.Event.create(form);
        toast({ title: "Created", description: `${form.name} added.` });
      } else {
        await base44.entities.Event.update(event.id, form);
        toast({ title: "Updated", description: `${form.name} updated.` });
      }
      onSave();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update("image_url", file_url);
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add New Event" : `Edit: ${event.name}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Link to existing listing */}
          <div className="border rounded-lg p-3 space-y-2 bg-blue-50/50 border-blue-200">
            <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              Link to a Listing (optional)
            </p>
            {form.parent_listing_id ? (
              <div className="flex items-center justify-between bg-white border rounded-md px-3 py-2">
                <span className="text-sm font-medium">{form.parent_listing_name}</span>
                <button onClick={unlinkListing} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Search businesses, clubs, schools…"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                />
                {listingSearch && filteredListings.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredListings.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onMouseDown={() => linkListing(l)}
                      >
                        <span className="font-medium">{l.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{l.type} · {l.town}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label>Event Name *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Bingo Night, Farmers Market" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} />
          </div>

          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Music, Market, Sport" />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>County *</Label>
              <Input value={form.county} onChange={(e) => update("county", e.target.value)} />
            </div>
            <div>
              <Label>Town / Village *</Label>
              <Input value={form.town} onChange={(e) => update("town", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Venue / Address</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g. Community Hall, Main St" />
          </div>

          {/* Date / Recurring */}
          <div className="border rounded-lg p-4 space-y-3 bg-amber-50/50 border-amber-200">
            <p className="text-sm font-semibold text-amber-800">When</p>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_recurring} onCheckedChange={(v) => update("is_recurring", v)} />
              <Label className="cursor-pointer">Recurring weekly event</Label>
            </div>
            {form.is_recurring ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Day of Week</Label>
                  <Select value={form.recurring_day} onValueChange={(v) => update("recurring_day", v)}>
                    <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                    <SelectContent>
                      {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time</Label>
                  <Input value={form.event_time} onChange={(e) => update("event_time", e.target.value)} placeholder="e.g. 7:30pm" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input value={form.event_time} onChange={(e) => update("event_time", e.target.value)} placeholder="e.g. 7:30pm" />
                </div>
              </div>
            )}
            <div>
              <Label>Entry</Label>
              <Select
                value={form.is_free === true ? "free" : form.is_free === false ? "paid" : ""}
                onValueChange={(v) => update("is_free", v === "free" ? true : v === "paid" ? false : null)}
              >
                <SelectTrigger><SelectValue placeholder="Free or Paid?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Contact (for enquiries)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact Name</Label>
                <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="e.g. Mary O'Brien" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 087 123 4567" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g. info@example.ie" />
            </div>
            <div>
              <Label>Website / Tickets URL</Label>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            </div>
          </div>

          {/* Image */}
          <div>
            <Label>Image</Label>
            <div className="space-y-2 mt-1">
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              <div className="flex items-center gap-3">
                <Input
                  placeholder="or paste image URL"
                  value={form.image_url}
                  onChange={(e) => update("image_url", e.target.value)}
                  className="flex-1"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
            <Label className="cursor-pointer">Featured Event</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isNew ? "Create Event" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
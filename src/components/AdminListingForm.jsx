import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminListingForm({ listing, onClose, onSave }) {
  const isNew = !listing?.id;
  const [form, setForm] = useState({
    name: listing?.name || "",
    type: listing?.type || "Business",
    category: listing?.category || "",
    country: listing?.country || "Ireland",
    county: listing?.county || "",
    town: listing?.town || "",
    description: listing?.description || "",
    address: listing?.address || "",
    phone: listing?.phone || "",
    email: listing?.email || "",
    website: listing?.website || "",
    facebook_url: listing?.facebook_url || "",
    instagram_url: listing?.instagram_url || "",
    linkedin_url: listing?.linkedin_url || "",
    contact_name: listing?.contact_name || "",
    meeting_info: listing?.meeting_info || "",
    is_featured: listing?.is_featured || false,
    image_url: listing?.image_url || "",
  });
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.type || !form.county || !form.town) {
      toast({ title: "Missing fields", description: "Name, type, county and town are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await base44.entities.CommunityListing.create(form);
        toast({ title: "Created", description: `${form.name} added.` });
      } else {
        await base44.entities.CommunityListing.update(listing.id, form);
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
          <DialogTitle>{isNew ? "Add New Listing" : `Edit: ${listing.name}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Club & Group">Club & Group</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="What's On">What's On</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Category / Trade Type</Label>
            <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Restaurant, GAA Club, Primary School" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div>
              <Label>County *</Label>
              <Input value={form.county} onChange={(e) => update("county", e.target.value)} />
            </div>
            <div>
              <Label>Town *</Label>
              <Input value={form.town} onChange={(e) => update("town", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>

          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Facebook</Label>
              <Input value={form.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} placeholder="URL" />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={form.instagram_url} onChange={(e) => update("instagram_url", e.target.value)} placeholder="URL" />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="URL" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Name</Label>
              <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} />
            </div>
            <div>
              <Label>Meeting Info</Label>
              <Input value={form.meeting_info} onChange={(e) => update("meeting_info", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Image</Label>
            <div className="flex items-center gap-3 mt-1">
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
            <Label className="cursor-pointer">Featured Listing</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isNew ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
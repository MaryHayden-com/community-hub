import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Wand2, Crown, Lock } from "lucide-react";

export default function OwnerListingEditForm({ listing, onClose, onSave }) {
  const isPaid = (listing?.plan === "standard" || listing?.plan === "premium") && listing?.plan_status === "active";
  const [form, setForm] = useState({
    name: listing?.name || "",
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
    image_url: listing?.image_url || "",
    hidden_fields: listing?.hidden_fields || [],
  });
  const [saving, setSaving] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleHidden = (field) => setForm((prev) => ({
    ...prev,
    hidden_fields: prev.hidden_fields.includes(field)
      ? prev.hidden_fields.filter((f) => f !== field)
      : [...prev.hidden_fields, field],
  }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("image_url", file_url);
  };

  const handleFetchImage = async () => {
    const urls = [form.website, form.facebook_url, form.instagram_url].filter(Boolean);
    if (!urls.length) {
      toast({ title: "No links", description: "Add a website or social link first.", variant: "destructive" });
      return;
    }
    setFetchingImage(true);
    const res = await base44.functions.invoke("fetchOgImage", { urls });
    if (res.data?.image_url) {
      update("image_url", res.data.image_url);
      toast({ title: "Image found!" });
    } else {
      toast({ title: "No image found", variant: "destructive" });
    }
    setFetchingImage(false);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast({ title: "Name is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.entities.CommunityListing.update(listing.id, form);
    toast({ title: "Listing updated!", description: `${form.name} has been saved.` });
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing: {listing.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Listing Name *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          {!isPaid && (
            <div className="border-2 border-dashed border-amber-200 bg-amber-50/60 rounded-xl p-5 text-center">
              <Lock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="font-semibold text-amber-900 text-sm">Standard or Premium plan required</p>
              <p className="text-xs text-amber-700 mt-1 mb-3">Upgrade to edit your full listing details — description, contact info, social links, images and more.</p>
              <Link to="/billing">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Upgrade Now</Button>
              </Link>
            </div>
          )}

          {isPaid && (
          <>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold">Contact Details</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact Name</Label>
                <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="e.g. John Murphy" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 021 123 4567" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="info@example.ie" type="email" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>

            <div>
              <Label>Meeting Info</Label>
              <Input value={form.meeting_info} onChange={(e) => update("meeting_info", e.target.value)} placeholder="e.g. Every Tuesday at 7pm, Village Hall" />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold">Social Media</p>
            <div className="space-y-2">
              <div>
                <Label>Facebook URL</Label>
                <Input value={form.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={form.instagram_url} onChange={(e) => update("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div>
              <p className="text-sm font-semibold">What people can see</p>
              <p className="text-xs text-muted-foreground mt-0.5">Untick any details you don't want shown publicly.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { field: "phone", label: "Phone" },
                { field: "email", label: "Email" },
                { field: "contact_name", label: "Contact name" },
                { field: "website", label: "Website" },
                { field: "address", label: "Address" },
                { field: "meeting_info", label: "Meeting info" },
                { field: "facebook_url", label: "Facebook" },
                { field: "instagram_url", label: "Instagram" },
                { field: "linkedin_url", label: "LinkedIn" },
              ].map((item) => (
                <label key={item.field} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hidden_fields.includes(item.field)}
                    onChange={() => toggleHidden(item.field)}
                    className="cursor-pointer"
                  />
                  <span className={form.hidden_fields.includes(item.field) ? "line-through text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Image</Label>
            <div className="space-y-3 mt-1">
              {form.image_url && (
                <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                  <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{form.image_url}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => update("image_url", "")} className="text-destructive shrink-0">
                    Remove
                  </Button>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Upload an image</p>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" /><span>or</span><div className="flex-1 h-px bg-border" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Paste image URL</p>
                <Input placeholder="https://example.com/image.jpg" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleFetchImage} disabled={fetchingImage} className="gap-1.5 w-full">
                {fetchingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Auto-fetch image from website / social links
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
          </>
          )}

          {!isPaid && (
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Save Name
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
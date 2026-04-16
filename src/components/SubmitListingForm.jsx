import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, PlusCircle } from "lucide-react";

const LISTING_TYPES = ["Business", "Club & Group", "Community Services", "Education", "What's On"];
const COUNTIES = [
  "Antrim","Armagh","Carlow","Cavan","Clare","Cork","Derry","Donegal","Down","Dublin",
  "Fermanagh","Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim","Limerick",
  "Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo",
  "Tipperary","Tyrone","Waterford","Westmeath","Wexford","Wicklow"
].sort();

export default function SubmitListingForm({ open, onClose }) {
  const [form, setForm] = useState({
    name: "", type: "", county: "", town: "", description: "",
    phone: "", email: "", website: "", contact_name: ""
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.county || !form.town || !form.contact_name || !form.email) {
      alert("Please fill in all required fields (marked with *).");
      return;
    }
    setSaving(true);
    await base44.integrations.Core.SendEmail({
      to: "mary@maryhayden.com",
      subject: `New Listing Submission: ${form.name}`,
      body: `A new listing has been submitted for review:\n\n` +
        `Name: ${form.name}\nType: ${form.type}\nCounty: ${form.county}\nTown: ${form.town}\n\n` +
        `Contact Name: ${form.contact_name}\nContact Email: ${form.email}\nPhone: ${form.phone || "N/A"}\nWebsite: ${form.website || "N/A"}\n\n` +
        `Description:\n${form.description || "N/A"}\n\n` +
        `Please log in to the admin panel to review and add this listing.`,
    });
    setSubmitted(true);
    setSaving(false);
  };

  const handleClose = () => {
    setForm({ name: "", type: "", county: "", town: "", description: "", phone: "", email: "", website: "", contact_name: "" });
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Submit Your Listing
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-lg">Request Received!</p>
            <p className="text-sm text-muted-foreground">
              Thank you for submitting <strong>{form.name}</strong>. We'll review your listing and add it to the directory shortly.
            </p>
            <Button onClick={handleClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Fill in the details below and we'll review your submission and add it to the directory.
            </p>

            <div>
              <Label>Listing Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Ballycastle GAA Club" />
            </div>

            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>County *</Label>
                <Select value={form.county} onValueChange={(v) => update("county", v)}>
                  <SelectTrigger><SelectValue placeholder="County..." /></SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Town / Village *</Label>
                <Input value={form.town} onChange={(e) => update("town", e.target.value)} placeholder="e.g. Ballycastle" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description of your organisation or business..." rows={3} />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Your Contact Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contact Name *</Label>
                  <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.ie" type="email" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Submit Listing
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
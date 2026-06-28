import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, CalendarPlus } from "lucide-react";

const COUNTIES = [
  "Antrim","Armagh","Carlow","Cavan","Clare","Cork","Derry","Donegal","Down","Dublin",
  "Fermanagh","Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim","Limerick",
  "Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo",
  "Tipperary","Tyrone","Waterford","Westmeath","Wexford","Wicklow"
].sort();

const EMPTY = {
  name: "", county: "", town: "", description: "",
  event_date: "", event_date_end: "", event_time: "",
  address: "", website: "", is_free: "",
  contact_name: "", email: "", phone: "",
};

export default function SubmitEventForm({ open, onClose, isPaidUser = false, isAdmin = false, ownerListing = null }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleClose = () => {
    setForm(EMPTY);
    setSaving(false);
    setDone(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.county || !form.town || !form.event_date || !form.contact_name || !form.email) {
      alert("Please fill in all required fields (*).");
      return;
    }
    setSaving(true);
    // Paid owners and admins get auto-approved; public submissions stay pending for owner review
    const autoApprove = isPaidUser || isAdmin;
    const payload = {
      ...form,
      type: "What's On",
      status: autoApprove ? "approved" : "pending",
      plan: "basic",
      plan_status: "active",
      country: "Ireland",
      nearest_town: form.town,
      is_free: form.is_free === "true" ? true : form.is_free === "false" ? false : undefined,
      ...(ownerListing?.id ? { parent_listing_id: ownerListing.id, owner_email: ownerListing.owner_email } : {}),
    };
    await base44.entities.CommunityListing.create(payload);
    setDone(true);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-primary" />
            {done ? "Event Submitted!" : "Add Your Event"}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#097275" }}>
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">
              {isPaidUser || isAdmin ? "Event published!" : "Event submitted!"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isPaidUser || isAdmin
                ? <><strong>{form.name}</strong> is now live on the What's On calendar.</>
                : <><strong>{form.name}</strong> has been submitted. The local listing owner will be notified to approve it — it should be live within 24 hours.</>
              }
            </p>
            <Button onClick={handleClose} className="w-full" style={{ background: "#097275" }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              {isPaidUser || isAdmin
                ? "Your event will go live immediately once submitted."
                : "Anyone can submit an event. The local listing owner will be notified to approve it before it goes live."}
            </p>

            {/* Event details */}
            <div>
              <Label>Event Name *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Bandon Farmers Market" />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="A short description of the event..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.event_date_end} min={form.event_date} onChange={e => set("event_date_end", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Time</Label>
                <Input type="time" value={form.event_time} onChange={e => set("event_time", e.target.value)} />
              </div>
              <div>
                <Label>Entry</Label>
                <Select value={form.is_free} onValueChange={v => set("is_free", v)}>
                  <SelectTrigger><SelectValue placeholder="Free / Paid?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Free</SelectItem>
                    <SelectItem value="false">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Location</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>County *</Label>
                  <Select value={form.county} onValueChange={v => set("county", v)}>
                    <SelectTrigger><SelectValue placeholder="County..." /></SelectTrigger>
                    <SelectContent>
                      {COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Town / Village *</Label>
                  <Input value={form.town} onChange={e => set("town", e.target.value)} placeholder="e.g. Bandon" />
                </div>
              </div>
              <div className="mt-3">
                <Label>Venue / Address</Label>
                <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="e.g. Town Hall, Main St" />
              </div>
            </div>

            {/* Links */}
            <div>
              <Label>Website / Ticket Link</Label>
              <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." />
            </div>

            {/* Organiser */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Your Details (not shown publicly)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Your Name *</Label>
                  <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Contact name" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.ie" />
                </div>
                <div className="col-span-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={saving} style={{ background: '#097275' }}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Submit Event"}
              </Button>
            </div>
          </form>
          )}
          </DialogContent>
    </Dialog>
  );
}
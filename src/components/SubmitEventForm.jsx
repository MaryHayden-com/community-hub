import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, CalendarPlus } from "lucide-react";
import { ALL_COUNTIES } from "@/utils/irelandData";
import CategoryPicker from "@/components/CategoryPicker";

const EMPTY = {
  name: "", county: "", town: "", description: "",
  event_date: "", event_date_end: "", event_time: "",
  address: "", website: "", is_free: "",
  contact_name: "", email: "", phone: "",
  category: [],
  newcomer_status: "", beginner_friendly: false, welcome_note: "",
  volunteer_needed: false, volunteer_summary: "",
  facility_available: false, facility_details: "",
};

export default function SubmitEventForm({ open, onClose, isPaidUser = false, isAdmin = false, ownerListing = null }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [availableListings, setAvailableListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState("");

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  // Load approved directory listings for the public to link their event to
  useEffect(() => {
    if (open && !isPaidUser && !isAdmin) {
      base44.entities.CommunityListing.filter({ status: "approved" }, "name", 500)
        .then(listings => setAvailableListings(listings.filter(l => l.type !== "What's On")))
        .catch(() => {});
    }
  }, [open, isPaidUser, isAdmin]);

  const handleClose = () => {
    setForm(EMPTY);
    setSaving(false);
    setDone(false);
    setErrors({});
    setSubmitError("");
    setSelectedListingId("");
    onClose();
  };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Event name is required";
    if (!form.county) e.county = "County is required";
    if (!form.town) e.town = "Town is required";
    if (!form.event_date) e.event_date = "Start date is required";
    if (!form.contact_name) e.contact_name = "Your name is required";
    if (!form.email) e.email = "Email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError("");
    try {
      const autoApprove = isPaidUser || isAdmin;
      const linkedListing = ownerListing || (selectedListingId ? availableListings.find(l => l.id === selectedListingId) : null);
      const payload = {
        ...form,
        type: "What's On",
        status: autoApprove ? "approved" : "pending",
        plan: "basic",
        plan_status: "active",
        country: "Ireland",
        nearest_town: form.town,
        is_free: form.is_free === "true" ? true : form.is_free === "false" ? false : undefined,
        ...(linkedListing?.id ? { parent_listing_id: linkedListing.id, owner_email: linkedListing.owner_email } : {}),
      };
      await base44.entities.CommunityListing.create(payload);
      setDone(true);
    } catch (err) {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
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

            {/* Link to a listing — public users only */}
            {!isPaidUser && !isAdmin && (
              <div>
                <Label>Link to a Directory Listing (recommended)</Label>
                <Select value={selectedListingId} onValueChange={setSelectedListingId}>
                  <SelectTrigger><SelectValue placeholder="Search & select a listing..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {availableListings.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name} — {l.town}, Co. {l.county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Linking your event to a directory listing helps the owner approve it faster.</p>
              </div>
            )}

            {/* Category */}
            <div>
              <Label>Event Type / Category</Label>
              <CategoryPicker
                listingType="What's On"
                selected={form.category}
                onChange={v => set("category", v)}
                placeholder="e.g. Live Music, Fundraiser, Workshop..."
              />
            </div>

            {/* Event details */}
            <div>
              <Label>Event Name *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Bandon Farmers Market" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="A short description of the event..." rows={3} />
            </div>

            {/* Openness — helps outsiders know if they can come / help */}
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div>
                <p className="text-sm font-semibold">Can people just turn up? · Do you need help?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Let outsiders know if this event is open to newcomers — and what you need a hand with. You can change this per event as needs change.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Can newcomers just turn up?</Label>
                  <Select value={form.newcomer_status} onValueChange={v => set("newcomer_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="just_turn_up">Just turn up</SelectItem>
                      <SelectItem value="come_and_try">Come & try</SelectItem>
                      <SelectItem value="contact_first">Contact first</SelectItem>
                      <SelectItem value="members_only">Members only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 sm:pt-7">
                  <Switch checked={!!form.beginner_friendly} onCheckedChange={v => set("beginner_friendly", v)} />
                  <Label className="cursor-pointer">Beginner friendly</Label>
                </div>
              </div>
              <div>
                <Label>Welcome note (one line for outsiders)</Label>
                <Input value={form.welcome_note} onChange={e => set("welcome_note", e.target.value)} placeholder="e.g. No experience needed, first night free, all welcome." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!form.volunteer_needed} onCheckedChange={v => set("volunteer_needed", v)} />
                <Label className="cursor-pointer">We need volunteers for this event</Label>
              </div>
              {form.volunteer_needed && (
                <div>
                  <Label>What do you need help with?</Label>
                  <Textarea value={form.volunteer_summary} onChange={e => set("volunteer_summary", e.target.value)} rows={2} placeholder="e.g. Two hours on the gate — Sat 12–2pm." />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} />
                {errors.event_date && <p className="text-xs text-destructive mt-1">{errors.event_date}</p>}
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
                      {ALL_COUNTIES.sort().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.county && <p className="text-xs text-destructive mt-1">{errors.county}</p>}
                </div>
                <div>
                  <Label>Town / Village *</Label>
                  <Input value={form.town} onChange={e => set("town", e.target.value)} placeholder="e.g. Bandon" />
                  {errors.town && <p className="text-xs text-destructive mt-1">{errors.town}</p>}
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
                  {errors.contact_name && <p className="text-xs text-destructive mt-1">{errors.contact_name}</p>}
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.ie" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div className="col-span-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
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
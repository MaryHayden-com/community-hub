import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, PlusCircle, Clock } from "lucide-react";
import { ALL_COUNTIES } from "@/utils/irelandData";
import CategoryPicker from "@/components/CategoryPicker";

const LISTING_TYPES = ["Business", "Club & Group", "Community Services", "Education", "What's On"];

export default function SubmitListingForm({ open, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1 = details, 2 = success
  const [form, setForm] = useState({
    name: "", type: "", county: "", town: "", description: "",
    phone: "", email: "", website: "", contact_name: "", category: [],
    newcomer_status: "", beginner_friendly: false, welcome_note: "",
    volunteer_needed: false, volunteer_summary: "",
    facility_available: false, facility_details: "",
  });
  const [plan, setPlan] = useState(null);

  // Prefill contact details from the signed-in account
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
        contact_name: prev.contact_name || user.full_name || "",
      }));
    }
  }, [user]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    setForm({ name: "", type: "", county: "", town: "", description: "", phone: "", email: "", website: "", contact_name: "", category: [], newcomer_status: "", beginner_friendly: false, welcome_note: "", volunteer_needed: false, volunteer_summary: "", facility_available: false, facility_details: "" });
    setStep(1);
    setPlan(null);
    setSaving(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!form.name || !form.type || !form.county || !form.town || !form.contact_name || !form.email) {
      setFormError("Please fill in all required fields (marked with *).");
      return;
    }
    setFormError("");
    handleFreeSubmit();
  };

  // Free basic listing — save as pending, no payment
  const handleFreeSubmit = async () => {
    setSaving(true);
    try {
      await base44.entities.CommunityListing.create({
        ...form,
        owner_email: user?.email || "",
        status: "pending",
        plan: "basic",
        plan_status: "active",
        country: "Ireland",
      });
      // Confirmation email to submitter
      if (form.email) {
        base44.integrations.Core.SendEmail({
          from_name: "Hub4Community",
          to: form.email,
          subject: `Your listing has been submitted — ${form.name}`,
          body: `Hi ${(form.contact_name || "there").split(" ")[0]},\n\nThank you for submitting "${form.name}" to Hub4Community!\n\nYour listing is now under review and will be live in the directory shortly. We'll be in touch if we need anything from you.\n\nBest regards,\nThe Hub4Community Team`,
        }).catch(() => {});
      }
      // Admin alert
      base44.integrations.Core.SendEmail({
        from_name: "Hub4Community",
        to: "communitywhatson@gmail.com",
        subject: `New listing submission: ${form.name}`,
        body: `A new listing has been submitted for review.\n\nName: ${form.name}\nType: ${form.type}\nTown: ${form.town}, ${form.county}\nContact: ${form.contact_name} (${form.email})\n\nReview in Admin → Pending.`,
      }).catch(() => {});
      setStep(3);
    } catch (err) {
      setFormError("Something went wrong: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Paid plan — save as pending then go to Stripe
  const handlePayment = async (selectedPlan) => {
    setPlan(selectedPlan);
    setSaving(true);

    if (window.self !== window.top) {
      setFormError("Payment checkout only works from the published app, not the preview.");
      setSaving(false);
      return;
    }

    try {
      await base44.entities.CommunityListing.create({
        ...form,
        status: "pending",
        plan: selectedPlan === "annual" ? "standard" : "basic",
        plan_status: "active",
        country: "Ireland",
      });

      const response = await base44.functions.invoke('createCheckoutSession', {
        plan: selectedPlan,
        listing_name: form.name,
        contact_name: form.contact_name,
        email: form.email,
        success_url: `${window.location.origin}/?submitted=1`,
        cancel_url: window.location.href,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data?.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setFormError("Something went wrong: " + err.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            {step === 1 ? "Add Your Listing (Free)" : "Submission Received!"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Fill in the details below. Listing on Hub4Community is free — no payment required.
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
                    {ALL_COUNTIES.sort().map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Town / Village *</Label>
                <Input value={form.town} onChange={(e) => update("town", e.target.value)} placeholder="e.g. Ballycastle" />
              </div>
            </div>

            {form.type && (
              <div>
                <Label>Category / Categories</Label>
                <CategoryPicker
                  listingType={form.type}
                  selected={form.category}
                  onChange={v => update("category", v)}
                  placeholder="Search or browse categories..."
                />
              </div>
            )}

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
                  <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.ie" type="email" readOnly={!!user} />
                  {!!user && <p className="text-xs text-muted-foreground mt-1">Linked to your signed-in account — you'll own and manage this listing.</p>}
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

            {form.type && form.type !== "Business" && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div>
                  <p className="text-sm font-semibold">Open to newcomers</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Help outsiders know if they can just turn up — and what you need a hand with. You can change this any time from your dashboard.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Can newcomers just turn up?</Label>
                    <Select value={form.newcomer_status} onValueChange={(v) => update("newcomer_status", v)}>
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
                    <Switch checked={!!form.beginner_friendly} onCheckedChange={(v) => update("beginner_friendly", v)} />
                    <Label className="cursor-pointer">Beginner friendly</Label>
                  </div>
                </div>
                <div>
                  <Label>Welcome note (one line for outsiders)</Label>
                  <Input value={form.welcome_note} onChange={(e) => update("welcome_note", e.target.value)} placeholder="e.g. No experience needed, boots not required, first session free." />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.volunteer_needed} onCheckedChange={(v) => update("volunteer_needed", v)} />
                  <Label className="cursor-pointer">We need volunteers right now</Label>
                </div>
                {form.volunteer_needed && (
                  <div>
                    <Label>What do you need help with?</Label>
                    <Textarea value={form.volunteer_summary} onChange={(e) => update("volunteer_summary", e.target.value)} rows={2} placeholder="e.g. Two hours on the gate for the U12 blitz on 14 Sept." />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.facility_available} onCheckedChange={(v) => update("facility_available", v)} />
                  <Label className="cursor-pointer">We have space to hire</Label>
                </div>
                {form.facility_available && (
                  <div>
                    <Label>What space, and when?</Label>
                    <Textarea value={form.facility_details} onChange={(e) => update("facility_details", e.target.value)} rows={2} placeholder="e.g. Hall available weekday mornings." />
                  </div>
                )}
              </div>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Free Listing
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#097275" }}>
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Submission Received!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Thank you, <strong>{form.contact_name || "there"}</strong>! Your listing for <strong>{form.name}</strong> has been submitted and is awaiting review. We'll have it live in the directory shortly.
            </p>
            {user && (
              <p className="text-xs text-muted-foreground">
                This listing is linked to your account — you can edit it from <strong>My Dashboard</strong> once it's approved.
              </p>
            )}
            <Button onClick={handleClose} className="w-full" style={{ background: "#097275" }}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
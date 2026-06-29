import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, PlusCircle, Clock } from "lucide-react";
import { ALL_COUNTIES } from "@/utils/irelandData";
import CategoryPicker from "@/components/CategoryPicker";

const LISTING_TYPES = ["Business", "Club & Group", "Community Services", "Education", "What's On"];

export default function SubmitListingForm({ open, onClose }) {
  const [step, setStep] = useState(1); // 1 = details, 2 = plan, 3 = success
  const [form, setForm] = useState({
    name: "", type: "", county: "", town: "", description: "",
    phone: "", email: "", website: "", contact_name: "", category: []
  });
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    setForm({ name: "", type: "", county: "", town: "", description: "", phone: "", email: "", website: "", contact_name: "", category: [] });
    setStep(1);
    setPlan(null);
    setSaving(false);
    onClose();
  };

  const handleDetailsNext = () => {
    if (!form.name || !form.type || !form.county || !form.town || !form.contact_name || !form.email) {
      setFormError("Please fill in all required fields (marked with *).");
      return;
    }
    setFormError("");
    setStep(2);
  };

  // Free basic listing — save as pending, no payment
  const handleFreeSubmit = async () => {
    setSaving(true);
    try {
      await base44.entities.CommunityListing.create({
        ...form,
        status: "pending",
        plan: "basic",
        plan_status: "active",
        country: "Ireland",
      });
      // Confirmation email to submitter
      if (form.email) {
        base44.integrations.Core.SendEmail({
          from_name: "Community Hub",
          to: form.email,
          subject: `Your listing has been submitted — ${form.name}`,
          body: `Hi ${(form.contact_name || "there").split(" ")[0]},\n\nThank you for submitting "${form.name}" to Community Hub!\n\nYour listing is now under review and will be live in the directory shortly. We'll be in touch if we need anything from you.\n\nBest regards,\nThe Community Hub Team`,
        }).catch(() => {});
      }
      // Admin alert
      base44.integrations.Core.SendEmail({
        from_name: "Community Hub",
        to: "mary@maryhayden.com",
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
            {step === 1 ? "Submit Your Listing" : step === 2 ? "Choose Your Plan" : "Submission Received!"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Fill in the details below. You'll choose your plan on the next step.
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

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleDetailsNext}>Next: Choose Plan →</Button>
            </div>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Your listing will be reviewed before going live. Choose the plan that suits you best.
            </p>

            {/* Free */}
            <div className="border rounded-xl p-5 space-y-3 hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">Free Basic Listing</p>
                  <p className="text-muted-foreground text-sm">Get listed at no cost</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">€0</p>
                  <p className="text-xs text-muted-foreground">forever free</p>
                </div>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Name, location & description</li>
                <li>✓ Visible in the directory</li>
                <li>✓ Contact details</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={handleFreeSubmit} disabled={saving}>
                {saving && !plan ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Submit Free Listing"}
              </Button>
            </div>

            {/* Monthly */}
            <div className="border rounded-xl p-5 space-y-3 hover:border-primary transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">Monthly</p>
                  <p className="text-muted-foreground text-sm">Cancel any time</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">€20</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Full listing profile</li>
                <li>✓ Social links & featured placement</li>
              </ul>
              <Button className="w-full" onClick={() => handlePayment('monthly')} disabled={saving}>
                {saving && plan === 'monthly' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</> : "Subscribe Monthly — €20/mo"}
              </Button>
            </div>

            {/* Annual */}
            <div className="border-2 border-primary rounded-xl p-5 space-y-3 relative">
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Best Value — Save €40
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">Annual</p>
                  <p className="text-muted-foreground text-sm">Pay once, listed all year</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">€200</p>
                  <p className="text-xs text-muted-foreground">per year</p>
                </div>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Full listing profile</li>
                <li>✓ Social links & featured placement</li>
                <li>✓ 2 months free vs monthly</li>
              </ul>
              <Button className="w-full" onClick={() => handlePayment('annual')} disabled={saving}>
                {saving && plan === 'annual' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</> : "Subscribe Annually — €200/yr"}
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(1)}>
              ← Back to listing details
            </Button>
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
            <Button onClick={handleClose} className="w-full" style={{ background: "#097275" }}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
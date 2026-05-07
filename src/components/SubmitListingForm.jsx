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
  const [step, setStep] = useState(1); // 1 = details, 2 = payment
  const [form, setForm] = useState({
    name: "", type: "", county: "", town: "", description: "",
    phone: "", email: "", website: "", contact_name: ""
  });
  const [plan, setPlan] = useState(null); // 'monthly' or 'annual'
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleDetailsNext = () => {
    if (!form.name || !form.type || !form.county || !form.town || !form.contact_name || !form.email) {
      alert("Please fill in all required fields (marked with *).");
      return;
    }
    setStep(2);
  };

  const handlePayment = async (selectedPlan) => {
    setPlan(selectedPlan);
    setSaving(true);

    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      alert("Payment checkout only works from the published app, not the preview.");
      setSaving(false);
      return;
    }

    try {
      // First send notification email
      await base44.integrations.Core.SendEmail({
        to: "mary@maryhayden.com",
        subject: `New Listing Submission: ${form.name}`,
        body: `A new listing has been submitted:\n\n` +
          `Name: ${form.name}\nType: ${form.type}\nCounty: ${form.county}\nTown: ${form.town}\n\n` +
          `Contact Name: ${form.contact_name}\nContact Email: ${form.email}\nPhone: ${form.phone || "N/A"}\nWebsite: ${form.website || "N/A"}\n\n` +
          `Description:\n${form.description || "N/A"}\n\n` +
          `Plan selected: ${selectedPlan === 'monthly' ? '€20/month' : '€200/year'}\n\n` +
          `Please log in to the admin panel to review and publish this listing.`,
      });

      // Create Stripe checkout session
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
      alert("Something went wrong: " + err.message);
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", type: "", county: "", town: "", description: "", phone: "", email: "", website: "", contact_name: "" });
    setStep(1);
    setPlan(null);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            {step === 1 ? "Submit Your Listing" : "Choose Your Plan"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Fill in the details below. You'll choose your subscription plan on the next step.
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
              <Button onClick={handleDetailsNext}>
                Next: Choose Plan →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 mt-1">
            <p className="text-sm text-muted-foreground">
              Your listing will go live once payment is confirmed. Choose the plan that suits you best.
            </p>

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
                <li>✓ Visible to local searchers</li>
                <li>✓ Contact details & social links</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handlePayment('monthly')}
                disabled={saving && plan === 'monthly'}
              >
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
                <li>✓ Visible to local searchers</li>
                <li>✓ Contact details & social links</li>
                <li>✓ 2 months free vs monthly</li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handlePayment('annual')}
                disabled={saving && plan === 'annual'}
              >
                {saving && plan === 'annual' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</> : "Subscribe Annually — €200/yr"}
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(1)}>
              ← Back to listing details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
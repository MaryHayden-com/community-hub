import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ClaimListingForm({ listing, onClose, user }) {
  const [form, setForm] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    role: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consented, setConsented] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast({ title: "Required", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (!consented) {
      toast({ title: "Consent required", description: "Please confirm you agree to our Privacy Policy.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.entities.ClaimRequest.create({
      listing_id: listing.id,
      listing_name: listing.name,
      ...form,
      status: "pending",
    });
    // Send confirmation to claimant
    base44.integrations.Core.SendEmail({
      from_name: "Community Hub",
      to: form.email,
      subject: `We've received your claim request — ${listing.name}`,
      body: `Hi ${form.name.split(" ")[0]},\n\nThank you for claiming "${listing.name}" on Community Hub.\n\nWe'll review your request and be in touch within 1–2 business days. Once approved, you'll receive an invitation to manage your listing.\n\nBest regards,\nThe Community Hub Team`,
    }).catch(() => {});
    // Alert admin
    base44.integrations.Core.SendEmail({
      from_name: "Community Hub",
      to: "mary@maryhayden.com",
      subject: `New claim request: ${listing.name}`,
      body: `A new claim request has been submitted.\n\nListing: ${listing.name}\nClaimant: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "—"}\nRole: ${form.role || "—"}\nMessage: ${form.message || "—"}\n\nReview in Admin → Claim Requests.`,
    }).catch(() => {});
    setSubmitted(true);
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim this Listing</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-lg">Request Submitted!</p>
            <p className="text-sm text-muted-foreground">
              We've received your claim for <strong>{listing.name}</strong>. We'll review it and be in touch shortly.
            </p>
            <Button onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Claim ownership of <strong>{listing.name}</strong>. We'll review your request and send you an invitation to manage this listing.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Your Name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Mary Murphy" />
              </div>
              <div>
                <Label>Role / Position</Label>
                <Input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="e.g. Owner, Secretary" />
              </div>
            </div>

            <div>
              <Label>Email Address *</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.ie" type="email" readOnly={!!user} />
              {!!user && <p className="text-xs text-muted-foreground mt-1">Linked to your signed-in account.</p>}
            </div>

            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 087 123 4567" />
            </div>

            <div>
              <Label>Message (optional)</Label>
              <Textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Tell us a bit about your connection to this listing..."
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="gdpr-consent"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 cursor-pointer shrink-0"
              />
              <label htmlFor="gdpr-consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I confirm I have the right to claim this listing and consent to my contact information being stored and used to process this request, in accordance with the{" "}
                <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !consented}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Submit Claim
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, Trash2 } from "lucide-react";

export default function RemovalRequestForm({ listing, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.reason) {
      toast({ title: "Required", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.integrations.Core.SendEmail({
      to: "privacy@communityhub.ie",
      subject: `Listing Removal Request: ${listing.name}`,
      body: `Listing Removal Request\n\nListing: ${listing.name} (ID: ${listing.id})\nCounty: ${listing.county}\n\nRequested by: ${form.name}\nEmail: ${form.email}\n\nReason:\n${form.reason}`,
    });
    setSubmitted(true);
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            Request Listing Removal
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-lg">Request Sent</p>
            <p className="text-sm text-muted-foreground">
              We've received your removal request for <strong>{listing.name}</strong>. We'll review it within 30 days in line with our Privacy Policy.
            </p>
            <Button onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              If you believe this listing should be removed under GDPR or for another reason, please tell us why. We'll review your request within 30 days.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Your Name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.ie" type="email" />
              </div>
            </div>

            <div>
              <Label>Reason for Removal *</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                placeholder="e.g. This listing contains my personal data and I request it be removed under GDPR Article 17 (Right to Erasure)."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving} variant="destructive">
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
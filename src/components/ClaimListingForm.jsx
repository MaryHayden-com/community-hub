import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ClaimListingForm({ listing, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast({ title: "Required", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.entities.ClaimRequest.create({
      listing_id: listing.id,
      listing_name: listing.name,
      ...form,
      status: "pending",
    });
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
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.ie" type="email" />
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

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
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
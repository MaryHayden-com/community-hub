import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, Flag } from "lucide-react";

export default function ReportListingForm({ listing, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", details: "" });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.details || (!form.email && !form.phone)) {
      toast({ title: "Required", description: "Please describe the issue and give us an email or phone number so we can follow up.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.integrations.Core.SendEmail({
      to: "communitywhatson@gmail.com",
      from_name: "Hub4Community",
      subject: `Listing Reported: ${listing.name}`,
      body: `A listing has been reported.\n\nListing: ${listing.name} (ID: ${listing.id})\nCounty: ${listing.county}\n\nReported by: ${form.name || "Not provided"}\nEmail: ${form.email || "Not provided"}\nPhone: ${form.phone || "Not provided"}\n\nIssue:\n${form.details}`,
    });
    setSubmitted(true);
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            Report a Listing
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-lg">Report Sent</p>
            <p className="text-sm text-muted-foreground">
              Thanks for flagging <strong>{listing.name}</strong>. We'll look into it and follow up with you if needed.
            </p>
            <Button onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Spotted something wrong with this listing — incorrect details, closed business, inappropriate content? Let us know.
            </p>

            <div>
              <Label>Your Name</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.ie" type="email" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Please provide at least an email or phone number so we can follow up.</p>

            <div>
              <Label>What's wrong? *</Label>
              <Textarea
                value={form.details}
                onChange={(e) => update("details", e.target.value)}
                placeholder="e.g. This business has closed down."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving} variant="destructive">
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
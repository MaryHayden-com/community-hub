import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, Lightbulb } from "lucide-react";

export default function SuggestBusinessForm({ open, onClose }) {
  const [form, setForm] = useState({ business_name: "", location: "", note: "", your_name: "", your_email: "" });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    setForm({ business_name: "", location: "", note: "", your_name: "", your_email: "" });
    setSubmitted(false);
    setSaving(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.business_name) {
      toast({ title: "Required", description: "Please enter the business or group name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.integrations.Core.SendEmail({
      to: "communitywhatson@gmail.com",
      from_name: "Hub4Community",
      subject: `Business Suggestion: ${form.business_name}`,
      body: `Someone suggested a business/group to add to the directory.\n\nName: ${form.business_name}\nLocation: ${form.location || "Not provided"}\nNote: ${form.note || "Not provided"}\n\nSuggested by: ${form.your_name || "Anonymous"}${form.your_email ? ` (${form.your_email})` : ""}`,
    });
    setSubmitted(true);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            Suggest a Business
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <p className="font-semibold text-lg">Thanks for the tip!</p>
            <p className="text-sm text-muted-foreground">
              We'll follow up with <strong>{form.business_name}</strong> about joining the directory.
            </p>
            <Button onClick={handleClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Know a business, club or service that should be on the Hub? Tell us and we'll reach out to them.
            </p>

            <div>
              <Label>Business / Group Name *</Label>
              <Input value={form.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="e.g. Ballycastle Bakery" />
            </div>

            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Town, county" />
            </div>

            <div>
              <Label>Anything else we should know?</Label>
              <Textarea value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="Optional" rows={3} />
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Your Details (optional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Your Name</Label>
                  <Input value={form.your_name} onChange={(e) => update("your_name", e.target.value)} />
                </div>
                <div>
                  <Label>Your Email</Label>
                  <Input value={form.your_email} onChange={(e) => update("your_email", e.target.value)} type="email" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving} style={{ background: "#E2701B", border: "none" }}>
                {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Send Suggestion
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
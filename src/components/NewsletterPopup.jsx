import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewsletterSignup from "@/components/NewsletterSignup";

const DISMISS_KEY = "newsletter_popup_dismissed";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: "#097275" }}>📬 Stay in the loop</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Get the latest local events, news and listings delivered to your inbox.
        </p>
        <NewsletterSignup source="popup" className="mt-2" />
      </DialogContent>
    </Dialog>
  );
}
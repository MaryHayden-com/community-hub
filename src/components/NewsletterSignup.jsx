import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterSignup({ source = "footer", className = "" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await base44.entities.NewsletterSignup.create({ email, name, source });
      setSubmitted(true);
    } catch (err) {
      // Silently succeed even on duplicate
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 text-sm text-emerald-600 font-medium ${className}`}>
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        You're in! We'll keep you updated on local events.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <div className="flex items-center gap-2 flex-1">
        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 bg-background"
        />
      </div>
      <Button type="submit" disabled={loading} style={{ background: '#097275' }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Stay Updated"}
      </Button>
    </form>
  );
}
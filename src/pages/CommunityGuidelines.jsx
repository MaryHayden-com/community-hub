import { Link } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";

export default function CommunityGuidelines() {
  usePageTitle("Community Guidelines", {
    description: "How we keep Hub4Community welcoming, accurate and useful for everyone across Bandon, West Cork and Ireland.",
    path: "/guidelines",
  });
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
        <span style={{ color: "#E2701B" }}>Hub4</span><span style={{ color: "#097275" }}>Community</span>
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#097275" }}>Community Guidelines</h1>
      <p className="text-base leading-relaxed mb-4" style={{ color: "#333333" }}>
        Hub4Community brings local businesses, clubs, services and events together in one place. These guidelines help keep it welcoming, accurate and genuinely useful for everyone.
      </p>
      <ol className="space-y-3 text-sm leading-relaxed" style={{ color: "#333333" }}>
        <li><strong style={{ color: "#097275" }}>Be accurate and honest.</strong> Listings should describe real organisations, with correct contact details and up-to-date information. Misleading claims aren't welcome.</li>
        <li><strong style={{ color: "#097275" }}>Keep it respectful.</strong> Treat other organisations and community members with kindness. No abusive, discriminatory or harassing content.</li>
        <li><strong style={{ color: "#097275" }}>Add real local value.</strong> Listings, events and notices should be relevant to the communities they serve. Spam, repeated self-promotion and off-topic posts will be removed.</li>
        <li><strong style={{ color: "#097275" }}>Respect privacy and rights.</strong> Only share details you're allowed to share, including images and contact information. Don't post personal details about others without their consent.</li>
        <li><strong style={{ color: "#097275" }}>Help us keep it current.</strong> If you spot something out of date, incorrect or no longer running, let us know so the directory stays trustworthy.</li>
      </ol>
      <p className="text-sm mt-6 text-muted-foreground">
        Listings or content that break these guidelines may be edited or removed. Want to report something? <a href="mailto:communitywhatson@gmail.com" className="underline underline-offset-2" style={{ color: "#097275" }}>Email us</a>.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/directory" className="rounded-lg px-4 py-2.5 text-white text-sm font-bold min-h-[44px] flex items-center" style={{ background: "#097275" }}>Back to the directory</Link>
        <Link to="/terms" className="rounded-lg px-4 py-2.5 text-sm font-bold min-h-[44px] flex items-center border" style={{ borderColor: "#097275", color: "#097275" }}>Terms of use</Link>
      </div>
    </div>
  );
}
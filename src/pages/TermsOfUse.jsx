import { Link } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";

export default function TermsOfUse() {
  usePageTitle("Terms of Use", {
    description: "The terms for using Hub4Community, including listings, events and contributions across Bandon, West Cork and Ireland.",
    path: "/terms",
  });
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
        <span style={{ color: "#E2701B" }}>Hub4</span><span style={{ color: "#097275" }}>Community</span>
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#097275" }}>Terms of Use</h1>
      <p className="text-base leading-relaxed mb-4" style={{ color: "#333333" }}>
        By using Hub4Community, you agree to these simple terms. They help keep the directory useful and trustworthy for communities across Ireland, with a strong local starting point in Bandon and West Cork.
      </p>
      <ol className="space-y-3 text-sm leading-relaxed" style={{ color: "#333333" }}>
        <li><strong style={{ color: "#097275" }}>Your contributions.</strong> When you add a listing, event or notice, you confirm the information is accurate to the best of your knowledge and that you're allowed to share it. You're responsible for keeping your details up to date.</li>
        <li><strong style={{ color: "#097275" }}>Use of the site.</strong> You'll use Hub4Community lawfully and respectfully, and won't misuse, copy, scrape or disrupt the platform or its listings.</li>
        <li><strong style={{ color: "#097275" }}>Listings and accuracy.</strong> We do our best to keep information current, but we can't guarantee every detail is complete or up to date. Always check directly with the organisation before relying on times, dates or contact details.</li>
        <li><strong style={{ color: "#097275" }}>No warranty.</strong> Hub4Community is provided as-is. To the extent permitted by law, we aren't liable for losses arising from the use of listings or content on the site.</li>
        <li><strong style={{ color: "#097275" }}>Removals.</strong> We may edit or remove listings or content that break our <Link to="/guidelines" className="underline underline-offset-2" style={{ color: "#097275" }}>Community Guidelines</Link> or these terms.</li>
        <li><strong style={{ color: "#097275" }}>Changes.</strong> These terms may be updated from time to time. Continued use of the site means you accept the latest version.</li>
      </ol>
      <p className="text-sm mt-6 text-muted-foreground">
        Questions about these terms? <a href="mailto:communitywhatson@gmail.com" className="underline underline-offset-2" style={{ color: "#097275" }}>Email us</a>.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/directory" className="rounded-lg px-4 py-2.5 text-white text-sm font-bold min-h-[44px] flex items-center" style={{ background: "#097275" }}>Back to the directory</Link>
        <Link to="/privacy" className="rounded-lg px-4 py-2.5 text-sm font-bold min-h-[44px] flex items-center border" style={{ borderColor: "#097275", color: "#097275" }}>Privacy policy</Link>
      </div>
    </div>
  );
}
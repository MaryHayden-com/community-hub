import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

export default function PrivacyPolicy() {
  usePageTitle("Privacy Policy");
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: April 2025</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-8">

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">1. Who We Are</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hub4Community is an online directory connecting people with local businesses, clubs, groups, educational 
            institutions, and events across Ireland. We are committed to protecting your personal data and being 
            transparent about how we use it in accordance with the General Data Protection Regulation (GDPR) and 
            the Irish Data Protection Act 2018.
          </p>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">2. What Data We Collect</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">We collect the following types of data:</p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li><strong className="text-foreground">Listing information:</strong> Business/group names, addresses, phone numbers, email addresses, websites, and social media links submitted for directory inclusion.</li>
            <li><strong className="text-foreground">Claim request data:</strong> Your name, email, phone number, and role when you submit a claim to manage a listing.</li>
            <li><strong className="text-foreground">Account data:</strong> Email address and name when you register as a listing owner/manager.</li>
            <li><strong className="text-foreground">Usage data:</strong> Anonymous analytics such as page views to help us improve the directory.</li>
          </ul>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">3. Why We Collect Your Data (Lawful Basis)</h2>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li><strong className="text-foreground">Legitimate interest:</strong> Publishing publicly available business and community information to benefit the local community.</li>
            <li><strong className="text-foreground">Consent:</strong> When you submit a listing or claim request, you explicitly consent to the publication of that information.</li>
            <li><strong className="text-foreground">Contract:</strong> To provide listing management services to verified owners.</li>
          </ul>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">4. How We Use Your Data</h2>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li>To display your listing in the Hub4Community directory</li>
            <li>To process and review listing claim requests</li>
            <li>To contact you regarding your listing or claim</li>
            <li>To improve the directory and user experience</li>
            <li>We do <strong className="text-foreground">not</strong> sell your data to third parties</li>
            <li>We do <strong className="text-foreground">not</strong> use your data for marketing without consent</li>
          </ul>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">5. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Listing data is retained for as long as the listing is active in our directory. Claim request data is 
            retained for up to 12 months after resolution. You may request deletion at any time (see Your Rights below).
          </p>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">6. Your Rights Under GDPR</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">You have the right to:</p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong className="text-foreground">Rectification:</strong> Ask us to correct inaccurate or incomplete data.</li>
            <li><strong className="text-foreground">Erasure:</strong> Request removal of your listing or personal data from our directory.</li>
            <li><strong className="text-foreground">Restriction:</strong> Ask us to limit how we use your data.</li>
            <li><strong className="text-foreground">Portability:</strong> Request your data in a portable format.</li>
            <li><strong className="text-foreground">Object:</strong> Object to processing based on legitimate interest.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            To exercise any of these rights, please contact us at: <a href="mailto:privacy@communityhub.ie" className="text-primary hover:underline">privacy@communityhub.ie</a>
          </p>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">7. Listing Removal Requests</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you believe a listing contains incorrect or personal information about you, or you wish to have a 
            listing removed, you can use the "Request Removal" option on any listing page, or contact us directly 
            at <a href="mailto:privacy@communityhub.ie" className="text-primary hover:underline">privacy@communityhub.ie</a>. 
            We aim to respond within 30 days.
          </p>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">8. Third-Party Services</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our directory may display links to external websites. We are not responsible for the privacy practices 
            of those sites. We use secure, GDPR-compliant infrastructure to store all data.
          </p>
        </section>

        <section className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-2">9. Contact & Complaints</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have concerns about how we handle your data, you can contact us at{" "}
            <a href="mailto:privacy@communityhub.ie" className="text-primary hover:underline">privacy@communityhub.ie</a>.{" "}
            You also have the right to lodge a complaint with the Irish Data Protection Commission:{" "}
            <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.dataprotection.ie</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
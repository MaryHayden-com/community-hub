import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, CreditCard, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlanSelector from "@/components/PlanSelector";
import usePageTitle from "@/hooks/usePageTitle";

const PLAN_LABELS = { basic: "Basic (Free)", standard: "Standard", premium: "Premium" };
const PLAN_COLORS = { basic: "bg-muted text-muted-foreground", standard: "bg-primary/10 text-primary", premium: "bg-amber-100 text-amber-800" };

export default function Billing() {
  usePageTitle("Billing & Plans");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const all = await base44.entities.CommunityListing.list();
        setListings(all.filter(l => l.owner_email === me.email));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const isInIframe = () => {
    try { return window.self !== window.top; } catch { return true; }
  };

  const handleUpgrade = async (listing, plan) => {
    if (plan === "basic") return;
    if (isInIframe()) {
      alert("Stripe checkout only works from the published app. Please open the app in a new tab.");
      return;
    }
    setUpgrading(listing.id + plan);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", {
        plan,
        listing_id: listing.id,
        listing_name: listing.name,
        contact_name: user?.full_name || "",
        email: user?.email,
        success_url: window.location.href + "?success=1",
        cancel_url: window.location.href,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      setError(e.message);
    } finally {
      setUpgrading(null);
    }
  };

  const handleBillingPortal = async () => {
    if (isInIframe()) {
      alert("Billing portal only works from the published app. Please open the app in a new tab.");
      return;
    }
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke("getBillingPortalUrl", {
        return_url: window.location.href,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      setError(e.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success") === "1";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Billing & Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your listing subscriptions</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleBillingPortal} disabled={portalLoading} className="gap-2">
          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Manage Billing
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 mb-6">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-medium">Payment successful!</p>
            <p className="text-sm">Your plan has been upgraded. It may take a moment to reflect.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20">
          <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No claimed listings</p>
          <p className="text-sm text-muted-foreground mt-1">Claim a listing first to manage its plan.</p>
          <Link to="/directory">
            <Button variant="outline" className="mt-4">Browse Directory</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {listings.map((listing) => (
            <div key={listing.id} className="border rounded-xl overflow-hidden">
              <div className="p-5 bg-muted/30 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">{listing.name}</h2>
                  <p className="text-sm text-muted-foreground">{listing.town}, Co. {listing.county}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={PLAN_COLORS[listing.plan || "basic"]}>
                    {PLAN_LABELS[listing.plan || "basic"]}
                  </Badge>
                  {listing.plan_renewal_date && (listing.plan || "basic") !== "basic" && (
                    <p className="text-xs text-muted-foreground">
                      Renews {new Date(listing.plan_renewal_date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {listing.plan_status === "cancelled" && (
                    <p className="text-xs text-red-600">Cancelled</p>
                  )}
                </div>
              </div>
              <div className="p-5">
                <PlanSelector
                  currentPlan={listing.plan || "basic"}
                  onSelect={(plan) => handleUpgrade(listing, plan)}
                  loading={!!upgrading}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
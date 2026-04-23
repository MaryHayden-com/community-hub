import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Mail, Phone } from "lucide-react";

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminClaimRequests() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ClaimRequest.list("-created_date", 200)
      .then(setClaims)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (claim) => {
    setActionId(claim.id);
    // Optimistic update
    setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, status: "approved" } : c));
    await base44.entities.ClaimRequest.update(claim.id, { status: "approved" });
    await base44.entities.CommunityListing.update(claim.listing_id, { owner_email: claim.email });
    await base44.users.inviteUser(claim.email, "user");
    await base44.integrations.Core.SendEmail({
      to: claim.email,
      subject: `Your listing claim has been approved – ${claim.listing_name}`,
      body: `Hi ${claim.name},\n\nGreat news! Your request to claim the listing "${claim.listing_name}" on our community directory has been approved.\n\nYou can now log in to manage your listing, update your details, and more.\n\nIf you haven't already, you should receive a separate invitation email to set up your account.\n\nThanks for being part of the community!\n\nThe Community Directory Team`,
    });
    toast({ title: "Approved & Invited", description: `${claim.email} has been approved and notified.` });
    setActionId(null);
  };

  const handleReject = async (claim) => {
    setActionId(claim.id);
    // Optimistic update
    setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, status: "rejected" } : c));
    await base44.entities.ClaimRequest.update(claim.id, { status: "rejected" });
    toast({ title: "Rejected", description: `Claim from ${claim.name} rejected.` });
    setActionId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingClaims = claims.filter((c) => c.status === "pending");
  const resolvedClaims = claims.filter((c) => c.status !== "pending");

  if (claims.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>No claim requests yet.</p>
      </div>
    );
  }

  const displayClaims = showResolved ? resolvedClaims : pendingClaims;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowResolved(false)}
          className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${!showResolved ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/40"}`}
        >
          Pending ({pendingClaims.length})
        </button>
        <button
          onClick={() => setShowResolved(true)}
          className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${showResolved ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/40"}`}
        >
          Resolved ({resolvedClaims.length})
        </button>
      </div>

      {displayClaims.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          <p>{showResolved ? "No approved or rejected claims yet." : "No pending claim requests."}</p>
        </div>
      ) : (
        <div className="space-y-3">
      {displayClaims.map((claim) => (
        <div key={claim.id} className="bg-card border rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{claim.name}</p>
                {claim.role && <span className="text-xs text-muted-foreground">· {claim.role}</span>}
                <Badge variant="outline" className={`text-xs ${statusColors[claim.status] || ""}`}>
                  {claim.status}
                </Badge>
              </div>
              <p className="text-sm text-primary font-medium">{claim.listing_name}</p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {claim.email}</span>
                {claim.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {claim.phone}</span>}
              </div>
              {claim.message && (
                <p className="text-sm text-muted-foreground italic mt-1">"{claim.message}"</p>
              )}
              <p className="text-xs text-muted-foreground">
                Submitted {new Date(claim.created_date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            {claim.status === "pending" && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={actionId === claim.id}
                  onClick={() => handleReject(claim)}
                >
                  {actionId === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={actionId === claim.id}
                  onClick={() => handleApprove(claim)}
                >
                  {actionId === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  Approve & Invite
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  );
}
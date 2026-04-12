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

  const load = () => {
    setLoading(true);
    base44.entities.ClaimRequest.list("-created_date", 200)
      .then(setClaims)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (claim) => {
    setActionId(claim.id);
    await base44.entities.ClaimRequest.update(claim.id, { status: "approved" });
    // Link the owner email to the listing
    await base44.entities.CommunityListing.update(claim.listing_id, { owner_email: claim.email });
    // Invite the user
    await base44.users.inviteUser(claim.email, "user");
    toast({ title: "Approved & Invited", description: `${claim.email} has been invited to manage ${claim.listing_name}.` });
    setActionId(null);
    load();
  };

  const handleReject = async (claim) => {
    setActionId(claim.id);
    await base44.entities.ClaimRequest.update(claim.id, { status: "rejected" });
    toast({ title: "Rejected", description: `Claim from ${claim.name} rejected.` });
    setActionId(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>No claim requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
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
  );
}
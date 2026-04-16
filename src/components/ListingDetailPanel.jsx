import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { X, Link as LinkIcon, ShieldCheck, ShieldOff, ExternalLink, Send, UserCheck, CheckCircle2, Circle, ArrowRightLeft, ChevronDown } from "lucide-react";
import ActionDueBadge from "./ActionDueBadge";
import { format } from "date-fns";

const ACTION_TYPE_LABELS = {
  follow_up: "Follow Up", call: "Call", email: "Email", visit: "Visit",
  review: "Review", note: "Note", ownership_transfer: "Ownership Transfer",
  claim_approved: "Claim Approved", claim_rejected: "Claim Rejected",
  verified: "Verified", unverified: "Unverified", plan_upgrade: "Plan Upgrade", other: "Other",
};

const ACTION_ICONS = {
  follow_up: "🔁", call: "📞", email: "✉️", visit: "📍", review: "🔍",
  note: "📝", ownership_transfer: "🔀", claim_approved: "✅", claim_rejected: "❌",
  verified: "🛡️", unverified: "⚠️", plan_upgrade: "⭐", other: "•",
};

const SYSTEM_TYPES = ["verified", "unverified", "claim_approved", "claim_rejected", "ownership_transfer", "plan_upgrade"];

export default function ListingDetailPanel({ listing, onClose, onListingUpdated, currentUser }) {
  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newActionType, setNewActionType] = useState("note");
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [transferEmail, setTransferEmail] = useState(listing.owner_email || "");
  const [transferMode, setTransferMode] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadActions = () => {
    setLoadingActions(true);
    base44.entities.ListingAction.filter({ listing_id: listing.id })
      .then((data) => setActions(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))))
      .finally(() => setLoadingActions(false));
  };

  useEffect(() => {
    loadActions();
  }, [listing.id]);

  const handleAddAction = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    await base44.entities.ListingAction.create({
      listing_id: listing.id,
      listing_name: listing.name,
      action_type: newActionType,
      note: newNote,
      due_date: newDueDate || undefined,
      is_done: false,
      created_by_name: currentUser?.full_name || currentUser?.email || "Admin",
    });
    setNewNote("");
    setNewDueDate("");
    setNewActionType("note");
    setSaving(false);
    loadActions();
    toast({ title: "Action added" });
  };

  const handleToggleDone = async (action) => {
    await base44.entities.ListingAction.update(action.id, {
      is_done: !action.is_done,
      done_date: !action.is_done ? new Date().toISOString().slice(0, 10) : undefined,
    });
    loadActions();
  };

  const handleVerifyToggle = async () => {
    const newVal = !listing.is_verified;
    await base44.entities.CommunityListing.update(listing.id, { is_verified: newVal });
    await base44.entities.ListingAction.create({
      listing_id: listing.id, listing_name: listing.name,
      action_type: newVal ? "verified" : "unverified",
      note: `Marked as ${newVal ? "verified" : "unverified"}`,
      is_done: true,
      created_by_name: currentUser?.full_name || "Admin",
    });
    loadActions();
    onListingUpdated?.();
  };

  const handleTransferOwnership = async () => {
    if (!transferEmail.trim()) return;
    setTransferring(true);
    await base44.entities.CommunityListing.update(listing.id, { owner_email: transferEmail.trim() });
    await base44.entities.ListingAction.create({
      listing_id: listing.id, listing_name: listing.name,
      action_type: "ownership_transfer",
      note: `Ownership transferred to ${transferEmail.trim()} by ${currentUser?.full_name || currentUser?.email}`,
      is_done: true,
      created_by_name: currentUser?.full_name || currentUser?.email || "Admin",
    });
    try {
      const existing = await base44.entities.User.filter({ email: transferEmail.trim() });
      if (existing.length > 0 && existing[0].role !== "admin") {
        await base44.entities.User.update(existing[0].id, { role: "listing_owner" });
      } else if (existing.length === 0) {
        await base44.users.inviteUser(transferEmail.trim(), "listing_owner");
      }
    } catch {}
    toast({ title: "Ownership transferred", description: `Listing now owned by ${transferEmail.trim()}` });
    setTransferring(false);
    setTransferMode(false);
    loadActions();
    onListingUpdated?.();
  };

  const pendingActions = actions.filter((a) => !a.is_done && a.due_date);
  const history = actions.filter((a) => a.is_done || !a.due_date);

  return (
    <div className="border-t border-b-0 bg-muted/20 px-4 py-4 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{listing.type}</Badge>
            {listing.is_verified && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" />Verified
              </Badge>
            )}
            {listing.plan && listing.plan !== "basic" && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                {listing.plan}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <h3 className="font-semibold text-base">{listing.name}</h3>
            <span className="text-sm text-muted-foreground">{listing.town}, Co. {listing.county}</span>
            {listing.owner_email && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <UserCheck className="w-3 h-3" />{listing.owner_email}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <a href={`/listing/${listing.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
          </a>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5" onClick={handleVerifyToggle}>
          {listing.is_verified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {listing.is_verified ? "Unverify" : "Verify"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5" onClick={() => setTransferMode(!transferMode)}>
          <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Owner
        </Button>
        {listing.website && (
          <a href={listing.website} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Website</Button>
          </a>
        )}
        {listing.email && (
          <a href={`mailto:${listing.email}`}>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5">✉️ Email</Button>
          </a>
        )}
        {listing.phone && (
          <a href={`tel:${listing.phone}`}>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1.5">📞 Call</Button>
          </a>
        )}
      </div>

      {/* Transfer ownership */}
      {transferMode && (
        <div className="flex gap-2 items-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <Input
            placeholder="New owner email..."
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            className="text-sm h-8 flex-1"
          />
          <Button size="sm" onClick={handleTransferOwnership} disabled={transferring} className="shrink-0">
            {transferring ? "Transferring…" : "Transfer"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setTransferMode(false)}>Cancel</Button>
        </div>
      )}

      {/* Add note / action */}
      <div className="bg-card border rounded-lg p-3 space-y-2">
        <div className="flex gap-2">
          <Select value={newActionType} onValueChange={setNewActionType}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["note", "follow_up", "call", "email", "visit", "review", "other"].map((t) => (
                <SelectItem key={t} value={t} className="text-xs">{ACTION_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="h-8 text-xs w-36"
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a note or reminder..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddAction()}
          />
          <Button size="sm" onClick={handleAddAction} disabled={saving || !newNote.trim()} className="shrink-0 h-8">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Upcoming actions */}
      {loadingActions ? (
        <p className="text-xs text-muted-foreground">Loading activity...</p>
      ) : (
        <div className="space-y-1">
          {pendingActions.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">Upcoming Reminders</p>
              {pendingActions.map((a) => <ActionRow key={a.id} action={a} onToggle={handleToggleDone} />)}
            </>
          )}

          {/* History collapsible */}
          {history.length > 0 && (
            <div className="pt-1">
              <button
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors pb-1"
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
                History ({history.length})
              </button>
              {historyOpen && history.map((a) => <ActionRow key={a.id} action={a} onToggle={handleToggleDone} />)}
            </div>
          )}

          {actions.length === 0 && (
            <p className="text-xs text-muted-foreground italic py-1">No activity yet. Add a note above.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ActionRow({ action, onToggle }) {
  const icon = ACTION_ICONS[action.action_type] || "•";
  const label = ACTION_TYPE_LABELS[action.action_type] || action.action_type;
  const isSystem = SYSTEM_TYPES.includes(action.action_type);

  return (
    <div className={`flex items-start gap-3 py-2 px-3 rounded-lg text-sm ${action.is_done || isSystem ? "opacity-60" : "bg-card border"}`}>
      <button
        className={`mt-0.5 shrink-0 ${isSystem ? "cursor-default" : "cursor-pointer hover:opacity-70"}`}
        onClick={() => !isSystem && onToggle(action)}
        disabled={isSystem}
      >
        {action.is_done || isSystem
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          : <Circle className="w-4 h-4 text-muted-foreground" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">{icon} {label}</span>
          {action.due_date && <ActionDueBadge dueDate={action.due_date} isDone={action.is_done} />}
        </div>
        {action.note && <p className="text-sm text-foreground mt-0.5 leading-snug">{action.note}</p>}
        <p className="text-xs text-muted-foreground mt-0.5">
          {action.created_by_name && `${action.created_by_name} · `}
          {format(new Date(action.created_date), "d MMM yyyy")}
          {action.done_date && ` · Done ${format(new Date(action.done_date + "T12:00:00"), "d MMM")}`}
        </p>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { X, Link as LinkIcon, ShieldCheck, ShieldOff, ExternalLink, Send, UserCheck, CheckCircle2, Circle, Pencil, ArrowRightLeft } from "lucide-react";
import ActionDueBadge from "./ActionDueBadge";
import { format } from "date-fns";

const ACTION_TYPE_LABELS = {
  follow_up: "Follow Up",
  call: "Call",
  email: "Email",
  visit: "Visit",
  review: "Review",
  note: "Note",
  ownership_transfer: "Ownership Transfer",
  claim_approved: "Claim Approved",
  claim_rejected: "Claim Rejected",
  verified: "Verified",
  unverified: "Unverified",
  plan_upgrade: "Plan Upgrade",
  other: "Other",
};

const ACTION_ICONS = {
  follow_up: "🔁",
  call: "📞",
  email: "✉️",
  visit: "📍",
  review: "🔍",
  note: "📝",
  ownership_transfer: "🔀",
  claim_approved: "✅",
  claim_rejected: "❌",
  verified: "🛡️",
  unverified: "⚠️",
  plan_upgrade: "⭐",
  other: "•",
};

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
  const [users, setUsers] = useState([]);

  const loadActions = () => {
    setLoadingActions(true);
    base44.entities.ListingAction.filter({ listing_id: listing.id })
      .then((data) => setActions(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))))
      .finally(() => setLoadingActions(false));
  };

  useEffect(() => {
    loadActions();
    base44.entities.User.list().then(setUsers).catch(() => {});
  }, [listing.id]);

  const handleAddAction = async () => {
    if (!newNote.trim() && newActionType === "note") return;
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

  const handleTransferOwnership = async () => {
    if (!transferEmail.trim()) return;
    setTransferring(true);
    await base44.entities.CommunityListing.update(listing.id, { owner_email: transferEmail.trim() });
    // Log the action
    await base44.entities.ListingAction.create({
      listing_id: listing.id,
      listing_name: listing.name,
      action_type: "ownership_transfer",
      note: `Ownership transferred to ${transferEmail.trim()} by ${currentUser?.full_name || currentUser?.email}`,
      is_done: true,
      created_by_name: currentUser?.full_name || currentUser?.email || "Admin",
    });
    // Try to upgrade the new owner's role
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
  const completedOrNotes = actions.filter((a) => a.is_done || !a.due_date);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-background shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b bg-card">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{listing.type}</Badge>
              {listing.is_verified && <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>}
              {listing.is_featured && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Featured</Badge>}
            </div>
            <h2 className="font-display text-xl font-bold mt-1 truncate">{listing.name}</h2>
            <p className="text-sm text-muted-foreground">{listing.town}, Co. {listing.county}</p>
            {listing.owner_email && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3 h-3" /> {listing.owner_email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <a href={`/listing/${listing.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
            </a>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 px-5 py-3 border-b bg-muted/30">
          <Button
            size="sm" variant="outline"
            className="text-xs gap-1.5"
            onClick={() => {
              onListingUpdated?.({ ...listing, is_verified: !listing.is_verified });
              base44.entities.CommunityListing.update(listing.id, { is_verified: !listing.is_verified }).then(() => {
                base44.entities.ListingAction.create({ listing_id: listing.id, listing_name: listing.name, action_type: listing.is_verified ? "unverified" : "verified", note: `Marked as ${listing.is_verified ? "unverified" : "verified"}`, is_done: true, created_by_name: currentUser?.full_name || "Admin" });
                loadActions();
              });
            }}
          >
            {listing.is_verified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {listing.is_verified ? "Unverify" : "Verify"}
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setTransferMode(!transferMode)}>
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Owner
          </Button>
          {listing.website && (
            <a href={listing.website} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Website</Button>
            </a>
          )}
        </div>

        {/* Transfer ownership panel */}
        {transferMode && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex gap-2 items-center">
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

        {/* Add action */}
        <div className="px-5 py-4 border-b space-y-2">
          <div className="flex gap-2">
            <Select value={newActionType} onValueChange={setNewActionType}>
              <SelectTrigger className="w-36 h-8 text-xs">
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
              placeholder="Due date"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a note or action..."
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

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
          {loadingActions ? (
            <div className="flex justify-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : actions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">No activity yet. Add a note or action above.</div>
          ) : (
            <>
              {pendingActions.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1 pb-2">Upcoming</p>
                  {pendingActions.map((a) => <ActionRow key={a.id} action={a} onToggle={handleToggleDone} />)}
                </>
              )}
              {completedOrNotes.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-3 pb-2">History</p>
                  {completedOrNotes.map((a) => <ActionRow key={a.id} action={a} onToggle={handleToggleDone} />)}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionRow({ action, onToggle }) {
  const icon = ACTION_ICONS[action.action_type] || "•";
  const label = ACTION_TYPE_LABELS[action.action_type] || action.action_type;
  const isSystem = ["verified", "unverified", "claim_approved", "claim_rejected", "ownership_transfer", "plan_upgrade"].includes(action.action_type);

  return (
    <div className={`flex items-start gap-3 py-2.5 px-3 rounded-lg ${action.is_done || isSystem ? "opacity-70" : "bg-card border"}`}>
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
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <span>{icon}</span> {label}
          </span>
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
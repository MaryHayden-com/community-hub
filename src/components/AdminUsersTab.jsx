import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Pencil, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ROLE_LABELS = {
  admin: "Super Admin",
  group_admin: "Group Admin",
  listing_owner: "Listing Owner",
  user: "View Only",
};

const ROLE_COLORS = {
  admin: "bg-red-50 text-red-700 border-red-200",
  group_admin: "bg-violet-50 text-violet-700 border-violet-200",
  listing_owner: "bg-blue-50 text-blue-700 border-blue-200",
  user: "bg-gray-50 text-gray-600 border-gray-200",
};

function EditUserRow({ user, onSave, onCancel }) {
  const [role, setRole] = useState(user.role || "user");
  const [tagsInput, setTagsInput] = useState((user.managed_tags || []).join(", "));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    await base44.auth.updateMe ? null : null; // not for other users
    // Use admin entity update
    await base44.entities.User.update(user.id, {
      role,
      managed_tags: role === "group_admin" ? tags : [],
    });
    setSaving(false);
    onSave();
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">{user.full_name || user.email}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {Object.entries(ROLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {role === "group_admin" && (
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs text-muted-foreground block mb-1">Managed Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="county:Leitrim, type:What's On, town:Carrick-on-Shannon"
              className="w-full border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">Format: <code>county:NAME</code>, <code>town:NAME</code>, <code>type:NAME</code>, <code>category:NAME</code></p>
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.User.list("-created_date", 500)
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = () => {
    setEditingId(null);
    toast({ title: "User updated" });
    load();
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    setInviting(true);
    try {
      // The invite API only supports "admin" or "user" base roles.
      // Invite as "admin" for admin, otherwise invite as "user" then update role.
      const baseRole = inviteRole === "admin" ? "admin" : "user";
      await base44.users.inviteUser(inviteEmail, baseRole);

      // If the desired role is a custom one, update it after invite
      if (inviteRole !== "admin" && inviteRole !== "user") {
        // Find the newly created user and update their role
        const allUsers = await base44.entities.User.list("-created_date", 500);
        const invited = allUsers.find((u) => u.email === inviteEmail);
        if (invited) {
          await base44.entities.User.update(invited.id, { role: inviteRole });
        }
      }

      toast({ title: "Invitation sent", description: `Invited ${inviteEmail} as ${ROLE_LABELS[inviteRole]}` });
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("user");
      load();
    } catch (err) {
      toast({ title: "Failed to invite", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-4">
      {/* Invite User Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite New Users
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add team members, group admins, or listing owners to the platform
          </p>
        </div>
        <Button size="lg" onClick={() => setShowInvite(true)} className="shadow-md">
          <UserPlus className="w-5 h-5 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {users.map((u) =>
        editingId === u.id ? (
          <EditUserRow key={u.id} user={u} onSave={handleSave} onCancel={() => setEditingId(null)} />
        ) : (
          <div key={u.id} className="bg-card border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{u.full_name || "—"}</p>
                <Badge variant="outline" className={`text-xs ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                  {ROLE_LABELS[u.role] || "View Only"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{u.email}</p>
              {u.managed_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.managed_tags.map((t) => (
                    <span key={t} className="text-xs bg-primary/5 text-primary border border-primary/15 rounded px-1.5 py-0.5">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditingId(u.id)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        )
      )}
    </div>
  );
}
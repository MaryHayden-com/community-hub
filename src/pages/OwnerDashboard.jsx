import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Eye, Phone, Globe, Mail, Facebook, Instagram, Linkedin, Plus, Pencil, Trash2, Crown, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NoticeForm from "../components/NoticeForm";
import OwnerListingEditForm from "../components/OwnerListingEditForm";

const METRIC_CONFIG = [
  { key: "view", label: "Profile Views", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "phone_click", label: "Phone Clicks", icon: Phone, color: "text-green-600", bg: "bg-green-50" },
  { key: "website_click", label: "Website Visits", icon: Globe, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "email_click", label: "Email Clicks", icon: Mail, color: "text-orange-600", bg: "bg-orange-50" },
];

const NOTICE_TYPE_LABELS = {
  volunteers_wanted: "Volunteers Wanted",
  job: "Job / Employment",
  announcement: "Announcement",
  event: "Event",
  other: "Other",
};

const NOTICE_TYPE_COLORS = {
  volunteers_wanted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  job: "bg-blue-50 text-blue-700 border-blue-200",
  announcement: "bg-amber-50 text-amber-700 border-amber-200",
  event: "bg-violet-50 text-violet-700 border-violet-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

function MetricCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-card border rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotice, setEditingNotice] = useState(null); // null=closed, {}=new, {...}=edit
  const [deletingNoticeId, setDeletingNoticeId] = useState(null);
  const [editingListing, setEditingListing] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=warning, 2=confirm
  const [deleteRequestSent, setDeleteRequestSent] = useState(false);
  const [sendingDelete, setSendingDelete] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.email) {
        base44.entities.CommunityListing.filter({ owner_email: u.email })
          .then((listings) => {
            setMyListings(listings);
            if (listings.length > 0) setSelectedListing(listings[0]);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.CommunityListing.subscribe((event) => {
      if (event.data?.owner_email === user.email) {
        setMyListings((prev) => {
          const exists = prev.find((l) => l.id === event.id);
          if (event.type === 'create' || event.type === 'update') {
            return exists ? prev.map((l) => l.id === event.id ? event.data : l) : [event.data, ...prev];
          } else if (event.type === 'delete') {
            return prev.filter((l) => l.id !== event.id);
          }
          return prev;
        });
      }
    });
    return unsubscribe;
  }, [user?.email]);

  useEffect(() => {
    if (!selectedListing) return;
    base44.entities.ListingEngagement.filter({ listing_id: selectedListing.id })
      .then(setEngagement)
      .catch(() => setEngagement([]));
    loadNotices();
  }, [selectedListing]);

  const loadNotices = () => {
    if (!selectedListing) return;
    base44.entities.ListingNotice.filter({ listing_id: selectedListing.id })
      .then(setNotices)
      .catch(() => setNotices([]));
  };

  const handleDeleteNotice = async (id) => {
    await base44.entities.ListingNotice.delete(id);
    setDeletingNoticeId(null);
    loadNotices();
  };

  const handleDeleteAccountRequest = async () => {
    setSendingDelete(true);
    await base44.integrations.Core.SendEmail({
      to: "privacy@communityhub.ie",
      subject: "Account Deletion Request",
      body: `User ${user?.full_name || ""} (${user?.email}) has requested deletion of their account and all associated data.`,
    });
    setSendingDelete(false);
    setDeleteRequestSent(true);
    setDeleteStep(0);
  };

  const countFor = (key) => engagement.filter((e) => e.event_type === key).length;

  const plan = selectedListing?.plan || "basic";
  const planActive = selectedListing?.plan_status === "active";
  const isPaid = (plan === "standard" || plan === "premium") && planActive;
  const isPremium = plan === "premium" && planActive;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="text-muted-foreground mt-1">Please sign in to access your owner dashboard.</p>
        <Button className="mt-4" onClick={() => base44.auth.redirectToLogin(window.location.pathname)}>Sign In</Button>
      </div>
    );
  }

  if (myListings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold">No claimed listings</h1>
        <p className="text-muted-foreground mt-2">You haven't claimed any listings yet. Browse the directory and claim your listing to access the owner dashboard.</p>
        <Link to="/directory">
          <Button className="mt-4">Browse Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track engagement and manage your listing's notice board.</p>
      </div>

      {/* Listing Selector */}
      {myListings.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {myListings.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedListing(l)}
              className={`px-4 h-11 rounded-lg text-sm font-medium border transition-colors ${
                selectedListing?.id === l.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {selectedListing && (
        <>
          {/* Listing Header */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            {selectedListing.image_url && (
              <img src={selectedListing.image_url} alt={selectedListing.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{selectedListing.name}</p>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Claimed ✓</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedListing.town}, Co. {selectedListing.county}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={
                selectedListing.plan === "premium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                selectedListing.plan === "standard" ? "bg-blue-50 text-blue-700 border-blue-200" :
                "bg-muted text-muted-foreground"
              }>
                {selectedListing.plan === "premium" && <Crown className="w-3 h-3 mr-1" />}
                {selectedListing.plan === "premium" ? "Premium" : selectedListing.plan === "standard" ? "Standard" : "Basic"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setEditingListing(true)}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Link to={`/listing/${selectedListing.id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </div>
          </div>

          {/* Engagement Metrics — Premium only */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Engagement Metrics</h2>
            {!isPremium ? (
              <div className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl p-8 text-center">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <p className="font-semibold text-amber-900">Premium Feature</p>
                <p className="text-sm text-amber-700 mt-1 mb-4">Upgrade to Premium to see how many people viewed your profile, clicked your phone number, visited your website and more.</p>
                <Link to="/billing">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Upgrade to Premium — €99/yr</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {METRIC_CONFIG.map((m) => (
                  <MetricCard key={m.key} icon={m.icon} label={m.label} value={countFor(m.key)} color={m.color} bg={m.bg} />
                ))}
              </div>
            )}
          </div>

          {/* Notice Board — Standard & Premium */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Notice Board</h2>
              {isPaid && (
                <Button size="sm" onClick={() => setEditingNotice({})}>
                  <Plus className="w-4 h-4 mr-1" /> Add Notice
                </Button>
              )}
            </div>

            {!isPaid ? (
              <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-8 text-center">
                <Crown className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="font-semibold text-blue-900">Standard or Premium Feature</p>
                <p className="text-sm text-blue-700 mt-1 mb-4">Upgrade to post notices — volunteers wanted, jobs, announcements — directly on your listing page.</p>
                <Link to="/billing">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Upgrade from €49/yr</Button>
                </Link>
              </div>
            ) : notices.length === 0 ? (
              <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                <p className="text-sm">No notices yet. Add your first notice to engage with your community.</p>
              </div>

            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div key={notice.id} className="bg-card border rounded-xl p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${NOTICE_TYPE_COLORS[notice.notice_type]}`}>
                          {NOTICE_TYPE_LABELS[notice.notice_type]}
                        </Badge>
                        {!notice.is_active && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">Inactive</Badge>
                        )}
                        {notice.expires_on && (
                          <span className="text-xs text-muted-foreground">Expires {new Date(notice.expires_on + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{notice.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notice.body}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => isPaid && setEditingNotice(notice)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingNoticeId(notice.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Listing Form */}
      {editingListing && selectedListing && (
        <OwnerListingEditForm
          listing={selectedListing}
          onClose={() => setEditingListing(false)}
          onSave={() => {
            setEditingListing(false);
            base44.entities.CommunityListing.filter({ owner_email: user.email }).then((listings) => {
              setMyListings(listings);
              const updated = listings.find((l) => l.id === selectedListing.id);
              if (updated) setSelectedListing(updated);
            });
          }}
        />
      )}

      {/* Notice Form */}
      {editingNotice !== null && (
        <NoticeForm
          notice={editingNotice}
          listingId={selectedListing.id}
          ownerEmail={user.email}
          onClose={() => setEditingNotice(null)}
          onSave={(optimistic, isNew) => {
            // Optimistic update: apply immediately, then reload for truth
            setNotices(prev => isNew
              ? [optimistic, ...prev]
              : prev.map(n => n.id === optimistic.id ? optimistic : n)
            );
            setEditingNotice(null);
            // Sync from server shortly after
            setTimeout(loadNotices, 1500);
          }}
        />
      )}

      {/* Account Deletion Section */}
      <div className="mt-10 pt-6 border-t">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Account Settings</h2>
        {deleteRequestSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
            ✓ Your deletion request has been received. We'll process it within 7 days.
          </div>
        ) : (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all associated listings and data. This cannot be undone.</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 min-h-[44px] sm:min-h-0"
              onClick={() => setDeleteStep(1)}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Request Deletion
            </Button>
          </div>
        )}
      </div>

      {/* Delete Account — Step 1: Warning */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="font-bold text-lg">Before you continue</h2>
              <p className="text-sm text-muted-foreground mt-2">Deleting your account will permanently remove:</p>
            </div>
            <ul className="px-6 py-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="text-destructive font-bold">✕</span> Your profile and login access</li>
              <li className="flex items-center gap-2"><span className="text-destructive font-bold">✕</span> All your claimed listings</li>
              <li className="flex items-center gap-2"><span className="text-destructive font-bold">✕</span> All notices and engagement data</li>
            </ul>
            <div className="p-5 flex gap-3">
              <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setDeleteStep(0)}>Cancel</Button>
              <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setDeleteStep(2)}>I understand, continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 2: Final Confirm */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="font-bold text-lg">Final confirmation</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-1">You are about to submit a deletion request for:</p>
              <p className="font-semibold text-sm">{user?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Our team will process it within 7 days.</p>
            </div>
            <div className="p-5 flex gap-3">
              <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setDeleteStep(0)}>Cancel</Button>
              <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={handleDeleteAccountRequest} disabled={sendingDelete}>
                {sendingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete notice confirmation */}
      {deletingNoticeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl border p-6 max-w-sm mx-4 shadow-xl">
            <p className="font-semibold mb-2">Delete this notice?</p>
            <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeletingNoticeId(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteNotice(deletingNoticeId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
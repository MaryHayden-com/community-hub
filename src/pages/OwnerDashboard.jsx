import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Eye, Phone, Globe, Mail, Facebook, Instagram, Linkedin, Plus, Pencil, Trash2, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NoticeForm from "../components/NoticeForm";

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

  const countFor = (key) => engagement.filter((e) => e.event_type === key).length;

  const isPremium = selectedListing?.plan === "premium";

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
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
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
          <div className="flex items-center gap-3 mb-6 p-4 bg-card border rounded-xl">
            {selectedListing.image_url && (
              <img src={selectedListing.image_url} alt={selectedListing.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{selectedListing.name}</p>
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
              <Link to={`/listing/${selectedListing.id}`}>
                <Button variant="outline" size="sm">View Listing</Button>
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
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Upgrade to Premium</Button>
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

          {/* Notice Board — Premium only */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Notice Board</h2>
              {isPremium && (
                <Button size="sm" onClick={() => setEditingNotice({})}>
                  <Plus className="w-4 h-4 mr-1" /> Add Notice
                </Button>
              )}
            </div>

            {!isPremium ? (
              <div className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl p-8 text-center">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <p className="font-semibold text-amber-900">Premium Feature</p>
                <p className="text-sm text-amber-700 mt-1 mb-4">Upgrade to Premium to post notices — volunteers wanted, jobs, announcements — directly on your listing page.</p>
                <Link to="/billing">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Upgrade to Premium</Button>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingNotice(notice)}>
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

      {/* Notice Form */}
      {editingNotice !== null && (
        <NoticeForm
          notice={editingNotice}
          listingId={selectedListing.id}
          ownerEmail={user.email}
          onClose={() => setEditingNotice(null)}
          onSave={() => { setEditingNotice(null); loadNotices(); }}
        />
      )}

      {/* Delete confirmation */}
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
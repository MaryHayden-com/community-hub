import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin,
  ArrowLeft, Building2, Users, GraduationCap, Calendar, Clock, Star, User, ShieldCheck, Flag,
  Megaphone, HandHeart, Briefcase, Bell, Share2, RefreshCw, QrCode, Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import ClaimListingForm from "../components/ClaimListingForm";
import AddToCalendarButton from "../components/AddToCalendarButton";
import RemovalRequestForm from "../components/RemovalRequestForm";
import ReportListingForm from "../components/ReportListingForm";
import QRCodeModal from "../components/QRCodeModal";
import ReviewModal from "../components/ReviewModal";
import ReviewStars from "../components/ReviewStars";
import usePageTitle from "@/hooks/usePageTitle";

const typeConfig = {
  "Business": { icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Club & Group": { icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200" },
  "Education": { icon: GraduationCap, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "What's On": { icon: Calendar, color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function extractHandle(url, platform) {
  if (!url) return platform;
  const cleaned = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const parts = cleaned.split("/");
  if (platform === "instagram") return "@" + (parts[1] || parts[0] || "Instagram");
  if (platform === "facebook") return parts[1] || parts[0] || "Facebook";
  if (platform === "linkedin") return parts.slice(1).join("/") || "LinkedIn";
  return cleaned;
}

function DetailRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
        {content}
      </a>
    );
  }
  return <div className="px-2 -mx-2">{content}</div>;
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user, navigateToLogin } = useAuth();
  const [listing, setListing] = useState(null);
  usePageTitle(listing?.name);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [showRemoval, setShowRemoval] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [notices, setNotices] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState(null);

  const handleClaim = () => {
    if (!user) {
      navigateToLogin();
      return;
    }
    setShowClaim(true);
  };

  const trackEvent = useCallback((listingId, ownerEmail, eventType) => {
    base44.entities.ListingEngagement.create({
      listing_id: listingId,
      event_type: eventType,
      listing_owner_email: ownerEmail || "",
    }).catch(() => {});
  }, []);

  const toggleSave = useCallback(async () => {
    if (!user || !listing) return;
    if (isSaved) {
      await base44.entities.SavedListing.deleteMany({ listing_id: listing.id, user_email: user.email });
      setIsSaved(false);
    } else {
      await base44.entities.SavedListing.create({
        listing_id: listing.id,
        user_email: user.email,
        listing_name: listing.name,
        listing_type: listing.type,
        county: listing.county,
      });
      setIsSaved(true);
    }
  }, [user, listing, isSaved]);

  const toggleAttendance = useCallback(async () => {
    if (!user || !listing) return;
    if (isAttending) {
      await base44.entities.EventAttendance.deleteMany({ listing_id: listing.id, user_email: user.email });
      setIsAttending(false);
      setAttendanceCount(c => Math.max(0, c - 1));
    } else {
      await base44.entities.EventAttendance.create({
        listing_id: listing.id,
        user_email: user.email,
        listing_name: listing.name,
        attendee_name: user.full_name || user.email,
        attending: true,
      });
      setIsAttending(true);
      setAttendanceCount(c => c + 1);
    }
  }, [user, listing, isAttending]);

  useEffect(() => {
    base44.entities.CommunityListing.get(id)
      .then((l) => {
        setListing(l);
        if (l) {
          trackEvent(l.id, l.owner_email, "view");
          if (l.plan === "premium") {
            base44.entities.ListingNotice.filter({ listing_id: l.id })
              .then((all) => setNotices(all.filter((n) => n.is_active && (!n.expires_on || n.expires_on >= new Date().toISOString().slice(0, 10)))))
              .catch(() => {});
          }
          // Load saved status
          if (user) {
            base44.entities.SavedListing.filter({ listing_id: l.id, user_email: user.email })
              .then((saved) => setIsSaved(saved.length > 0))
              .catch(() => {});
          }
          // Load attendance for events
          if (l.type === "What's On") {
            base44.entities.EventAttendance.filter({ listing_id: l.id })
              .then((all) => {
                setAttendanceCount(all.filter(a => a.attending).length);
                if (user) {
                  const userAttending = all.find(a => a.user_email === user.email && a.attending);
                  setIsAttending(!!userAttending);
                }
              })
              .catch(() => {});
          }
          // Load reviews
          base44.entities.ListingReview.filter({ listing_id: l.id })
            .then((all) => {
              const approved = all.filter(r => r.is_approved);
              setReviews(approved.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
              if (approved.length > 0) {
                const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
                setAverageRating(Math.round(avg * 10) / 10);
              }
              if (user) {
                // Show user's own review even if pending approval
                const userRev = all.find(r => r.user_email === user.email);
                setUserReview(userRev || null);
              }
            })
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-lg text-muted-foreground">Listing not found</p>
        <Link to="/directory">
          <Button variant="outline" className="mt-4">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const config = typeConfig[listing.type] || typeConfig["Business"];
  const TypeIcon = config.icon;
  const hidden = listing.hidden_fields || [];
  const isClaimed = !!listing.owner_email;
  // Phone, email and socials stay hidden until the listing is claimed;
  // once claimed, the owner can hide individual fields via hidden_fields.
  const HIDDEN_UNTIL_CLAIMED = ["phone", "email", "contact_name", "facebook_url", "instagram_url", "linkedin_url"];
  const isVisible = (field) => !hidden.includes(field) && (isClaimed || !HIDDEN_UNTIL_CLAIMED.includes(field));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to={`/town/${encodeURIComponent(listing.county)}/${encodeURIComponent(listing.town)}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {listing.town}
      </Link>

      <div className="bg-card rounded-xl overflow-hidden" style={{ border: '2px solid #E2701B' }}>
        {listing.image_url && (
          <div className="h-56 sm:h-72 bg-white flex items-center justify-center">
            <img src={listing.image_url} alt={listing.name} className="w-full h-full object-contain" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${config.color}`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {listing.type}
                </Badge>
                {listing.is_featured && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    <Star className="w-3 h-3 mr-1 fill-amber-500" />
                    Featured
                  </Badge>
                )}
                {listing.is_verified && (
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#097275' }}>{listing.name}</h1>
              {listing.category && (
                <p className="text-sm text-muted-foreground mt-1">{listing.category}</p>
              )}
            </div>
          </div>

          {isVisible("description") && listing.description && (
            <p className="mt-6 text-muted-foreground leading-relaxed">{listing.description}</p>
          )}

          <div className="mt-8 space-y-1 divide-y">
            {listing.type === "What's On" && listing.event_date && (
              <div className="flex items-center gap-3 py-2.5 px-2 -mx-2 bg-amber-50 rounded-lg mb-2">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-amber-600">Event Date</p>
                  <p className="text-sm font-semibold text-amber-800">
                    {new Date(listing.event_date + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {listing.event_time ? ` at ${listing.event_time}` : ''}
                  </p>
                </div>
              </div>
            )}
            {isVisible("address") && <DetailRow icon={MapPin} label="Address" value={listing.address || `${listing.town}, Co. ${listing.county}`} />}
            {isVisible("phone") && listing.phone && (
              <a href={`tel:${listing.phone}`} onClick={() => trackEvent(listing.id, listing.owner_email, "phone_click")} className="block hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-start gap-3 py-2.5">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{listing.phone}</p></div>
                </div>
              </a>
            )}
            {isVisible("email") && listing.email && (
              <a href={`mailto:${listing.email}`} onClick={() => trackEvent(listing.id, listing.owner_email, "email_click")} className="block hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-start gap-3 py-2.5">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{listing.email}</p></div>
                </div>
              </a>
            )}
            {isVisible("website") && listing.website && (
              <a href={listing.website} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(listing.id, listing.owner_email, "website_click")} className="block hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
                <div className="flex items-start gap-3 py-2.5">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div><p className="text-xs text-muted-foreground">Website</p><p className="text-sm font-medium">{listing.website}</p></div>
                </div>
              </a>
            )}
            {isVisible("contact_name") && <DetailRow icon={User} label="Contact" value={listing.contact_name} />}
            {isVisible("meeting_info") && <DetailRow icon={Clock} label="Meeting Info" value={listing.meeting_info} />}
          </div>

          {/* Social Links */}
          {(isVisible("facebook_url") && listing.facebook_url || isVisible("instagram_url") && listing.instagram_url || isVisible("linkedin_url") && listing.linkedin_url) && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground mb-3">Social Media</p>
              <div className="flex flex-col gap-2">
                {isVisible("facebook_url") && listing.facebook_url && (
                  <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <Facebook className="w-4 h-4 text-blue-600" />
                    </span>
                    <span className="font-medium group-hover:underline">
                      {extractHandle(listing.facebook_url, "facebook")}
                    </span>
                  </a>
                )}
                {isVisible("instagram_url") && listing.instagram_url && (
                  <a href={listing.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
                      <Instagram className="w-4 h-4 text-pink-600" />
                    </span>
                    <span className="font-medium group-hover:underline">
                      {extractHandle(listing.instagram_url, "instagram")}
                    </span>
                  </a>
                )}
                {isVisible("linkedin_url") && listing.linkedin_url && (
                  <a href={listing.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group">
                    <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                      <Linkedin className="w-4 h-4 text-sky-700" />
                    </span>
                    <span className="font-medium group-hover:underline">
                      {extractHandle(listing.linkedin_url, "linkedin")}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notice Board */}
          {notices.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" /> Notice Board
              </p>
              <div className="space-y-3">
                {notices.map((notice) => {
                  const noticeIcons = { volunteers_wanted: HandHeart, job: Briefcase, announcement: Megaphone, event: Calendar, other: Bell };
                  const NoticeIcon = noticeIcons[notice.notice_type] || Bell;
                  const noticeColors = {
                    volunteers_wanted: "bg-emerald-50 border-emerald-200 text-emerald-900",
                    job: "bg-blue-50 border-blue-200 text-blue-900",
                    announcement: "bg-amber-50 border-amber-200 text-amber-900",
                    event: "bg-violet-50 border-violet-200 text-violet-900",
                    other: "bg-gray-50 border-gray-200 text-gray-900",
                  };
                  const noticeTypeLabels = { volunteers_wanted: "Volunteers Wanted", job: "Job / Employment", announcement: "Announcement", event: "Event", other: "Other" };
                  return (
                    <div key={notice.id} className={`rounded-xl border p-4 ${noticeColors[notice.notice_type] || noticeColors.other}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <NoticeIcon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{noticeTypeLabels[notice.notice_type]}</span>
                      </div>
                      <p className="font-semibold text-sm">{notice.title}</p>
                      <p className="text-sm mt-1 opacity-80 leading-relaxed">{notice.body}</p>
                      {notice.expires_on && (
                        <p className="text-xs mt-2 opacity-60">Closes {new Date(notice.expires_on + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "long" })}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Last updated */}
          {listing.updated_date && (
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Last updated {new Date(listing.updated_date).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          {/* Claim this listing — prominent CTA */}
          {!listing.owner_email && (
            <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-amber-800">Is this your listing?</p>
                <p className="text-xs text-amber-700 mt-0.5">Claim it to manage your details — phone, email and socials appear on the listing once claimed.</p>
              </div>
              <Button size="sm" onClick={handleClaim} style={{ background: '#E2701B', border: 'none', color: '#fff' }}>
                <Flag className="w-3.5 h-3.5" /> Claim this listing
              </Button>
            </div>
          )}

          {/* Event Actions — only for events */}
          {listing.type === "What's On" && (
            <div className="mt-5 pt-5 border-t">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">Event actions</p>
                {attendanceCount > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {attendanceCount} going
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <AddToCalendarButton listing={listing} dateObj={listing.event_date ? new Date(listing.event_date + "T12:00:00") : null} size="md" />
                {user ? (
                  <Button
                    variant={isAttending ? "default" : "outline"}
                    size="sm"
                    onClick={toggleAttendance}
                    className={isAttending ? "bg-primary" : ""}
                  >
                    <Users className="w-3.5 h-3.5" />
                    {isAttending ? "✓ Going" : "I'm Going"}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Log in to mark yourself as going</p>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Reviews</h3>
                {averageRating > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <ReviewStars rating={Math.round(averageRating)} size="lg" />
                    <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                  </div>
                )}
              </div>
              {user && !userReview && (
                <Button size="sm" onClick={() => setShowReview(true)} style={{ background: '#E2701B', border: 'none' }}>
                  Write a Review
                </Button>
              )}
            </div>

            {userReview && (
              <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Your Review</p>
                <ReviewStars rating={userReview.rating} />
                {userReview.review_text && <p className="text-sm mt-2">{userReview.review_text}</p>}
              </div>
            )}

            {userReview && !userReview.is_approved && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
              ⏳ Your review is awaiting approval and will appear publicly once approved.
            </div>
          )}
          {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{review.user_name || review.user_email.split('@')[0]}</p>
                        <ReviewStars rating={review.rating} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {review.review_text && <p className="text-sm text-muted-foreground">{review.review_text}</p>}
                  </div>
                ))}
                {reviews.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">+{reviews.length - 3} more reviews</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
            )}
          </div>

          {/* Save & QR Code */}
          <div className="mt-5 pt-5 border-t flex flex-wrap gap-3">
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={toggleSave}
              className={isSaved ? "bg-primary" : ""}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowQR(true)}>
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </Button>
          </div>

          {/* Share + Actions */}
          <div className="mt-5 pt-5 border-t flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: listing.name, url });
                } else {
                  navigator.clipboard.writeText(url);
                  alert("Link copied to clipboard!");
                }
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const text = `Check out ${listing.name} on Local Community Hub: ${window.location.href}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
              }}
            >
              <span className="text-base leading-none">📱</span>
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(listing.name);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, "_blank");
              }}
            >
              <Facebook className="w-3.5 h-4 text-blue-600" />
              Facebook
            </Button>
            <div className="flex-1" />
            {!listing.owner_email && (
              <Button variant="outline" size="sm" onClick={handleClaim}>
                <Flag className="w-3.5 h-3.5" />
                Claim this listing
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowRemoval(true)}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Request removal
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowReport(true)}>
              <Flag className="w-3.5 h-3.5" />
              Report a listing
            </Button>
          </div>
        </div>
      </div>

      {showClaim && (
        <ClaimListingForm listing={listing} user={user} onClose={() => setShowClaim(false)} />
      )}
      {showRemoval && (
        <RemovalRequestForm listing={listing} onClose={() => setShowRemoval(false)} />
      )}
      {showReport && (
        <ReportListingForm listing={listing} onClose={() => setShowReport(false)} />
      )}
      {showQR && (
        <QRCodeModal
          url={window.location.href}
          title={listing.name}
          onClose={() => setShowQR(false)}
        />
      )}
      {showReview && user && (
        <ReviewModal
          listing={listing}
          user={user}
          onClose={() => setShowReview(false)}
          onSubmit={async ({ rating, review_text }) => {
            await base44.entities.ListingReview.create({
              listing_id: listing.id,
              listing_name: listing.name,
              user_email: user.email,
              user_name: user.full_name || user.email.split('@')[0],
              rating,
              review_text,
              is_approved: false, // Requires admin approval
              created_date: new Date().toISOString(),
            });
            setShowReview(false);
            // Reload reviews
            const all = await base44.entities.ListingReview.filter({ listing_id: listing.id });
            const approved = all.filter(r => r.is_approved);
            setReviews(approved.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
            if (approved.length > 0) {
              const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
              setAverageRating(Math.round(avg * 10) / 10);
            }
            // Show user's own review even if pending
            const userRev = all.find(r => r.user_email === user.email);
            setUserReview(userRev || null);
          }}
        />
      )}
    </div>
  );
}
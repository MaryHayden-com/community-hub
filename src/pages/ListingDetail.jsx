import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin,
  ArrowLeft, Building2, Users, GraduationCap, Calendar, Clock, Star, User, ShieldCheck, Flag,
  Megaphone, HandHeart, Briefcase, Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ClaimListingForm from "../components/ClaimListingForm";
import RemovalRequestForm from "../components/RemovalRequestForm";

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
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [showRemoval, setShowRemoval] = useState(false);
  const [notices, setNotices] = useState([]);

  const trackEvent = useCallback((listingId, ownerEmail, eventType) => {
    base44.entities.ListingEngagement.create({
      listing_id: listingId,
      event_type: eventType,
      listing_owner_email: ownerEmail || "",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.CommunityListing.filter({ id })
      .then((results) => {
        const l = results[0] || null;
        setListing(l);
        if (l) {
          trackEvent(l.id, l.owner_email, "view");
          if (l.plan === "premium") {
            base44.entities.ListingNotice.filter({ listing_id: l.id })
              .then((all) => setNotices(all.filter((n) => n.is_active && (!n.expires_on || n.expires_on >= new Date().toISOString().slice(0, 10)))))
              .catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

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
  const isVisible = (field) => !hidden.includes(field);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to={`/town/${encodeURIComponent(listing.county)}/${encodeURIComponent(listing.town)}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {listing.town}
      </Link>

      <div className="bg-card rounded-xl border overflow-hidden">
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
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{listing.name}</h1>
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

          {/* Claim / Removal */}
          <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowClaim(true)}>
              <Flag className="w-3.5 h-3.5" />
              Claim this listing
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowRemoval(true)}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Request removal
            </Button>
          </div>
        </div>
      </div>

      {showClaim && (
        <ClaimListingForm listing={listing} onClose={() => setShowClaim(false)} />
      )}
      {showRemoval && (
        <RemovalRequestForm listing={listing} onClose={() => setShowRemoval(false)} />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { base44 } from "@/api/base44Client";
import {
  Search, CalendarDays, PlusCircle, Share2, Copy, Download, Lightbulb,
  ArrowLeft, Store, ShieldCheck, LayoutDashboard, Check
} from "lucide-react";

function BenefitList({ items }) {
  return (
    <ul className="space-y-2 mb-4">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-white/90 text-sm leading-snug">
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#E2701B" }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// Self-contained share widget: builds a QR + share/copy for whatever URL it's given.
function ShareCluster({ shareUrl, shareTitle, primaryLabel }) {
  const [qr, setQr] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let m = true;
    QRCode.toDataURL(shareUrl, { width: 240, margin: 1, errorCorrectionLevel: "M" })
      .then((d) => { if (m) setQr(d); })
      .catch(() => {});
    return () => { m = false; };
  }, [shareUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch (err) {
        if (err?.name !== "AbortError") handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {qr ? (
        <div className="bg-white rounded-lg p-1 shrink-0 self-center sm:self-start" title="Scan to open">
          <img src={qr} alt="QR code" className="w-14 h-14 sm:w-16 sm:h-16" />
        </div>
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/20 shrink-0 self-center sm:self-start" />
      )}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button onClick={handleShare} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/15">
          <Share2 className="w-4 h-4" /> {primaryLabel}
        </button>
        <button onClick={handleCopy} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/15">
          <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy link"}
        </button>
        {qr && (
          <a href={qr} download="hub4community-qr.png" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/15">
            <Download className="w-4 h-4" /> QR
          </a>
        )}
      </div>
    </div>
  );
}

export default function HomeHero({ onAddListing, onSearch, onSearchWhatsOn, onSuggestBusiness }) {
  const navigate = useNavigate();
  const [path, setPath] = useState("landing");
  const [hubUrl] = useState(() => window.location.href.split("?")[0].split("#")[0]);
  const [ownerListing, setOwnerListing] = useState(null);

  // If a logged-in owner has a claimed listing, share *their* listing directly.
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;
        const me = await base44.auth.me();
        const items = await base44.entities.CommunityListing.filter({ owner_email: me.email }, "-updated_date", 20);
        if (m && items && items.length) setOwnerListing(items[0]);
      } catch { /* not logged in or no listings — fine */ }
    })();
    return () => { m = false; };
  }, []);

  const ownerShareUrl = ownerListing ? `https://hub4community.com/listing/${ownerListing.id}` : hubUrl;
  const ownerShareTitle = ownerListing ? `${ownerListing.name} — Community Hub` : "Hub4Community — Your free community directory";

  const background = { background: "linear-gradient(180deg, hsl(182 85% 30%) 0%, hsl(182 85% 14%) 100%)" };

  return (
    <section className="mb-6" aria-labelledby="home-brand">
      <div className="relative overflow-hidden rounded-2xl" style={background}>
        <div className="relative px-5 sm:px-10 py-8 sm:py-12 text-white">

          {/* ── Screen 1 — Landing / Split ────────────────────────── */}
          {path === "landing" && (
            <div>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">Your free community directory</p>
              <h1 id="home-brand" className="font-display text-4xl sm:text-5xl font-bold leading-tight">Hub4Community</h1>
              <p className="mt-3 text-white/90 text-sm sm:text-base max-w-xl leading-relaxed">
                Find local businesses, clubs and events — or list your own. Free, and always yours to manage.
              </p>

              <div className="mt-6 max-w-xl">
                <button
                  onClick={() => setPath("user")}
                  className="w-full text-left rounded-2xl p-4 sm:p-5 mb-3 border bg-white/10 hover:bg-white/15 transition-colors"
                  style={{ borderColor: "#E2701B" }}
                >
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <Search className="w-5 h-5" style={{ color: "#E2701B" }} />
                    I'm looking for something local
                  </div>
                  <p className="text-white/85 text-sm mt-1 mb-3">Search the directory, see what's on, save your favourites.</p>
                  <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm min-h-[44px] w-full text-white" style={{ background: "#E2701B" }}>
                    Explore the Hub
                  </span>
                </button>

                <button
                  onClick={() => setPath("owner")}
                  className="w-full text-left rounded-2xl p-4 sm:p-5 border border-white/30 bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <Store className="w-5 h-5" style={{ color: "#14a3a0" }} />
                    I run a business or group
                  </div>
                  <p className="text-white/85 text-sm mt-1 mb-3">Claim your free listing, or add a new one in minutes.</p>
                  <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm min-h-[44px] w-full text-white border border-white/50 bg-transparent">
                    Set Up My Listing
                  </span>
                </button>

                <p className="text-white/70 text-xs text-center mt-4 leading-relaxed">
                  Already listed?{" "}
                  <button onClick={onSearch} className="underline hover:text-white">Claim your business</button>
                  <br />
                  Know a business that should be here?{" "}
                  <button onClick={onSuggestBusiness} className="underline hover:text-white">Suggest one</button>
                </p>
              </div>
            </div>
          )}

          {/* ── Screen 2A — General user path ─────────────────────── */}
          {path === "user" && (
            <div>
              <button onClick={() => setPath("landing")} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-xs mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em]">Find what's near you</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">What are you looking for?</h2>

              <div className="mt-5 flex flex-col gap-2.5 max-w-xl">
                <button onClick={onSearch} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full" style={{ background: "#E2701B" }}>
                  <Search className="w-4 h-4" /> Search the Directory
                </button>
                <button onClick={onSearchWhatsOn} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full border border-white/40 bg-white/10 hover:bg-white/15">
                  <CalendarDays className="w-4 h-4" /> See What's On
                </button>
              </div>

              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.08em] mt-6 mb-2">While you're here</p>
              <BenefitList items={[
                "Save places and events with one tap",
                "Share a listing with a neighbour or group chat",
                "Don't see a business you know? Suggest it — takes 30 seconds",
              ]} />

              <div className="max-w-xl mb-5">
                <button onClick={onSuggestBusiness} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full border border-dashed border-white/40 bg-transparent hover:bg-white/10">
                  <Lightbulb className="w-4 h-4" /> Suggest a Business
                </button>
              </div>

              <hr className="border-white/15 my-5" />
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.08em] mb-3">Spread the word</p>
              <ShareCluster shareUrl={hubUrl} shareTitle="Hub4Community — Your free community directory" primaryLabel="Share This Hub" />

              <p className="text-white/70 text-xs text-center mt-5">
                Run a business yourself?{" "}
                <button onClick={() => setPath("owner")} className="underline hover:text-white">Set it up here</button> — free, and yours to manage.
              </p>
            </div>
          )}

          {/* ── Screen 2B — Business / group owner path ───────────── */}
          {path === "owner" && (
            <div>
              <button onClick={() => setPath("landing")} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-xs mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em]">For business & group owners</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">Get found by locals</h2>
              <p className="text-white/90 text-sm mt-1 mb-4">Free to list. Yours to manage. No developer needed.</p>

              <BenefitList items={[
                "Show up when people search the directory or What's On",
                "Keep your hours, offers and photos accurate — update anytime",
                "One dashboard, no waiting on a website update",
                "Free visibility, no ad spend",
              ]} />

              <div className="flex flex-col gap-2.5 max-w-xl mb-4">
                <button onClick={onAddListing} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full" style={{ background: "#E2701B" }}>
                  <PlusCircle className="w-4 h-4" /> Add Your Business or Group
                </button>
                <button onClick={onSearch} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white min-h-[44px] w-full border border-white/50 bg-transparent hover:bg-white/10">
                  <ShieldCheck className="w-4 h-4" /> Claim an Existing Listing
                </button>
              </div>

              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.08em] mb-2">Already listed?</p>
              <div className="mb-5">
                <button onClick={() => navigate("/dashboard")} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm min-h-[44px] w-full sm:w-auto border" style={{ background: "#0a2f30", borderColor: "#14a3a0", color: "#14a3a0" }}>
                  <LayoutDashboard className="w-4 h-4" /> Go to My Dashboard
                </button>
              </div>

              <hr className="border-white/15 my-5" />
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.08em] mb-3">Grow your reach</p>
              <ShareCluster shareUrl={ownerShareUrl} shareTitle={ownerShareTitle} primaryLabel="Share My Listing" />
              <p className="text-white/70 text-xs mt-3">
                {ownerListing
                  ? "Sharing sends people straight to your listing — not just the Hub."
                  : "Add or claim a listing above, then share it here to send people straight to your page."}
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
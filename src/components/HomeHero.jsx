import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Search, CalendarDays, PlusCircle, Share2, Copy, Download } from "lucide-react";

function StepBadge({ n }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15 text-white text-sm font-bold shrink-0 mr-3 mt-0.5 border border-white/30">
      {n}
    </span>
  );
}

export default function HomeHero({ onAddListing, onSearch, onSearchWhatsOn }) {
  const [url] = useState(() => window.location.href.split("?")[0].split("#")[0]);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(url, { width: 240, margin: 1, errorCorrectionLevel: "M" })
      .then((d) => { if (mounted) setQrDataUrl(d); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [url]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Hub4Community — Your free community directory", url }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <section className="mb-6" aria-labelledby="home-brand">
      {/* Image hero with teal overlay */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src="https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/7fe81efa0_generated_image.png"
          alt="Community market scene in an Irish town"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(115deg, hsl(182 85% 18% / 0.92) 0%, hsl(182 85% 22% / 0.78) 55%, hsl(182 85% 26% / 0.55) 100%)" }}
        />

        <div className="relative px-6 sm:px-10 py-10 sm:py-14">
          <p className="text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
            Your free community directory
          </p>
          <h1
            id="home-brand"
            className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight"
          >
            Hub4Community
          </h1>
          {/* Step 1 — Find & search */}
          <div className="mt-6">
            <div className="flex items-start">
              <StepBadge n={1} />
              <div>
                <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-xl">
                  Search the directory to find local businesses, clubs, community services and events near you — and support the people behind them by shopping local and joining in.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={onSearch}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px] w-full sm:w-auto"
                    style={{ background: "#097275" }}
                  >
                    <Search className="w-4 h-4" /> Search the directory
                  </button>
                  <button
                    onClick={onSearchWhatsOn}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px] w-full sm:w-auto border border-white/30"
                    style={{ background: "hsl(182 85% 30%)" }}
                  >
                    <CalendarDays className="w-4 h-4" /> Search What's On
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — Can't find it? Add yours */}
          <div className="mt-5">
            <div className="flex items-start">
              <StepBadge n={2} />
              <div>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  Can't find what you need? Add your own business, club or group in minutes — it's free, and you'll stay in control of your listing to manage and update it yourself.
                </p>
                <button
                  onClick={onAddListing}
                  className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px] w-full sm:w-auto"
                  style={{ background: "#E2701B" }}
                >
                  <PlusCircle className="w-4 h-4" /> Add Your Business or Group
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 — Share */}
          <div className="mt-5">
            <div className="flex items-start">
              <StepBadge n={3} />
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl">
                  Share this directory with friends, neighbours and local groups so they can discover what's nearby — or add their own listing if it isn't here yet.
                </p>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  {qrDataUrl ? (
                    <div className="bg-white rounded-lg p-1 shrink-0 self-center sm:self-start" title="Scan to open this directory">
                      <img src={qrDataUrl} alt="QR code for this directory" className="w-14 h-14 sm:w-20 sm:h-20" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg bg-white/20 shrink-0 self-center sm:self-start" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px] w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/15"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px] w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/15"
                    >
                      <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy link"}
                    </button>
                    <a
                      href={qrDataUrl || "#"}
                      download="hub4community-qr.png"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm text-white shadow-lg min-h-[44px] w-full sm:w-auto border border-white/40 bg-white/10 hover:bg-white/15"
                    >
                      <Download className="w-4 h-4" /> Download QR
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


    </section>
  );
}
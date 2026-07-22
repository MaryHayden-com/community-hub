import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Share2, Copy } from "lucide-react";

export default function DirectoryShareBar() {
  const [url] = useState(() => window.location.href.split("?")[0].split("#")[0]);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(url, { width: 480, margin: 1, errorCorrectionLevel: "M" })
      .then((d) => { if (mounted) setQrDataUrl(d); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [url]);

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ title: "Hub4Community — Your free community directory", url }).catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert(url);
      }
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
    <div className="mt-3 rounded-xl border p-3 sm:p-4 flex items-center gap-3 sm:gap-4" style={{ background: "hsl(182 85% 25% / 0.06)", borderColor: "hsl(182 85% 25% / 0.2)" }}>
      {/* Compact inline QR — screenshot or scan */}
      {qrDataUrl ? (
        <div className="bg-white rounded-lg p-1.5 shrink-0" title="Screenshot or scan to share">
          <img src={qrDataUrl} alt="QR code for this directory" className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base leading-snug" style={{ color: "#097275" }}>
          Know others who'd love this directory? 📣
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">
          Scan the QR code, share the link, or tell a friend and help your whole community find what's local.
        </p>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-semibold shadow-sm min-h-[40px]"
          style={{ background: "#097275" }}
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border min-h-[40px]"
          style={{ borderColor: "hsl(182 85% 25% / 0.4)", color: "#097275" }}
        >
          <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
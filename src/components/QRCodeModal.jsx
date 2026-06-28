import QRCode from "qrcode";
import { useState, useEffect, useRef } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QRCodeModal({ url, title, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    QRCode.toDataURL(url, { width: 400, margin: 2, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [url]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `${title || "qr-code"}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Share this listing</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : qrDataUrl ? (
          <>
            <div className="aspect-square bg-white rounded-xl p-4 mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan to view <span className="font-medium">{title || "this listing"}</span>
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  alert("Link copied!");
                }}
              >
                Copy Link
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Failed to generate QR code</p>
        )}
      </div>
    </div>
  );
}
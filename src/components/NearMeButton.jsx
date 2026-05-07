import { useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const RADIUS_OPTIONS = [
  { label: "10 km", km: 10 },
  { label: "20 km", km: 20 },
  { label: "30 km", km: 30 },
  { label: "50 km", km: 50 },
  { label: "100 km", km: 100 },
];

// nearbyCounties is now { lat, lng, km } or null
export default function NearMeButton({ nearbyCounties, onNearbyChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(10);

  const locate = (km = radius) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onNearbyChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, km });
        setLoading(false);
      },
      (err) => {
        if (err.code === 1) setError("Location access denied. Please enable in browser settings.");
        else if (err.code === 3) setError("Location request timed out. Try again.");
        else setError("Could not determine your location. Try again.");
        setLoading(false);
      },
      { timeout: 20000, enableHighAccuracy: false }
    );
  };

  const handleRadiusChange = (km) => {
    setRadius(km);
    if (nearbyCounties) onNearbyChange({ ...nearbyCounties, km });
  };

  const clear = () => {
    onNearbyChange(null);
    setError(null);
  };

  if (nearbyCounties) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-3 h-9 rounded-md border border-primary/20">
          <MapPin className="w-4 h-4 shrink-0" />
          Near me · {nearbyCounties.km} km
        </div>
        <div className="flex gap-1">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.km}
              onClick={() => handleRadiusChange(opt.km)}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                nearbyCounties.km === opt.km
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 text-sm"
        onClick={() => locate()}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        Near Me
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
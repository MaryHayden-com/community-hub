import { useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCountiesNearby } from "@/utils/countyCoordinates";

const RADIUS_OPTIONS = [
  { label: "10 km", km: 10 },
  { label: "20 km", km: 20 },
  { label: "30 km", km: 30 },
  { label: "50 km", km: 50 },
  { label: "100 km", km: 100 },
];

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
        let counties = getCountiesNearby(pos.coords.latitude, pos.coords.longitude, km);
        // Always return at least the nearest county even if centroid is > km away
        if (counties.length === 0) {
          counties = getCountiesNearby(pos.coords.latitude, pos.coords.longitude, 999).slice(0, 1);
        }
        onNearbyChange(counties.map((c) => c.county));
        setLoading(false);
      },
      (error) => {
        if (error.code === 1) {
          setError("Location access denied. Please enable in browser settings.");
        } else if (error.code === 3) {
          setError("Location request timed out. Try again or check your connection.");
        } else {
          setError("Could not determine your location. Try again.");
        }
        setLoading(false);
      },
      { timeout: 20000, enableHighAccuracy: false }
    );
  };

  const handleRadiusChange = (km) => {
    setRadius(km);
    if (nearbyCounties) locate(km);
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
          Near me · {nearbyCounties.length} count{nearbyCounties.length === 1 ? "y" : "ies"}
        </div>
        <div className="flex gap-1">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.km}
              onClick={() => handleRadiusChange(opt.km)}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                radius === opt.km
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
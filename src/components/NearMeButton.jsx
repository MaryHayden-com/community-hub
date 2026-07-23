import { useState } from "react";
import { Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RADII = [5, 10, 25, 50, 100];

export default function NearMeButton({ nearbyCounties, onNearbyChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [radius, setRadius] = useState(() => nearbyCounties?.km || 25);

  const isActive = !!nearbyCounties;

  const apply = (lat, lng, km) => onNearbyChange({ lat, lng, km });

  const handleClick = () => {
    if (isActive) {
      onNearbyChange(null);
      setCoords(null);
      setError(null);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        apply(latitude, longitude, radius);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setError("Location access denied — allow it in your browser settings");
        else if (err.code === 3) setError("Location timed out — try again");
        else setError("Couldn't get your location");
      },
      // High accuracy = real GPS, so you get your actual area (not a county-wide guess)
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleClick}
          disabled={loading}
          variant={isActive ? "default" : "outline"}
          className="h-11 gap-2 shrink-0"
          style={isActive ? { background: '#097275' } : {}}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : isActive ? (
            <>
              <Navigation className="w-4 h-4" /> Near Me
              <X className="w-3 h-3 ml-0.5 opacity-70" />
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" /> Near Me
            </>
          )}
        </Button>

        {isActive && (
          <Select
            value={String(radius)}
            onValueChange={(v) => {
              const km = Number(v);
              setRadius(km);
              if (coords) apply(coords.lat, coords.lng, km);
            }}
          >
            <SelectTrigger className="h-11 w-[92px] bg-card font-bold shrink-0" style={{ color: '#097275' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADII.map((km) => (
                <SelectItem key={km} value={String(km)} className="font-bold" style={{ color: '#097275' }}>
                  {km} km
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
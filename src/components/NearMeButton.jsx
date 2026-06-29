import { useState } from "react";
import { Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTY_CENTROIDS } from "@/utils/countyCoordinates";
import { TOWN_COORDINATES } from "@/utils/townCoordinates";

const RADIUS_KM = 25;

export default function NearMeButton({ nearbyCounties, onNearbyChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isActive = !!nearbyCounties;

  const handleClick = () => {
    if (isActive) {
      onNearbyChange(null);
      setError(null);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onNearbyChange({ lat: latitude, lng: longitude, km: RADIUS_KM });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError("Location access denied");
        } else {
          setError("Couldn't get your location");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="flex flex-col gap-1">
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
            <Navigation className="w-4 h-4" />
            Near Me
            <X className="w-3 h-3 ml-0.5 opacity-70" />
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4" />
            Near Me
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NearMeButton({ listings, type = "all" }) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState([]);

  const getTodayStr = () => new Date().toISOString().slice(0, 10);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearby = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lon: longitude });

      // Filter and sort by distance
      const filtered = listings
        .filter((l) => {
          if (type !== "all" && l.type !== type) return false;
          if (type === "whatson" || l.type === "What's On") {
            // Only show upcoming events
            if (!l.event_date || l.event_date < getTodayStr()) return false;
          }
          return l.county && l.town;
        })
        .map((l) => {
          // Use county/town coordinates as approximation
          const coords = getCountyTownCoords(l.county, l.town);
          const distance = coords
            ? calculateDistance(latitude, longitude, coords.lat, coords.lon)
            : 999;
          return { ...l, distance };
        })
        .filter((l) => l.distance < 50) // Within 50km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      setNearbyEvents(filtered);
    } catch (error) {
      console.error("Location error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCountyTownCoords = (county, town) => {
    // Simple coordinate mapping for Irish counties/towns
    const coords = {
      "Dublin": { lat: 53.3498, lon: -6.2603 },
      "Cork": { lat: 51.8985, lon: -8.4756 },
      "Galway": { lat: 53.2707, lon: -9.0568 },
      "Limerick": { lat: 52.6638, lon: -8.6267 },
      "Waterford": { lat: 52.2593, lon: -7.1101 },
      "Kerry": { lat: 52.2731, lon: -9.6983 },
      "Clare": { lat: 52.8436, lon: -8.9774 },
      "Mayo": { lat: 53.8231, lon: -9.2729 },
      "Donegal": { lat: 54.6318, lon: -8.1129 },
      "Wicklow": { lat: 53.0167, lon: -6.0333 },
      "Wexford": { lat: 52.3369, lon: -6.4633 },
      "Kilkenny": { lat: 52.6541, lon: -7.2448 },
      "Tipperary": { lat: 52.5633, lon: -8.1333 },
      "Laois": { lat: 53.0333, lon: -7.3 },
      "Offaly": { lat: 53.1833, lon: -7.6167 },
      "Longford": { lat: 53.7333, lon: -7.8 },
      "Westmeath": { lat: 53.5264, lon: -7.3386 },
      "Meath": { lat: 53.6167, lon: -6.7 },
      "Louth": { lat: 54.0167, lon: -6.4167 },
      "Monaghan": { lat: 54.25, lon: -6.9667 },
      "Cavan": { lat: 53.9833, lon: -7.3667 },
      "Leitrim": { lat: 54.0667, lon: -8.1 },
      "Sligo": { lat: 54.2667, lon: -8.4667 },
      "Roscommon": { lat: 53.6333, lon: -8.1833 },
    };
    return coords[county] || null;
  };

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={findNearby}
        disabled={loading}
        variant="outline"
        className="w-full gap-2"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Finding nearby...
          </span>
        ) : (
          <>
            <Navigation className="w-4 h-4" />
            Find Near Me
          </>
        )}
      </Button>

      {nearbyEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Near You ({formatDistance(nearbyEvents[0].distance)})
          </p>
          {nearbyEvents.map((event) => (
            <a
              key={event.id}
              href={`/listing/${event.id}`}
              className="block p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.town}, {event.county}
                  </p>
                  {event.event_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.event_date + "T12:00:00").toLocaleDateString("en-IE", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-xs shrink-0"
                  style={{ borderColor: '#E2701B', color: '#E2701B' }}
                >
                  {formatDistance(event.distance)}
                </Badge>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
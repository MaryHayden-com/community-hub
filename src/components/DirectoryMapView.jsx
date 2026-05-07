import { useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COUNTY_CENTROIDS } from "@/utils/countyCoordinates";
import { TOWN_COORDINATES } from "@/utils/townCoordinates";
import { MapPin, ExternalLink } from "lucide-react";

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom teal marker icon
function makeIcon(color = "#097275") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const TYPE_COLORS = {
  "Business": "#097275",
  "Club & Group": "#E2701B",
  "Community Services": "#3b82f6",
  "Education": "#8b5cf6",
  "What's On": "#911B1B",
};

function getCoords(listing) {
  const town = listing.town || listing.area;
  if (town && TOWN_COORDINATES[town]) return TOWN_COORDINATES[town];
  if (listing.county) {
    const c = COUNTY_CENTROIDS.find(c => c.county === listing.county);
    if (c) return { lat: c.lat + (Math.random() - 0.5) * 0.04, lng: c.lng + (Math.random() - 0.5) * 0.04 };
  }
  return null;
}

// Auto-fit map bounds to markers
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [coords.map(c => `${c.lat},${c.lng}`).join("|")]);
  return null;
}

export default function DirectoryMapView({ listings }) {
  // Assign coords to each listing (memoised)
  const mapped = useMemo(() => {
    return listings
      .map(l => ({ listing: l, coords: getCoords(l) }))
      .filter(m => m.coords !== null);
  }, [listings]);

  const coords = useMemo(() => mapped.map(m => m.coords), [mapped]);

  // Default center: Ireland
  const defaultCenter = [53.41, -8.24];
  const defaultZoom = 7;

  if (mapped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-3">
        <MapPin className="w-10 h-10 opacity-30" />
        <p>No listings with known locations found.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds coords={coords} />
        {mapped.map(({ listing, coords }) => (
          <Marker
            key={listing.id}
            position={[coords.lat, coords.lng]}
            icon={makeIcon(TYPE_COLORS[listing.type] || "#097275")}
          >
            <Popup maxWidth={240}>
              <div className="p-1">
                <p className="font-bold text-sm" style={{ color: TYPE_COLORS[listing.type] || "#097275" }}>
                  {listing.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{listing.type}</p>
                {(listing.town || listing.county) && (
                  <p className="text-xs text-gray-500">
                    {[listing.town, listing.county].filter(Boolean).join(", ")}
                  </p>
                )}
                {listing.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{listing.description}</p>
                )}
                <Link
                  to={`/listing/${listing.id}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold"
                  style={{ color: "#097275" }}
                >
                  View listing <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow p-2 text-xs space-y-1">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-gray-700">{type}</span>
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow px-3 py-1.5 text-xs font-semibold" style={{ color: "#097275" }}>
        {mapped.length} listings on map
      </div>
    </div>
  );
}
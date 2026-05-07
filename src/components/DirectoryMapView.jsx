import { useMemo, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COUNTY_CENTROIDS } from "@/utils/countyCoordinates";
import { TOWN_COORDINATES } from "@/utils/townCoordinates";
import { Phone, Globe, Mail, ExternalLink, MapPin } from "lucide-react";

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TYPE_COLORS = {
  "Business": "#097275",
  "Club & Group": "#E2701B",
  "Community Services": "#3b82f6",
  "Education": "#8b5cf6",
  "What's On": "#911B1B",
};

function makeIcon(color = "#097275", selected = false) {
  const size = selected ? 36 : 28;
  const r = selected ? 7 : 5;
  const stroke = selected ? 3 : 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.29)}" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="white" stroke-width="${stroke}"/>
    <circle cx="14" cy="14" r="${r}" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, Math.round(size * 1.29)],
    iconAnchor: [size / 2, Math.round(size * 1.29)],
    popupAnchor: [0, -Math.round(size * 1.29)],
  });
}

function getCoords(listing) {
  const town = listing.town || listing.area;
  if (town && TOWN_COORDINATES[town]) return TOWN_COORDINATES[town];
  if (listing.county) {
    const c = COUNTY_CENTROIDS.find(c => c.county === listing.county);
    if (c) return { lat: c.lat + (Math.random() - 0.5) * 0.04, lng: c.lng + (Math.random() - 0.5) * 0.04 };
  }
  return null;
}

function FitBounds({ coordKey, coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView([coords[0].lat, coords[0].lng], 12);
    } else {
      const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [coordKey]);
  return null;
}

export default function DirectoryMapView({ listings }) {
  const [selectedId, setSelectedId] = useState(null);

  const mapped = useMemo(() => {
    return listings
      .map(l => ({ listing: l, coords: getCoords(l) }))
      .filter(m => m.coords !== null);
  }, [listings]);

  const coords = useMemo(() => mapped.map(m => m.coords), [mapped]);
  const coordKey = useMemo(() => coords.map(c => `${c.lat},${c.lng}`).join("|"), [coords]);

  const selectedListing = useMemo(
    () => mapped.find(m => m.listing.id === selectedId)?.listing || null,
    [selectedId, mapped]
  );

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
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Map */}
      <div
        className="relative rounded-xl overflow-hidden border flex-1"
        style={{ height: "calc(100vh - 300px)", minHeight: 380 }}
      >
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
          <FitBounds coordKey={coordKey} coords={coords} />
          {mapped.map(({ listing, coords: c }) => {
            const isSelected = listing.id === selectedId;
            return (
              <Marker
                key={listing.id}
                position={[c.lat, c.lng]}
                icon={makeIcon(TYPE_COLORS[listing.type] || "#097275", isSelected)}
                eventHandlers={{
                  click: () => setSelectedId(prev => prev === listing.id ? null : listing.id),
                }}
                zIndexOffset={isSelected ? 1000 : 0}
              >
                <Popup maxWidth={220} onClose={() => setSelectedId(null)}>
                  <div className="p-1 min-w-[180px]">
                    {listing.image_url && (
                      <img
                        src={listing.image_url}
                        alt={listing.name}
                        className="w-full h-20 object-cover rounded mb-1.5"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    )}
                    <p className="font-bold text-sm leading-tight" style={{ color: TYPE_COLORS[listing.type] || "#097275" }}>
                      {listing.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{listing.type}</p>
                    {(listing.town || listing.county) && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {[listing.town, listing.county].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {listing.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{listing.description}</p>
                    )}
                    {/* Contact quick links */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {listing.phone && (
                        <a href={`tel:${listing.phone}`} className="text-gray-500 hover:text-primary" title={listing.phone}>
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {listing.website && (
                        <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Website">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {listing.email && (
                        <a href={`mailto:${listing.email}`} className="text-gray-500 hover:text-primary" title={listing.email}>
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link
                        to={`/listing/${listing.id}`}
                        className="ml-auto inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: "#097275" }}
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow p-2 text-xs space-y-1">
          {Object.entries(TYPE_COLORS).map(([t, color]) => (
            <div key={t} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-gray-700">{t}</span>
            </div>
          ))}
        </div>

        {/* Count badge */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow px-3 py-1.5 text-xs font-semibold" style={{ color: "#097275" }}>
          {mapped.length} on map
        </div>
      </div>

      {/* Selected listing panel (desktop sidebar / mobile bottom sheet) */}
      {selectedListing && (
        <div className="lg:w-72 bg-card border rounded-xl p-4 flex flex-col gap-3 shrink-0 lg:overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          {selectedListing.image_url && (
            <img src={selectedListing.image_url} alt={selectedListing.name} className="w-full h-32 object-cover rounded-lg" />
          )}
          <div>
            <span
              className="inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white mb-1"
              style={{ background: TYPE_COLORS[selectedListing.type] || "#097275" }}
            >
              {selectedListing.type}
            </span>
            <h3 className="font-display font-bold text-lg leading-tight">{selectedListing.name}</h3>
            {(selectedListing.town || selectedListing.county) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {[selectedListing.town, selectedListing.county].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          {selectedListing.description && (
            <p className="text-sm text-muted-foreground line-clamp-4">{selectedListing.description}</p>
          )}
          <div className="flex flex-col gap-1.5 text-sm">
            {selectedListing.phone && (
              <a href={`tel:${selectedListing.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 shrink-0 text-primary" /> {selectedListing.phone}
              </a>
            )}
            {selectedListing.email && (
              <a href={`mailto:${selectedListing.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                <Mail className="w-4 h-4 shrink-0 text-primary" /> {selectedListing.email}
              </a>
            )}
            {selectedListing.website && (
              <a href={selectedListing.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                <Globe className="w-4 h-4 shrink-0 text-primary" /> {selectedListing.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
          <div className="mt-auto pt-2 flex gap-2">
            <Link
              to={`/listing/${selectedListing.id}`}
              className="flex-1 text-center text-sm font-semibold py-2 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: "#097275" }}
            >
              View Full Listing
            </Link>
            <button
              onClick={() => setSelectedId(null)}
              className="px-3 py-2 rounded-lg border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
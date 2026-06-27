import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IRELAND_COUNTIES, getTownsForCounty, getTownsAndVillagesForCounty } from "../utils/irelandData";
import SearchFilter from "../components/SearchFilter";
import { Loader2, PlusCircle, List, Map } from "lucide-react";
import { haversineKm } from "../utils/countyCoordinates";
import { TOWN_COORDINATES } from "../utils/townCoordinates";
import { COUNTY_CENTROIDS } from "../utils/countyCoordinates";
import DirectoryMapView from "../components/DirectoryMapView";
import { Button } from "@/components/ui/button";
import ListingListRow from "../components/ListingListRow";
import WhatsOnEventRow from "../components/WhatsOnEventRow";
import { sortByTypeOrder } from "../utils/typeOrder";
import SubmitListingForm from "../components/SubmitListingForm";

export default function Directory() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState(params.get("type") || "");
  const [subcategoryGroup, setSubcategoryGroup] = useState(params.get("group") ? [params.get("group")] : []);
  const [category, setCategory] = useState(params.get("category") ? [params.get("category")] : []);
  const [county, setCounty] = useState(() => params.get("county") || localStorage.getItem("dir_county") || "");
  const [town, setTown] = useState(() => params.get("town") || localStorage.getItem("dir_town") || "");
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState("");
  const [nearbyCounties, setNearbyCounties] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const pullDelta = useRef(0);
  const [pullIndicator, setPullIndicator] = useState(0); // 0-1 progress
  const [user, setUser] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);


  useEffect(() => {
    setType(params.get("type") || "");
    setSubcategoryGroup(params.get("group") ? [params.get("group")] : []);
    setCategory(params.get("category") ? [params.get("category")] : []);
    setCounty(params.get("county") || localStorage.getItem("dir_county") || "");
    setTown(params.get("town") || localStorage.getItem("dir_town") || "");
  }, [location.search]);

  const loadListings = useCallback(() => {
    return base44.entities.CommunityListing.list("-created_date", 1000)
      .then(setListings);
  }, []);

  useEffect(() => {
    loadListings().finally(() => setLoading(false));
  }, []);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) pullStartY.current = e.touches[0].clientY;
    else pullStartY.current = 0;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pullStartY.current || refreshing) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0 && window.scrollY === 0) {
      pullDelta.current = delta;
      setPullIndicator(Math.min(delta / 100, 1));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDelta.current > 100 && !refreshing) {
      setRefreshing(true);
      setPullIndicator(1);
      loadListings().finally(() => {
        setRefreshing(false);
        setPullIndicator(0);
      });
    } else {
      setPullIndicator(0);
    }
    pullStartY.current = 0;
    pullDelta.current = 0;
  }, [refreshing, loadListings]);

  const counties = useMemo(() => IRELAND_COUNTIES.map(c => c.county).sort(), []);
  // Helper: normalise a field that may be a string or array
  const toArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);

  const groups = useMemo(() => {
    if (!type) return [];
    const grps = listings.filter((l) => l.type === type).flatMap((l) => toArr(l.subcategory_group)).filter(Boolean);
    return [...new Set(grps)].sort();
  }, [listings, type]);
  const categories = useMemo(() => {
    if (!type || !subcategoryGroup || subcategoryGroup.length === 0) return [];
    const cats = listings
      .filter((l) => l.type === type && toArr(l.subcategory_group).some(g => subcategoryGroup.includes(g)))
      .flatMap((l) => toArr(l.category)).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [listings, type, subcategoryGroup]);
  const towns = useMemo(() => {
    if (!county) return [];
    const staticTowns = getTownsForCounty(county);
    const listingTowns = listings.filter((l) => l.county === county).map((l) => l.town).filter(Boolean);
    return [...new Set([...staticTowns, ...listingTowns])].sort();
  }, [listings, county]);

  const townGroups = useMemo(() => {
    if (!county) return null;
    const { towns: staticTowns, villages: staticVillages } = getTownsAndVillagesForCounty(county);
    const listingTowns = listings.filter((l) => l.county === county).map((l) => l.town).filter(Boolean);
    const allStaticTowns = new Set(staticTowns);
    const allStaticVillages = new Set(staticVillages);
    // Any listing town not in static data goes into villages
    listingTowns.forEach(t => {
      if (!allStaticTowns.has(t) && !allStaticVillages.has(t)) allStaticVillages.add(t);
    });
    return {
      towns: [...allStaticTowns].sort(),
      villages: [...allStaticVillages].sort()
    };
  }, [listings, county]);

  const allCounties = useMemo(() => IRELAND_COUNTIES.map(c => c.county).sort(), []);

  function getNextOccurrence(listing) {
    const t = listing.recurring_type || "weekly";
    const d = listing.recurring_day || "";
    const DAY_MAP = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const today = new Date();
    today.setHours(0,0,0,0);
    if (t === "weekly" || t === "fortnightly") {
      const target = DAY_MAP[d];
      if (target === undefined) return todayStr;
      const diff = (target - today.getDay() + 7) % 7;
      const next = new Date(today);
      next.setDate(today.getDate() + (diff === 0 ? 0 : diff));
      return next.toISOString().slice(0, 10);
    }
    if (t === "2nd_4th_weekday") {
      const target = DAY_MAP[d];
      if (target === undefined) return todayStr;
      const candidates = [];
      for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
        const year = today.getFullYear();
        const month = today.getMonth() + monthOffset;
        const base = new Date(year, month, 1);
        const occurrences = [];
        const cur = new Date(base);
        while (cur.getMonth() === base.getMonth()) {
          if (cur.getDay() === target) occurrences.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        if (occurrences[1]) candidates.push(occurrences[1]);
        if (occurrences[3]) candidates.push(occurrences[3]);
      }
      const next = candidates.find(c => c >= today);
      return next ? next.toISOString().slice(0, 10) : todayStr;
    }
    return todayStr;
  }

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, type, JSON.stringify(subcategoryGroup), JSON.stringify(category), county, town, JSON.stringify(nearbyCounties), dateFrom, dateTo]);

  const filtered = useMemo(() => {
    const isWhatsOn = type === "What's On";
    const base = listings.filter((l) => {
      if (l.status === "pending" || l.status === "rejected") return false;
      if (type && l.type !== type) return false;
      if (subcategoryGroup && subcategoryGroup.length > 0 && !toArr(l.subcategory_group).some(g => subcategoryGroup.includes(g))) return false;
      if (category && category.length > 0 && !toArr(l.category).some(c => category.includes(c))) return false;
      if (nearbyCounties) {
        // Filter by actual listing coordinates vs user GPS location
        const townCoords = TOWN_COORDINATES[l.town] || TOWN_COORDINATES[l.area];
        const countyCoords = COUNTY_CENTROIDS.find(c => c.county === l.county);
        const coords = townCoords || countyCoords;
        if (!coords) return false;
        const dist = haversineKm(nearbyCounties.lat, nearbyCounties.lng, coords.lat, coords.lng);
        if (dist > nearbyCounties.km) return false;
      }
      if (!nearbyCounties && county && l.county !== county) return false;
      if (town && l.town !== town) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          (l.name || "").toLowerCase().includes(s) ||
          (l.description || "").toLowerCase().includes(s) ||
          (Array.isArray(l.category) ? l.category.join(" ") : (l.category || "")).toLowerCase().includes(s) ||
          (l.town || "").toLowerCase().includes(s)
        );
      }
      return true;
    });

    if (!isWhatsOn) {
       return sortByTypeOrder(base);
    }

    // Expand multi-day events into individual day entries
    const expanded = [];
    base.forEach((l) => {
      if (!l.is_recurring && l.event_date && l.event_date_end && l.event_date_end > l.event_date) {
        const start = new Date(l.event_date + "T12:00:00");
        const end = new Date(l.event_date_end + "T12:00:00");
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          expanded.push({ listing: l, date: new Date(d), sortKey: d.toISOString().slice(0, 10) });
        }
      } else if (l.is_recurring) {
        const nextDate = getNextOccurrence(l);
        expanded.push({ listing: l, date: null, sortKey: nextDate });
      } else {
        expanded.push({ listing: l, date: null, sortKey: l.event_date || "9999" });
      }
    });

    expanded.sort((a, b) => {
      const dateComp = a.sortKey.localeCompare(b.sortKey);
      if (dateComp !== 0) return dateComp;
      return (a.listing.event_time || "").localeCompare(b.listing.event_time || "");
    });

    // Filter by date range
    return expanded.filter((entry) => {
      const key = entry.sortKey;
      if (key === "9999") return true; // recurring, always show
      if (dateFrom && key < dateFrom) return false;
      if (dateTo && key > dateTo) return false;
      return true;
    });
  }, [listings, search, type, JSON.stringify(subcategoryGroup), JSON.stringify(category), county, town, JSON.stringify(nearbyCounties), dateFrom, dateTo]);

  const pagedItems = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = pagedItems.length < filtered.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SubmitListingForm open={showSubmitForm} onClose={() => setShowSubmitForm(false)} />

      {/* Pull-to-refresh indicator */}
      {pullIndicator > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-150"
          style={{ height: `${pullIndicator * 48}px`, opacity: pullIndicator }}
        >
          <div className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${refreshing ? "animate-spin" : ""}`} />
        </div>
      )}

      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#097275' }}>Directory</h1>
            <p className="text-muted-foreground mt-0.5 text-sm sm:text-base hidden sm:block">
              Discover the businesses, clubs, schools and events that bring your community together.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* List / Map toggle */}
            <div className="flex rounded-lg border overflow-hidden bg-card">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "list" ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
                style={viewMode === "list" ? { background: "#097275" } : {}}
              >
                <List className="w-3.5 h-3.5" /> <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "map" ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
                style={viewMode === "map" ? { background: "#097275" } : {}}
              >
                <Map className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Map</span>
              </button>
            </div>
            <Button onClick={() => setShowSubmitForm(true)} className="gap-2 shrink-0" style={{ background: '#E2701B', border: 'none' }}>
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Your Listing</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <SearchFilter
        search={search} setSearch={setSearch}
        type={type} setType={setType}
        group={subcategoryGroup} setGroup={setSubcategoryGroup}
        groups={groups}
        category={category} setCategory={setCategory}
        categories={categories}
        county={county} setCounty={setCounty}
        town={town} setTown={setTown}
        counties={counties} towns={towns} townGroups={townGroups}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        todayStr={todayStr}
        nearbyCounties={nearbyCounties} setNearbyCounties={setNearbyCounties}
      />

      {viewMode === "map" ? (
        <div className="mt-4">
          <DirectoryMapView listings={type === "What's On" ? filtered.map(e => e.listing || e) : filtered} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No listings found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          <Button className="mt-4 gap-2" style={{ background: '#E2701B', border: 'none' }} onClick={() => setShowSubmitForm(true)}>
            <PlusCircle className="w-4 h-4" /> Add Your Listing
          </Button>
        </div>
      ) : type === "What's On" ? (
        <div className="flex flex-col gap-3 mt-6">
          {pagedItems.map((entry, i) => (
            <WhatsOnEventRow
              key={entry.listing.id + (entry.sortKey || i)}
              listing={entry.listing}
              overrideDate={entry.date}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-6">
          {pagedItems.map((l) => (
            <ListingListRow key={l.id} listing={l} />
          ))}
        </div>
      )}

      {/* Load More */}
      {viewMode === "list" && hasMore && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="gap-2 px-8" onClick={() => setPage(p => p + 1)}>
            Load more listings ({filtered.length - pagedItems.length} remaining)
          </Button>
        </div>
      )}

      {/* Bottom CTA to add listing */}
      {viewMode === "list" && !hasMore && filtered.length > 0 && (
        <div className="mt-10 rounded-xl p-6 text-center" style={{ background: '#097275' }}>
          <p className="text-white font-display text-xl font-bold mb-1">Is your business or group missing?</p>
          <p className="text-white/80 text-sm mb-4">Add your free listing to the directory today — it only takes a minute.</p>
          <Button onClick={() => setShowSubmitForm(true)} className="gap-2" style={{ background: '#E2701B', border: 'none' }}>
            <PlusCircle className="w-4 h-4" /> Add Your Listing — It's Free
          </Button>
        </div>
      )}
    </div>
  );
}
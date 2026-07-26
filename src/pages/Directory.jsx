import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IRELAND_COUNTIES, getTownsForCounty, getTownsAndVillagesForCounty, ALL_TOWN_NAMES, ALL_VILLAGE_NAMES } from "../utils/irelandData";
import SearchFilter from "../components/SearchFilter";
import { Loader2, PlusCircle, List, Map } from "lucide-react";
import { haversineKm, COUNTY_CENTROIDS } from "../utils/countyCoordinates";
import { TOWN_COORDINATES } from "../utils/townCoordinates";
import DirectoryMapView from "../components/DirectoryMapView";
import { Button } from "@/components/ui/button";
import ListingListRow from "../components/ListingListRow";
import WhatsOnEventRow from "../components/WhatsOnEventRow";
import { sortByTypeOrder } from "../utils/typeOrder";
import SubmitListingForm from "../components/SubmitListingForm";
import { expandAndSortEvents, toArr } from "../utils/recurringEvents";
import NewsletterSignup from "../components/NewsletterSignup";
import NewsletterPopup from "../components/NewsletterPopup";
import SuggestBusinessForm from "../components/SuggestBusinessForm";
import usePageTitle from "@/hooks/usePageTitle";
import HomeHero from "@/components/HomeHero";
import HomeContent from "@/components/HomeContent";
import LocalProofBand from "@/components/LocalProofBand";



const PAGE_SIZE = 50;
const BATCH_SIZE = 200;
const getTodayStr = () => new Date().toISOString().slice(0, 10);

function readParam(params, key) { return params.get(key) || ""; }

export default function Directory() {
  usePageTitle("Local Events, Businesses & Community Groups in Ireland", {
    description: "Find local events, businesses, clubs, classes and community groups across Ireland. Discover what's happening in your town — starting in Bandon and West Cork.",
    path: "/directory",
  });
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // ── Data ────────────────────────────────────────────────────────────────────
  const [browseListings, setBrowseListings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [type, setType] = useState(() => {
    const t = readParam(params, "type");
    return t ? [t] : [];
  });
  const [subcategoryGroup, setSubcategoryGroup] = useState(() => params.get("group") ? [params.get("group")] : []);
  const [category, setCategory] = useState(() => params.get("category") ? [params.get("category")] : []);
  const [county, setCounty] = useState(() => readParam(params, "county") || localStorage.getItem("dir_county") || "");
  const [town, setTown] = useState(() => {
    const raw = readParam(params, "town") || localStorage.getItem("dir_town") || "";
    return raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];
  });
  const [country, setCountry] = useState(() => localStorage.getItem("dir_country") || "");
  const [dateFrom, setDateFrom] = useState(getTodayStr);
  const [dateTo, setDateTo] = useState("");
  const [nearbyCounties, setNearbyCounties] = useState(null);

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);

  // ── Pull-to-refresh ──────────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [pullIndicator, setPullIndicator] = useState(0);
  const pullStartY = useRef(0);
  const pullDelta = useRef(0);

  const searchDebounceRef = useRef(null);
  const searchSectionRef = useRef(null);

  // ── Load all listings in batches (scales to any size) ───────────────────────
  const loadListings = useCallback(async () => {
    let all = [], skip = 0, hasMore = true, isFirstBatch = true;
    while (hasMore) {
      const batch = await base44.entities.CommunityListing.list("-created_date", BATCH_SIZE, skip);
      all = all.concat(batch);
      hasMore = batch.length === BATCH_SIZE;
      skip += BATCH_SIZE;
      // Show results as soon as the first batch is in, then keep loading the rest in the background
      setBrowseListings(all);
      if (isFirstBatch) { setLoading(false); isFirstBatch = false; }
    }
  }, []);

  useEffect(() => {
    loadListings().finally(() => setLoading(false));
  }, [loadListings]);

  // ── Sync URL params → filter state ──────────────────────────────────────────
  useEffect(() => {
    const t = readParam(params, "type");
    setType(t ? [t] : []);
    setSubcategoryGroup(params.get("group") ? [params.get("group")] : []);
    setCategory(params.get("category") ? [params.get("category")] : []);
    const urlCounty = readParam(params, "county") || localStorage.getItem("dir_county") || "";
    const rawTown = readParam(params, "town") || localStorage.getItem("dir_town") || "";
    const urlTown = rawTown ? rawTown.split(",").map(s => s.trim()).filter(Boolean) : [];
    setCounty(urlCounty);
    setTown(urlTown);
    setCountry(localStorage.getItem("dir_country") || "");
  }, [location.search]);

  // Scroll to the search results for a category link, or back to the top for the Directory landing.
  // Wait until browse data has loaded so the scroll target actually exists (matters on a fresh mount
  // from another page, e.g. coming from "What's On").
  useEffect(() => {
    if (loading) return;
    if (params.get("type")) {
      requestAnimationFrame(() => searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }, [loading, location.search]);

  // ── Server-side search (debounced, ≥2 chars) ────────────────────────────────
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!search || search.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("searchListings", { q: search.trim(), limit: 300 });
        setSearchResults(res.data?.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  // ── Pull-to-refresh ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    pullStartY.current = window.scrollY === 0 ? e.touches[0].clientY : 0;
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
      setSearchResults([]);
      loadListings().finally(() => { setRefreshing(false); setPullIndicator(0); });
    } else {
      setPullIndicator(0);
    }
    pullStartY.current = 0;
    pullDelta.current = 0;
  }, [refreshing, loadListings]);

  // ── Derived filter options (always from browse dataset) ─────────────────────
  const countries = useMemo(() => [...new Set(browseListings.map(l => l.country).filter(Boolean))].sort(), [browseListings]);

  const NI_COUNTIES = ["Antrim", "Armagh", "Down", "Fermanagh", "Tyrone", "Derry/Londonderry"];

  const counties = useMemo(() => {
    if (country === "Northern Ireland") return NI_COUNTIES.slice().sort();
    if (country && country !== "Ireland") {
      return [...new Set(browseListings.filter(l => l.country === country).map(l => l.county).filter(Boolean))].sort();
    }
    return IRELAND_COUNTIES.map(c => c.county).sort();
  }, [browseListings, country]);

  // Group/category drill-down only makes sense for a single selected type
  const activeType = type.length === 1 ? type[0] : "";

  const groups = useMemo(() => {
    if (!activeType) return [];
    return [...new Set(
      browseListings.filter(l => l.type === activeType).flatMap(l => toArr(l.subcategory_group)).filter(Boolean)
    )].sort();
  }, [browseListings, activeType]);

  const categories = useMemo(() => {
    if (!activeType || subcategoryGroup.length === 0) return [];
    return [...new Set(
      browseListings
        .filter(l => l.type === activeType && toArr(l.subcategory_group).some(g => subcategoryGroup.includes(g)))
        .flatMap(l => toArr(l.category)).filter(Boolean)
    )].sort();
  }, [browseListings, activeType, subcategoryGroup]);

  const groupCounts = useMemo(() => {
    if (!activeType) return {};
    const counts = {};
    browseListings.filter(l => l.type === activeType).forEach(l => {
      toArr(l.subcategory_group).filter(Boolean).forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    });
    return counts;
  }, [browseListings, activeType]);

  const categoryCounts = useMemo(() => {
    if (!activeType || subcategoryGroup.length === 0) return {};
    const counts = {};
    browseListings
      .filter(l => l.type === activeType && toArr(l.subcategory_group).some(g => subcategoryGroup.includes(g)))
      .forEach(l => {
        toArr(l.category).filter(Boolean).forEach(c => { counts[c] = (counts[c] || 0) + 1; });
      });
    return counts;
  }, [browseListings, activeType, subcategoryGroup]);

  const townGroups = useMemo(() => {
    if (county) {
      const { towns: staticTowns, villages: staticVillages } = getTownsAndVillagesForCounty(county);
      const listingTowns = browseListings.filter(l => l.county === county).map(l => l.town).filter(Boolean);
      const allTowns = new Set(staticTowns);
      const allVillages = new Set(staticVillages);
      listingTowns.forEach(t => { if (!allTowns.has(t) && !allVillages.has(t)) allVillages.add(t); });
      return { towns: [...allTowns].sort(), villages: [...allVillages].sort() };
    }
    // No county selected — classify listing towns globally so the chips aren't empty
    const allTowns = new Set();
    const allVillages = new Set();
    browseListings.forEach(l => {
      const t = l.town;
      if (!t) return;
      if (ALL_TOWN_NAMES.has(t)) allTowns.add(t);
      else if (ALL_VILLAGE_NAMES.has(t)) allVillages.add(t);
      else allVillages.add(t); // unknowns → villages (consistent with county behaviour)
    });
    return { towns: [...allTowns].sort(), villages: [...allVillages].sort() };
  }, [browseListings, county]);

  // towns kept for SearchFilter legacy prop
  const towns = useMemo(() => {
    if (!county) return [];
    return [...new Set([...getTownsForCounty(county), ...browseListings.filter(l => l.county === county).map(l => l.town).filter(Boolean)])].sort();
  }, [browseListings, county]);

  // ── Facet counts for location chip dropdowns ────────────────────────────────
  const facetBase = useMemo(() => browseListings.filter(l => {
    if (l.status === "pending" || l.status === "rejected") return false;
    if (type.length > 0 && !type.includes(l.type)) return false;
    if (subcategoryGroup.length > 0 && !toArr(l.subcategory_group).some(g => subcategoryGroup.includes(g))) return false;
    if (category.length > 0 && !toArr(l.category).some(c => category.includes(c))) return false;
    return true;
  }), [browseListings, type, subcategoryGroup, category]);

  const countryOptions = useMemo(() => {
    const m = {};
    facetBase.forEach(l => { if (l.country) m[l.country] = (m[l.country] || 0) + 1; });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).map(([value, count]) => ({ value, count }));
  }, [facetBase]);

  const countyOptions = useMemo(() => {
    const base = country ? facetBase.filter(l => l.country === country) : facetBase;
    const m = {};
    base.forEach(l => { if (l.county) m[l.county] = (m[l.county] || 0) + 1; });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).map(([value, count]) => ({ value, count }));
  }, [facetBase, country]);

  // Counts per listing type, scoped by current location filters (for the type chips)
  const typeCounts = useMemo(() => {
    const base = browseListings.filter(l => {
      if (l.status === "pending" || l.status === "rejected") return false;
      if (country && l.country !== country) return false;
      if (county && l.county !== county) return false;
      if (town.length > 0 && !town.includes(l.town)) return false;
      return true;
    });
    const counts = { __all: base.length };
    base.forEach(l => { if (l.type) counts[l.type] = (counts[l.type] || 0) + 1; });
    return counts;
  }, [browseListings, country, county, town]);

  const townFacetBase = useMemo(() => facetBase.filter(l => (!country || l.country === country) && (!county || l.county === county)), [facetBase, country, county]);

  const townOptions = useMemo(() => {
    if (!townGroups) return [];
    const m = {};
    townFacetBase.forEach(l => { if (l.town) m[l.town] = (m[l.town] || 0) + 1; });
    return townGroups.towns.map(t => ({ value: t, count: m[t] || 0 }));
  }, [townFacetBase, townGroups]);

  const villageOptions = useMemo(() => {
    if (!townGroups) return [];
    const m = {};
    townFacetBase.forEach(l => { if (l.town) m[l.town] = (m[l.town] || 0) + 1; });
    return townGroups.villages.map(v => ({ value: v, count: m[v] || 0 }));
  }, [townFacetBase, townGroups]);

  // ── Reset page when any filter changes ───────────────────────────────────────
  useEffect(() => { setPage(1); }, [search, type, subcategoryGroup, category, country, county, town, nearbyCounties, dateFrom, dateTo]);

  // ── Active dataset: server search results OR browse set ──────────────────────
  const activeListings = search.trim().length >= 2 ? searchResults : browseListings;

  // ── Filtered + sorted result set ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const isSearch = search.trim().length >= 2;
    const isWhatsOn = type.length === 1 && type[0] === "What's On";

    const base = activeListings.filter(l => {
      if (l.status === "pending" || l.status === "rejected") return false;
      // In search mode the server already filtered by text — only apply geo/type if set
      if (!isSearch) {
        if (type.length > 0 && !type.includes(l.type)) return false;
        if (subcategoryGroup.length > 0 && !toArr(l.subcategory_group).some(g => subcategoryGroup.includes(g))) return false;
        if (category.length > 0 && !toArr(l.category).some(c => category.includes(c))) return false;
        if (nearbyCounties) {
          const coords = TOWN_COORDINATES[l.town?.trim()] || TOWN_COORDINATES[l.area?.trim()] || TOWN_COORDINATES[l.nearest_town?.trim()] || COUNTY_CENTROIDS.find(c => c.county === l.county);
          if (!coords) return false;
          if (haversineKm(nearbyCounties.lat, nearbyCounties.lng, coords.lat, coords.lng) > nearbyCounties.km) return false;
        } else {
          if (country && l.country !== country) return false;
          if (county && l.county !== county) return false;
          if (town.length > 0 && !town.includes(l.town)) return false;
        }
      }
      return true;
    });

    if (!isWhatsOn) return sortByTypeOrder(base);

    return expandAndSortEvents(base, dateFrom, dateTo);
  }, [activeListings, search, type, subcategoryGroup, category, country, county, town, nearbyCounties, dateFrom, dateTo]);

  const pagedItems = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = pagedItems.length < filtered.length;

  // ── Live platform metrics for the "Local trust" section (real numbers) ────────
  const metrics = useMemo(() => {
    const approved = browseListings.filter(l => l.status !== "pending" && l.status !== "rejected");
    const byType = (t) => approved.filter(l => l.type === t).length;
    const towns = new Set(approved.map(l => l.town).filter(Boolean)).size;
    const events = approved.filter(l => l.type === "What's On");
    const weekFrom = getTodayStr();
    const d = new Date(); d.setDate(d.getDate() + 7);
    const weekTo = d.toISOString().slice(0, 10);
    const eventsThisWeek = expandAndSortEvents(events, weekFrom, weekTo).length;
    return {
      businesses: byType("Business"),
      clubs: byType("Club & Group"),
      services: byType("Community Services"),
      education: byType("Education"),
      eventsThisWeek,
      towns,
    };
  }, [browseListings]);

  // ── Render ───────────────────────────────────────────────────────────────────
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
      <SuggestBusinessForm open={showSuggestForm} onClose={() => setShowSuggestForm(false)} />
      <NewsletterPopup />

      {/* Pull-to-refresh indicator */}
      {pullIndicator > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all duration-150"
          style={{ height: `${pullIndicator * 48}px`, opacity: pullIndicator }}
        >
          <div className={`w-6 h-6 border-2 border-primary border-t-transparent rounded-full ${refreshing ? "animate-spin" : ""}`} />
        </div>
      )}

      {/* Brand summary — primary content for SEO & social link previews */}
      <HomeHero
        onAddListing={() => setShowSubmitForm(true)}
        onSuggestBusiness={() => setShowSuggestForm(true)}
        onSearch={() => {
          const el = searchSectionRef.current;
          requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));
        }}
        onSearchWhatsOn={() => {
          setType(["What's On"]);
          const el = searchSectionRef.current;
          requestAnimationFrame(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }));
        }}
      />

      {/* What's happening near you + local proof band */}
      <div className="mb-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>What's happening near you</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Community Hub brings local life into one simple place — featured events, local organisations and recently added listings worth discovering now.
        </p>
      </div>
      {/* Local proof band — live count + featured + next event + recent */}
      <LocalProofBand
        listings={browseListings}
        onSeeWhatsOn={() => {
          setType(["What's On"]);
          searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#097275' }}>Directory</h2>
            <p className="text-muted-foreground mt-0.5 text-sm sm:text-base hidden sm:block">
              Discover the businesses, clubs, schools and events that bring your community together.
            </p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              {searchLoading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</>
                : <>{filtered.length} listing{filtered.length !== 1 ? "s" : ""} found</>
              }
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

          </div>
        </div>

      </div>

      <div ref={searchSectionRef}>
      <SearchFilter
        search={search} setSearch={setSearch}
        type={type} setType={setType}
        typeCounts={typeCounts}
        group={subcategoryGroup} setGroup={setSubcategoryGroup}
        groups={groups}
        groupCounts={groupCounts}
        category={category} setCategory={setCategory}
        categories={categories}
        categoryCounts={categoryCounts}
        country={country} setCountry={setCountry} countryOptions={countryOptions}
        county={county} setCounty={setCounty} countyOptions={countyOptions}
        town={town} setTown={setTown} townOptions={townOptions} villageOptions={villageOptions}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        todayStr={getTodayStr()}
        nearbyCounties={nearbyCounties} setNearbyCounties={setNearbyCounties}
      /></div>

      {/* Results */}
      {viewMode === "map" ? (
        <div className="mt-4">
          <DirectoryMapView listings={(type.length === 1 && type[0] === "What's On") ? filtered.map(e => e.listing || e) : filtered} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No listings found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
          <Button className="mt-4 gap-2" style={{ background: '#E2701B', border: 'none' }} onClick={() => setShowSubmitForm(true)}>
            <PlusCircle className="w-4 h-4" /> Add Your Business or Group
          </Button>
        </div>
      ) : (type.length === 1 && type[0] === "What's On") ? (
        <div className="flex flex-col gap-3 mt-6">
          {pagedItems.map((entry, i) => {
            const prevKey = i > 0 ? pagedItems[i - 1].sortKey : null;
            const showSep = entry.sortKey !== "9999" && entry.sortKey !== prevKey;
            return (
              <div key={entry.listing.id + (entry.sortKey || i)}>
                {showSep && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2 mb-1 pl-1">
                    {new Date(entry.sortKey + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                )}
                <WhatsOnEventRow listing={entry.listing} overrideDate={entry.date} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-6">
          {pagedItems.map((l) => (
            <ListingListRow key={l.id} listing={l} />
          ))}
        </div>
      )}

      {viewMode === "list" && hasMore && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="gap-2 px-8" onClick={() => setPage(p => p + 1)}>
            Load more listings ({filtered.length - pagedItems.length} remaining)
          </Button>
        </div>
      )}

      <HomeContent onAddListing={() => setShowSubmitForm(true)} metrics={metrics} />

      {viewMode === "list" && !hasMore && filtered.length > 0 && (
        <>
          <div className="mt-10 rounded-xl p-6 text-center" style={{ background: '#097275' }}>
            <p className="text-white font-display text-xl font-bold mb-1">Is your business or group missing?</p>
            <p className="text-white/80 text-sm mb-4">Add yours to the directory today — it only takes a minute, and it's free.</p>
            <Button onClick={() => setShowSubmitForm(true)} className="gap-2" style={{ background: '#E2701B', border: 'none' }}>
              <PlusCircle className="w-4 h-4" /> Add Your Business or Community Group
            </Button>
          </div>
          <div className="mt-4 md:hidden p-5 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold mb-1" style={{ color: '#097275' }}>📬 Stay updated on local events & news</p>
            <p className="text-xs text-muted-foreground mb-3">Get the latest listings, events and community news delivered to your inbox.</p>
            <NewsletterSignup source="directory-mobile" />
          </div>
        </>
      )}
    </div>
  );
}
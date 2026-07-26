import { useState } from "react";
import { Search, X, CalendarRange, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NearMeButton from "@/components/NearMeButton";
import FilterMultiChipDropdown from "@/components/FilterMultiChipDropdown";
import FilterChipDropdown from "@/components/FilterChipDropdown";

const TYPE_CHIPS = [
  { label: "All", value: "" },
  { label: "Business", value: "Business" },
  { label: "Clubs", value: "Club & Group" },
  { label: "Community", value: "Community Services" },
  { label: "Education", value: "Education" },
  { label: "What's On", value: "What's On" },
];

export default function SearchFilter({ search, setSearch, type, setType, typeCounts, group, setGroup, groups, groupCounts, category, setCategory, categories, categoryCounts, country, setCountry, countryOptions, county, setCounty, countyOptions, town, setTown, townOptions, villageOptions, dateFrom, setDateFrom, dateTo, setDateTo, todayStr, nearbyCounties, setNearbyCounties }) {
  const selectedTypes = Array.isArray(type) ? type : [];
  const isWhatsOn = selectedTypes.length === 1 && selectedTypes[0] === "What's On";
  const singleType = selectedTypes.length === 1 ? selectedTypes[0] : "";
  const hasFilters = search || selectedTypes.length > 0 || (group && group.length > 0) || (category && category.length > 0) || country || county || (town && town.length > 0) || nearbyCounties || (dateFrom && dateFrom !== todayStr) || dateTo;

  const handleCountry = (v) => { setCountry(v); setCounty(""); setTown([]); localStorage.setItem("dir_country", v); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); };
  const handleCounty = (v) => { setCounty(v); setTown([]); localStorage.setItem("dir_county", v); localStorage.removeItem("dir_town"); };
  const handleTowns = (arr) => { setTown(arr || []); localStorage.setItem("dir_town", (arr || []).join(",")); };

  const [openType, setOpenType] = useState("");
  const toggleIn = (arr, setter, val) => {
    const a = Array.isArray(arr) ? arr : [];
    if (a.includes(val)) setter(a.filter((x) => x !== val));
    else setter([...a, val]);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-card"
        />
      </div>

      {/* Location filter chips — Country / County / Town / Village */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterChipDropdown label="Country" value={country} options={countryOptions} onChange={handleCountry} accent="#097275" />
        <FilterChipDropdown label="County" value={county} options={countyOptions} onChange={handleCounty} accent="#097275" />
        <FilterMultiChipDropdown label="Towns" value={Array.isArray(town) ? town : []} options={townOptions || []} onChange={handleTowns} accent="#097275" />
        <FilterMultiChipDropdown label="Villages" value={Array.isArray(town) ? town : []} options={villageOptions || []} onChange={handleTowns} accent="#E2701B" />
      </div>

      {/* Type chips — tapping a type selects it and opens its group tick-list */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TYPE_CHIPS.map((c) => {
          const sel = c.value !== "" && selectedTypes.length === 1 && selectedTypes[0] === c.value;
          const panelOpen = sel && openType === c.value;
          const count = c.value === "" ? (typeCounts?.__all ?? 0) : (typeCounts?.[c.value] ?? 0);
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                if (c.value === "") { setType([]); setGroup([]); setCategory([]); setOpenType(""); return; }
                if (sel) { setOpenType(panelOpen ? "" : c.value); }
                else { setType([c.value]); setGroup([]); setCategory([]); setOpenType(c.value); }
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[40px] text-xs font-bold whitespace-nowrap border transition-colors ${sel ? "text-white" : "bg-card border-border hover:border-primary"}`}
              style={sel ? { background: "#097275", borderColor: "#097275" } : {}}
            >
              {c.label}
              <span
                className="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none"
                style={sel
                  ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                  : { background: "rgba(9,114,117,0.1)", color: "#097275" }}
              >
                {count}
              </span>
              {c.value !== "" && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${panelOpen ? "rotate-180" : ""}`} />}
            </button>
          );
        })}
      </div>

      {/* Groups tick-list for the active type */}
      {singleType && openType === singleType && groups && groups.length > 0 && (
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <p className="text-xs font-semibold mb-2" style={{ color: "#097275" }}>Groups in {singleType}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-56 overflow-y-auto">
            {groups.map((g) => {
              const isSel = (group || []).includes(g);
              return (
                <button key={g} type="button" onClick={() => { toggleIn(group, setGroup, g); setCategory([]); }}
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent text-left min-h-[44px]">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSel ? "" : "border-input"}`} style={isSel ? { background: "#097275", borderColor: "#097275" } : {}}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="flex-1">{g}</span>
                  <span className="text-xs text-muted-foreground">{groupCounts?.[g] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories tick-list (after groups chosen) */}
      {singleType && (group || []).length > 0 && categories && categories.length > 0 && (
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <p className="text-xs font-semibold mb-2" style={{ color: "#097275" }}>Categories</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-56 overflow-y-auto">
            {categories.map((cat) => {
              const isSel = (category || []).includes(cat);
              return (
                <button key={cat} type="button" onClick={() => toggleIn(category, setCategory, cat)}
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent text-left min-h-[44px]">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSel ? "" : "border-input"}`} style={isSel ? { background: "#097275", borderColor: "#097275" } : {}}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="flex-1">{cat}</span>
                  <span className="text-xs text-muted-foreground">{categoryCounts?.[cat] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Near Me + Clear */}
      <div className="flex gap-2 flex-wrap items-center justify-end">
        <NearMeButton nearbyCounties={nearbyCounties} onNearbyChange={(v) => { setNearbyCounties(v); if (v) { setCounty(""); setTown([]); } }} />

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-11 text-muted-foreground shrink-0" onClick={() => { setSearch(""); setType([]); setGroup([]); setCategory([]); setCountry(""); setCounty(""); setTown([]); if (setNearbyCounties) setNearbyCounties(null); localStorage.removeItem("dir_country"); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); if (setDateFrom) { setDateFrom(todayStr); setDateTo(""); } }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Date range (What's On only) */}
      {isWhatsOn && setDateFrom && (
        <div className="flex items-center gap-2 bg-card border rounded-md px-3 h-11 w-full">
          <CalendarRange className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 min-w-0"
            title="From date"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 min-w-0"
            placeholder="End date"
            title="To date"
          />
        </div>
      )}
    </div>
  );
}
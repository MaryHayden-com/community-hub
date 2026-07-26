import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NearMeButton from "@/components/NearMeButton";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import FilterChipDropdown from "@/components/FilterChipDropdown";

const TYPE_CHIPS = [
  { label: "All", value: "" },
  { label: "Business", value: "Business" },
  { label: "Clubs", value: "Club & Group" },
  { label: "Community", value: "Community Services" },
  { label: "Education", value: "Education" },
  { label: "What's On", value: "What's On" },
];

export default function SearchFilter({ search, setSearch, type, setType, group, setGroup, groups, groupCounts, category, setCategory, categories, categoryCounts, country, setCountry, countryOptions, county, setCounty, countyOptions, town, setTown, townOptions, villageOptions, dateFrom, setDateFrom, dateTo, setDateTo, todayStr, nearbyCounties, setNearbyCounties }) {
  const selectedTypes = Array.isArray(type) ? type : [];
  const isWhatsOn = selectedTypes.length === 1 && selectedTypes[0] === "What's On";
  const singleType = selectedTypes.length === 1 ? selectedTypes[0] : "";
  const hasFilters = search || selectedTypes.length > 0 || (group && group.length > 0) || (category && category.length > 0) || country || county || town || nearbyCounties || (dateFrom && dateFrom !== todayStr) || dateTo;

  const handleCountry = (v) => { setCountry(v); setCounty(""); setTown(""); localStorage.setItem("dir_country", v); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); };
  const handleCounty = (v) => { setCounty(v); setTown(""); localStorage.setItem("dir_county", v); localStorage.removeItem("dir_town"); };
  const handleTown = (v) => { setTown(v); localStorage.setItem("dir_town", v); };

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
        <FilterChipDropdown label="Town" value={town} options={townOptions} onChange={handleTown} accent="#097275" />
        <FilterChipDropdown label="Village" value={town} options={villageOptions} onChange={handleTown} accent="#E2701B" />
      </div>

      {/* Type — single-select chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TYPE_CHIPS.map((c) => {
          const active = c.value === "" ? selectedTypes.length === 0 : selectedTypes.length === 1 && selectedTypes[0] === c.value;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => { setType(c.value ? [c.value] : []); setGroup([]); setCategory([]); }}
              className={`flex items-center rounded-full px-3 py-2 min-h-[40px] text-xs font-bold whitespace-nowrap border transition-colors ${active ? "text-white" : "bg-card border-border hover:border-primary"}`}
              style={active ? { background: "#097275", borderColor: "#097275" } : {}}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Near Me + Clear */}
      <div className="flex gap-2 flex-wrap items-center justify-end">
        <NearMeButton nearbyCounties={nearbyCounties} onNearbyChange={(v) => { setNearbyCounties(v); if (v) { setCounty(""); setTown(""); } }} />

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-11 text-muted-foreground shrink-0" onClick={() => { setSearch(""); setType([]); setGroup([]); setCategory([]); setCountry(""); setCounty(""); setTown(""); if (setNearbyCounties) setNearbyCounties(null); localStorage.removeItem("dir_country"); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); if (setDateFrom) { setDateFrom(todayStr); setDateTo(""); } }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Group / Category (only when exactly one type is chosen) */}
      {singleType && groups && groups.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <MultiSelectDropdown
              options={groups}
              selected={group || []}
              onChange={(v) => { setGroup(v); setCategory([]); }}
              placeholder="All Groups"
              counts={groupCounts}
            />
          </div>
          {group && group.length > 0 && categories && categories.length > 0 && (
            <div className="flex-1 min-w-[150px]">
              <MultiSelectDropdown
                options={categories}
                selected={category || []}
                onChange={setCategory}
                placeholder="All Categories"
                counts={categoryCounts}
              />
            </div>
          )}
        </div>
      )}

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
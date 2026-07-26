import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NearMeButton from "@/components/NearMeButton";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

const TYPE_OPTIONS = ["Business", "Club & Group", "Community Services", "Education", "What's On"];

export default function SearchFilter({ search, setSearch, type, setType, group, setGroup, groups, groupCounts, category, setCategory, categories, categoryCounts, country, setCountry, countries, county, setCounty, town, setTown, counties, towns, townGroups, dateFrom, setDateFrom, dateTo, setDateTo, todayStr, nearbyCounties, setNearbyCounties }) {
  const selectedTypes = Array.isArray(type) ? type : [];
  const isWhatsOn = selectedTypes.length === 1 && selectedTypes[0] === "What's On";
  const singleType = selectedTypes.length === 1 ? selectedTypes[0] : "";
  const hasFilters = search || selectedTypes.length > 0 || (group && group.length > 0) || (category && category.length > 0) || country || county || town || nearbyCounties || (dateFrom && dateFrom !== todayStr) || dateTo;

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

      {/* Type — multi-select dropdown (pick several types at once) */}
      <MultiSelectDropdown
        options={TYPE_OPTIONS}
        selected={selectedTypes}
        onChange={(v) => { setType(v); setGroup([]); setCategory([]); }}
        placeholder="All Types"
      />

      {/* Country — single-select dropdown */}
      <Select value={country || "all"} onValueChange={(v) => { const val = v === "all" ? "" : v; setCountry(val); setCounty(""); setTown(""); localStorage.setItem("dir_country", val); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); }}>
        <SelectTrigger className="h-11 bg-card font-bold w-full" style={{ color: '#097275' }}>
          <SelectValue placeholder="All Countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Countries</SelectItem>
          {countries.map((c) => (
            <SelectItem key={c} value={c} className="font-bold" style={{ color: '#097275' }}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* County + Town — single-select dropdowns */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={county || "all"} onValueChange={(v) => { const val = v === "all" ? "" : v; setCounty(val); setTown(""); localStorage.setItem("dir_county", val); localStorage.removeItem("dir_town"); }}>
          <SelectTrigger className="h-11 bg-card font-bold w-full" style={{ color: '#097275' }}>
            <SelectValue placeholder="All Counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Counties</SelectItem>
            {[...counties].sort().map((c) => (
              <SelectItem key={c} value={c} className="font-bold" style={{ color: '#097275' }}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={town || "all"} onValueChange={(v) => { const val = v === "all" ? "" : v; setTown(val); localStorage.setItem("dir_town", val); }}>
          <SelectTrigger className="h-11 bg-card font-bold w-full" style={{ color: '#097275' }}>
            <SelectValue placeholder="All Towns & Villages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Towns & Villages</SelectItem>
            {townGroups ? (
              [...townGroups.towns, ...townGroups.villages].map((t) => (
                <SelectItem key={t} value={t} className="font-bold" style={{ color: '#097275' }}>{t}</SelectItem>
              ))
            ) : (
              [...towns].sort().map((t) => (
                <SelectItem key={t} value={t} className="font-bold" style={{ color: '#097275' }}>{t}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
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
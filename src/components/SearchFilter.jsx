import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NearMeButton from "@/components/NearMeButton";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 h-11 text-xs font-bold border flex items-center transition-colors"
      style={active
        ? { background: "#097275", color: "#fff", borderColor: "#097275" }
        : { background: "hsl(var(--card))", color: "#097275", borderColor: "rgba(9,114,117,0.35)" }}
    >
      {children}
    </button>
  );
}

export default function SearchFilter({ search, setSearch, type, setType, group, setGroup, groups, groupCounts, category, setCategory, categories, categoryCounts, country, setCountry, countries, county, setCounty, town, setTown, counties, towns, townGroups, dateFrom, setDateFrom, dateTo, setDateTo, todayStr, nearbyCounties, setNearbyCounties }) {
  const isWhatsOn = type === "What's On";
  const hasFilters = search || type || (group && group.length > 0) || (category && category.length > 0) || country || county || town || nearbyCounties || (dateFrom && dateFrom !== todayStr) || dateTo;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-card"
        />
      </div>

      {/* Country — chips */}
      <div className="flex gap-2 flex-wrap items-center">
        <Chip
          active={!country}
          onClick={() => { setCountry(""); setCounty(""); setTown(""); localStorage.removeItem("dir_country"); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); }}
        >
          All Countries
        </Chip>
        {countries.map((c) => (
          <Chip
            key={c}
            active={country === c}
            onClick={() => { setCountry(c); setCounty(""); setTown(""); localStorage.setItem("dir_country", c); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); }}
          >
            {c}
          </Chip>
        ))}
      </div>

      {/* County — chips */}
      <div className="flex gap-2 flex-wrap items-center">
        <Chip
          active={!county}
          onClick={() => { setCounty(""); setTown(""); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); }}
        >
          All Counties
        </Chip>
        {[...counties].sort().map((c) => (
          <Chip
            key={c}
            active={county === c}
            onClick={() => { setCounty(c); setTown(""); localStorage.setItem("dir_county", c); localStorage.removeItem("dir_town"); }}
          >
            {c}
          </Chip>
        ))}
      </div>

      {/* Town / Village — chips (shown once a county is chosen) */}
      {(county || town) && (
        <div className="flex gap-2 flex-wrap items-center">
          <Chip
            active={!town}
            onClick={() => { setTown(""); localStorage.removeItem("dir_town"); }}
          >
            All Towns & Villages
          </Chip>
          {(townGroups ? [...townGroups.towns, ...townGroups.villages] : [...towns].sort()).map((t) => (
            <Chip
              key={t}
              active={town === t}
              onClick={() => { setTown(t); localStorage.setItem("dir_town", t); }}
            >
              {t}
            </Chip>
          ))}
        </div>
      )}

      {/* Row 2: Browse by type — chips list the 5 groups at a glance (drill-down happens on tap) */}
      <div className="flex gap-2 flex-wrap items-center">
        {[
          { value: "", label: "All" },
          { value: "Business", label: "Business" },
          { value: "Club & Group", label: "Clubs" },
          { value: "Community Services", label: "Community" },
          { value: "Education", label: "Education" },
          { value: "What's On", label: "What's On" },
        ].map((opt) => {
          const active = (opt.value ? type === opt.value : !type);
          return (
            <Chip
              key={opt.value || "all"}
              active={active}
              onClick={() => { setType(opt.value); setGroup([]); setCategory([]); }}
            >
              {opt.label}
            </Chip>
          );
        })}
      </div>

      {/* Row 2b: Near Me + Clear */}
      <div className="flex gap-2 flex-wrap items-center justify-end">
        <NearMeButton nearbyCounties={nearbyCounties} onNearbyChange={(v) => { setNearbyCounties(v); if (v) { setCounty(""); setTown(""); } }} />

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-11 text-muted-foreground shrink-0" onClick={() => { setSearch(""); setType(""); setGroup([]); setCategory([]); setCountry(""); setCounty(""); setTown(""); if (setNearbyCounties) setNearbyCounties(null); localStorage.removeItem("dir_country"); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); if (setDateFrom) { setDateFrom(todayStr); setDateTo(""); } }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Row 3: Group / Category (conditional) */}
      {type && groups && groups.length > 0 && (
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

      {/* Row 4: Date range (What's On only) */}
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
import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import NearMeButton from "@/components/NearMeButton";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

export default function SearchFilter({ search, setSearch, type, setType, group, setGroup, groups, groupCounts, category, setCategory, categories, categoryCounts, county, setCounty, town, setTown, counties, towns, townGroups, dateFrom, setDateFrom, dateTo, setDateTo, todayStr, nearbyCounties, setNearbyCounties }) {
  const isWhatsOn = type === "What's On";
  const hasFilters = search || type || (group && group.length > 0) || (category && category.length > 0) || county || town || nearbyCounties || (dateFrom && dateFrom !== todayStr) || dateTo;

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

      {/* Row 1: County + Town */}
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
            <SelectValue placeholder="All Towns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Towns & Villages</SelectItem>
            {townGroups ? (
              <>
                {townGroups.towns.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">Towns</SelectLabel>
                    {townGroups.towns.map((t) => (
                      <SelectItem key={t} value={t} className="font-bold" style={{ color: '#097275' }}>{t}</SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {townGroups.villages.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">Villages</SelectLabel>
                    {townGroups.villages.map((t) => (
                      <SelectItem key={t} value={t} className="font-bold" style={{ color: '#097275' }}>{t}</SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </>
            ) : (
              [...towns].sort().map((t) => (
                <SelectItem key={t} value={t} className="font-bold" style={{ color: '#097275' }}>{t}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Type + Near Me + Clear */}
      <div className="flex gap-2 flex-wrap items-center">
        <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); setGroup([]); setCategory([]); }}>
          <SelectTrigger className="h-11 bg-card font-bold flex-1 min-w-[130px]" style={{ color: '#097275' }}>
            <SelectValue placeholder="All Listing Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Listing Categories</SelectItem>
            <SelectGroup>
              <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">Listings</SelectLabel>
              <SelectItem value="Business" className="font-bold" style={{ color: '#097275' }}>Business & Retail</SelectItem>
              <SelectItem value="Club & Group" className="font-bold" style={{ color: '#097275' }}>Clubs & Groups</SelectItem>
              <SelectItem value="Community Services" className="font-bold" style={{ color: '#097275' }}>Community Services</SelectItem>
              <SelectItem value="Education" className="font-bold" style={{ color: '#097275' }}>Education & Training</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1">Events</SelectLabel>
              <SelectItem value="What's On" className="font-bold" style={{ color: '#097275' }}>What's On</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <NearMeButton nearbyCounties={nearbyCounties} onNearbyChange={(v) => { setNearbyCounties(v); if (v) { setCounty(""); setTown(""); } }} />

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-11 text-muted-foreground shrink-0" onClick={() => { setSearch(""); setType(""); setGroup([]); setCategory([]); setCounty(""); setTown(""); if (setNearbyCounties) setNearbyCounties(null); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); if (setDateFrom) { setDateFrom(todayStr); setDateTo(""); } }}>
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
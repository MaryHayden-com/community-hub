import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NearMeButton from "@/components/NearMeButton";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

export default function SearchFilter({ search, setSearch, type, setType, group, setGroup, groups, category, setCategory, categories, county, setCounty, town, setTown, counties, towns, dateFrom, setDateFrom, dateTo, setDateTo, todayStr, nearbyCounties, setNearbyCounties }) {
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

      <div className="flex flex-wrap gap-2">
        <Select value={county || "all"} onValueChange={(v) => { const val = v === "all" ? "" : v; setCounty(val); setTown(""); localStorage.setItem("dir_county", val); localStorage.removeItem("dir_town"); }}>
          <SelectTrigger className="w-[160px] h-11 bg-card font-bold" style={{ color: '#097275' }}>
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
          <SelectTrigger className="w-[160px] h-11 bg-card font-bold" style={{ color: '#097275' }}>
            <SelectValue placeholder="All Towns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Towns</SelectItem>
            {[...towns].sort().map((t) => (
              <SelectItem key={t} value={t} className="font-bold" style={{ color: '#097275' }}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); setGroup(""); setCategory(""); }}>
          <SelectTrigger className="w-[160px] h-11 bg-card font-bold" style={{ color: '#097275' }}>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-bold" style={{ color: '#097275' }}>All Types</SelectItem>
            <SelectItem value="Business" className="font-bold" style={{ color: '#097275' }}>Business</SelectItem>
            <SelectItem value="Club & Group" className="font-bold" style={{ color: '#097275' }}>Clubs & Groups</SelectItem>
            <SelectItem value="Community Services" className="font-bold" style={{ color: '#097275' }}>Services</SelectItem>
            <SelectItem value="Education" className="font-bold" style={{ color: '#097275' }}>Education</SelectItem>
            <SelectItem value="What's On" className="font-bold" style={{ color: '#097275' }}>What's On</SelectItem>
          </SelectContent>
        </Select>

        {type && groups && groups.length > 0 && (
          <div className="w-[200px]">
            <MultiSelectDropdown
              options={groups}
              selected={group || []}
              onChange={(v) => { setGroup(v); setCategory([]); }}
              placeholder="All Groups"
            />
          </div>
        )}

        {type && group && group.length > 0 && categories && categories.length > 0 && (
          <div className="w-[200px]">
            <MultiSelectDropdown
              options={categories}
              selected={category || []}
              onChange={setCategory}
              placeholder="All Categories"
            />
          </div>
        )}

        {isWhatsOn && setDateFrom && (
          <div className="flex items-center gap-2 bg-card border rounded-md px-3 h-11">
            <CalendarRange className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-sm outline-none w-[130px]"
              title="From date"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-sm outline-none w-[130px]"
              placeholder="End date"
              title="To date"
            />
          </div>
        )}

        <NearMeButton nearbyCounties={nearbyCounties} onNearbyChange={(v) => { setNearbyCounties(v); if (v) { setCounty(""); setTown(""); } }} />

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-11 text-muted-foreground" onClick={() => { setSearch(""); setType(""); setGroup([]); setCategory([]); setCounty(""); setTown(""); setNearbyCounties(null); localStorage.removeItem("dir_county"); localStorage.removeItem("dir_town"); if (setDateFrom) { setDateFrom(todayStr); setDateTo(""); } }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
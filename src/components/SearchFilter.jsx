import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORY_MAP = {
  "Business": ["Accountant", "B&B", "Bakery", "Barber", "Bar & Pub", "Butcher", "Café", "Carpenter", "Childcare & Crèche", "Cleaning Services", "Clothing & Fashion", "Craft & Hobby", "Dentist", "Electrician", "Estate Agent", "Financial Services", "Fishmonger", "Florist", "Garage & Motor", "Gift Shop", "GP & Medical", "Grocery", "Gym & Fitness", "Hair & Beauty", "Hardware", "Hotel", "Newsagent", "Off Licence", "Pharmacy", "Plumber", "Restaurant", "Solicitor", "Supermarket", "Takeaway", "Veterinary", "Bookshop", "Painter & Decorator", "Builder"],
  "Club & Group": ["Athletics", "Art & Craft", "Baptist Church", "Book Club", "Boxing", "Buddhist Centre", "Catholic Church", "Charity", "Church of Ireland", "Community Group", "Community Library", "County Library", "Cycling", "Dance", "Drama & Theatre", "Equestrian", "Evangelical Church", "Faith Community", "Gardening Club", "GAA", "Girl Guides", "Golf", "Hindu Temple", "Islamic Centre / Mosque", "ICA", "Jewish Synagogue", "Martial Arts", "Men's Shed", "Methodist Church", "Mobile Library", "Music", "Presbyterian Church", "Public Library", "Quaker Meeting House", "Residents Association", "Rowing", "Rugby", "Sailing", "School Library", "Scouts", "Senior Citizens", "Soccer / Football", "Swimming", "Tennis", "Tidy Towns", "To astmasters", "University Library", "Women's Group", "Youth Club"],
  "Education": ["Adult Education", "Arts & Drama", "Childcare", "Community Training", "Crèche", "Further Education", "Gaelcholáiste", "Gaelscoil", "Language School", "Montessori", "Music Lessons", "Primary School", "Secondary School", "Special Education", "Sports Coaching", "Third Level", "Tutoring", "Youthreach"],
  "What's On": ["Christmas Event", "Community Event", "Concert", "Cultural Event", "Exhibition", "Family Event", "Festival", "Food Event", "Fundraiser", "Market", "Outdoor Event", "Sports Event", "Summer Event", "Talk & Lecture", "Theatre", "Workshop"]
};

export default function SearchFilter({ search, setSearch, type, setType, category, setCategory, county, setCounty, town, setTown, counties, towns, dateFrom, setDateFrom, dateTo, setDateTo, todayStr }) {
  const isWhatsOn = type === "What's On";
  const hasFilters = search || type || category || county || town || (dateFrom && dateFrom !== todayStr) || dateTo;
  const categoryOptions = type ? CATEGORY_MAP[type] || [] : [];

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
        <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); setCategory(""); }}>
          <SelectTrigger className="w-[160px] h-9 bg-card">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Club & Group">Clubs & Groups</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="What's On">What's On</SelectItem>
          </SelectContent>
        </Select>

        {type && categoryOptions.length > 0 && (
          <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px] h-9 bg-card">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={county || "all"} onValueChange={(v) => { setCounty(v === "all" ? "" : v); setTown(""); }}>
          <SelectTrigger className="w-[160px] h-9 bg-card">
            <SelectValue placeholder="All Counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {[...counties].sort().map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={town || "all"} onValueChange={(v) => setTown(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[160px] h-9 bg-card">
            <SelectValue placeholder="All Towns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Towns</SelectItem>
            {[...towns].sort().map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isWhatsOn && setDateFrom && (
          <div className="flex items-center gap-2 bg-card border rounded-md px-3 h-9">
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

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={() => { setSearch(""); setType(""); setCategory(""); setCounty(""); setTown(""); if (setDateFrom) { setDateFrom(todayStr); setDateTo(""); } }}>
            <X className="w-3 h-3 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
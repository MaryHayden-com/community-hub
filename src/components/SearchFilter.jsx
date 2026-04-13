import { Search, X, CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORY_MAP = {
  "Business": ["Restaurant", "Café", "Bar & Pub", "Takeaway", "Supermarket", "Grocery", "Pharmacy", "Hardware", "Clothing & Fashion", "Hair & Beauty", "Barber", "Solicitor", "Accountant", "Financial Services", "Estate Agent", "Garage & Motor", "Plumber", "Electrician", "Builder", "Carpenter", "Painter & Decorator", "Cleaning Services", "Childcare & Crèche", "Hotel", "B&B", "Gym & Fitness", "Dentist", "GP & Medical", "Veterinary", "Florist", "Bakery", "Butcher", "Fishmonger", "Off Licence", "Newsagent", "Bookshop", "Gift Shop", "Craft & Hobby"],
  "Club & Group": ["GAA", "Soccer / Football", "Rugby", "Tennis", "Golf", "Athletics", "Swimming", "Cycling", "Boxing", "Martial Arts", "Equestrian", "Rowing", "Sailing", "Scouts", "Girl Guides", "Youth Club", "Tidy Towns", "Community Group", "Residents Association", "Drama & Theatre", "Music", "Dance", "Art & Craft", "Book Club", "Walking Group", "Gardening Club", "Toastmasters", "ICA", "Men's Shed", "Women's Group", "Senior Citizens", "Charity", "Catholic Church", "Church of Ireland", "Methodist Church", "Presbyterian Church", "Baptist Church", "Evangelical Church", "Orthodox Church", "Islamic Centre / Mosque", "Jewish Synagogue", "Hindu Temple", "Buddhist Centre", "Quaker Meeting House", "Faith Community", "Public Library", "County Library", "Mobile Library", "Community Library", "University Library", "School Library"],
  "Education": ["Primary School", "Secondary School", "Further Education", "Third Level", "Youthreach", "Gaelscoil", "Gaelcholáiste", "Special Education", "Montessori", "Childcare", "Crèche", "Tutoring", "Language School", "Music Lessons", "Arts & Drama", "Sports Coaching", "Adult Education", "Community Training"],
  "What's On": ["Festival", "Market", "Concert", "Theatre", "Exhibition", "Sports Event", "Fundraiser", "Community Event", "Workshop", "Talk & Lecture", "Food Event", "Outdoor Event", "Family Event", "Christmas Event", "Summer Event", "Cultural Event"]
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
            {counties.map((c) => (
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
            {towns.map((t) => (
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
import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function FieldRow({ label, field, isHidden, toggleHidden, children }) {
  const hidden = isHidden(field);
  return (
    <div className={`space-y-1 rounded-lg p-2 -mx-2 transition-colors ${hidden ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{hidden ? "Hidden" : "Visible"}</span>
          <Switch checked={!hidden} onCheckedChange={() => toggleHidden(field)} />
        </div>
      </div>
      {children}
    </div>
  );
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const WEEKS = ["1st","2nd","3rd","4th","Last"];

function RecurringFields({ form, update }) {
  const t = form.recurring_type || "weekly";
  return (
    <div className="space-y-3">
      <div>
        <Label>Recurring Pattern</Label>
        <Select value={t} onValueChange={(v) => { update("recurring_type", v); update("recurring_day", ""); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="fortnightly">Fortnightly</SelectItem>
            <SelectItem value="monthly_date">Monthly — on a specific date</SelectItem>
            <SelectItem value="twice_monthly">Twice a month</SelectItem>
            <SelectItem value="monthly_weekday">Monthly — by weekday (e.g. 1st Monday)</SelectItem>
            <SelectItem value="2nd_4th_weekday">2nd & 4th weekday of month (e.g. Toastmasters)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {t === "daily" && (
        <div>
          <Label>Time</Label>
          <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
        </div>
      )}

      {(t === "weekly" || t === "fortnightly") && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Day of Week</Label>
            <Select value={form.recurring_day} onValueChange={(v) => update("recurring_day", v)}>
              <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
              <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
          </div>
        </div>
      )}

      {t === "monthly_date" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Day of Month (1–31)</Label>
            <Input
              type="number" min={1} max={31}
              value={form.recurring_day}
              onChange={(e) => update("recurring_day", e.target.value)}
              placeholder="e.g. 15"
            />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
          </div>
        </div>
      )}

      {t === "twice_monthly" && (
        <div className="space-y-2">
          <Label>Days of Month (e.g. "1, 15")</Label>
          <Input
            value={form.recurring_day}
            onChange={(e) => update("recurring_day", e.target.value)}
            placeholder="e.g. 1, 15"
          />
          <div>
            <Label>Time</Label>
            <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
          </div>
        </div>
      )}

      {t === "monthly_weekday" && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Which</Label>
            <Select
              value={form.recurring_day?.split(" ")[0] || ""}
              onValueChange={(v) => update("recurring_day", `${v} ${form.recurring_day?.split(" ")[1] || ""}`.trim())}
            >
              <SelectTrigger><SelectValue placeholder="e.g. 1st" /></SelectTrigger>
              <SelectContent>{WEEKS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Day</Label>
            <Select
              value={form.recurring_day?.split(" ")[1] || ""}
              onValueChange={(v) => update("recurring_day", `${form.recurring_day?.split(" ")[0] || ""} ${v}`.trim())}
            >
              <SelectTrigger><SelectValue placeholder="e.g. Monday" /></SelectTrigger>
              <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
          </div>
        </div>
      )}

      {t === "2nd_4th_weekday" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Day of Week</Label>
            <Select value={form.recurring_day} onValueChange={(v) => update("recurring_day", v)}>
              <SelectTrigger><SelectValue placeholder="e.g. Thursday" /></SelectTrigger>
              <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminListingForm({ listing, onClose, onSave }) {
  const isNew = !listing?.id;
  const [form, setForm] = useState({
    name: listing?.name || "",
    type: listing?.type || "Business",
    subcategory_group: listing?.subcategory_group || "",
    category: listing?.category || "",
    country: listing?.country || "Ireland",
    county: listing?.county || "",
    town: listing?.town || "",
    description: listing?.description || "",
    address: listing?.address || "",
    phone: listing?.phone || "",
    email: listing?.email || "",
    website: listing?.website || "",
    facebook_url: listing?.facebook_url || "",
    instagram_url: listing?.instagram_url || "",
    linkedin_url: listing?.linkedin_url || "",
    contact_name: listing?.contact_name || "",
    area: listing?.area || "",
    meeting_info: listing?.meeting_info || "",
    event_date: listing?.event_date || "",
    event_date_end: listing?.event_date_end || "",
    event_time: listing?.event_time || "",
    is_recurring: listing?.is_recurring || false,
    recurring_type: listing?.recurring_type || "weekly",
    recurring_day: listing?.recurring_day || "",
    is_free: listing?.is_free ?? null,
    is_featured: listing?.is_featured || false,
    image_url: listing?.image_url || "",
    hidden_fields: listing?.hidden_fields || [],
  });

  const toggleHidden = (field) => {
    setForm(prev => {
      const hidden = prev.hidden_fields || [];
      return {
        ...prev,
        hidden_fields: hidden.includes(field) ? hidden.filter(f => f !== field) : [...hidden, field]
      };
    });
  };
  const isHidden = (field) => (form.hidden_fields || []).includes(field);
  const [saving, setSaving] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  // Auto-fetch image when a URL is added and no image exists yet
  useEffect(() => {
    const urls = [form.website, form.facebook_url, form.instagram_url].filter(Boolean);
    if (!urls.length || form.image_url || fetchingImage) return;
    const timer = setTimeout(async () => {
      setFetchingImage(true);
      try {
        const res = await base44.functions.invoke('fetchOgImage', { urls });
        if (res.data?.image_url) setForm(prev => ({ ...prev, image_url: res.data.image_url }));
      } finally {
        setFetchingImage(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.website, form.facebook_url, form.instagram_url]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const GROUP_MAP = {
    "Business": ["Accommodation", "Food & Beverage", "Healthcare", "Personal Services", "Professional Services", "Retail", "Trades & Construction"],
    "Club & Group": ["Arts & Culture", "Charity & Welfare", "Faith & Religious", "Leisure & Community", "Sports & Recreation", "Youth & Community"],
    "Community Services": ["Faith & Worship", "Libraries"],
    "Education": ["Childcare", "Higher Education", "Schools", "Training & Skills"],
    "What's On": ["Community Activities", "Entertainment", "Festivals & Markets", "Seasonal & Themed"]
  };

  const CATEGORY_BY_GROUP = {
    "Business": {
      "Accommodation": ["Airbnb", "B&B", "Guesthouses", "Hotels", "Room to Let"],
      "Food & Beverage": ["Bakery", "Bar & Pub", "Café", "Restaurant", "Takeaway"],
      "Healthcare": ["Dentist", "GP & Medical", "Pharmacy", "Veterinary"],
      "Personal Services": ["Barber", "Childcare & Crèche", "Cleaning Services", "Gym & Fitness", "Hair & Beauty"],
      "Professional Services": ["Accountant", "Estate Agent", "Financial Services", "Solicitor"],
      "Retail": ["Bookshop", "Butcher", "Clothing & Fashion", "Craft & Hobby", "Fishmonger", "Florist", "Gift Shop", "Grocery", "Hardware", "Health Food & Organic", "Newsagent", "Off Licence", "Supermarket"],
      "Trades & Construction": ["Builder", "Carpenter", "Electrician", "Painter & Decorator", "Plumber"]
    },
    "Club & Group": {
      "Arts & Culture": ["Art & Craft", "Book Club", "Dance", "Drama & Theatre", "Music"],
      "Charity & Welfare": ["Charity"],
      "Faith & Religious": ["Baptist Church", "Buddhist Centre", "Catholic Church", "Church of Ireland", "Evangelical Church", "Faith Community", "Hindu Temple", "Islamic Centre / Mosque", "Jewish Synagogue", "Methodist Church", "Orthodox Church", "Presbyterian Church", "Quaker Meeting House"],
      "Leisure & Community": ["Gardening Club", "ICA", "Men's Shed", "Senior Citizens", "Toastmasters", "Walking Group", "Women's Group"],
      "Sports & Recreation": ["Athletics", "Boxing", "Cycling", "Equestrian", "GAA", "Golf", "Martial Arts", "Rowing", "Rugby", "Sailing", "Soccer / Football", "Swimming", "Tennis"],
      "Youth & Community": ["Community Group", "Girl Guides", "Residents Association", "Scouts", "Tidy Towns", "Youth Club"]
    },
    "Community Services": {
      "Faith & Worship": ["Baptist Church", "Buddhist Centre", "Catholic Church", "Church of Ireland", "Evangelical Church", "Faith Community", "Hindu Temple", "Islamic Centre / Mosque", "Jewish Synagogue", "Methodist Church", "Orthodox Church", "Presbyterian Church", "Quaker Meeting House"],
      "Libraries": ["Community Library", "County Library", "Mobile Library", "Public Library", "School Library", "University Library"]
    },
    "Education": {
      "Childcare": ["Childcare", "Crèche", "Montessori"],
      "Higher Education": ["Further Education", "Third Level"],
      "Schools": ["Gaelcholáiste", "Gaelscoil", "Primary School", "Secondary School", "Special Education"],
      "Training & Skills": ["Adult Education", "Arts & Drama", "Community Training", "Language School", "Music Lessons", "Sports Coaching", "Tutoring", "Youthreach"]
    },
    "What's On": {
      "Community Activities": ["Community Event", "Family Event", "Fundraiser", "Talk & Lecture", "Workshop"],
      "Entertainment": ["Concert", "Exhibition", "Theatre"],
      "Festivals & Markets": ["Festival", "Market"],
      "Seasonal & Themed": ["Christmas Event", "Cultural Event", "Food Event", "Sports Event", "Summer Event"]
    }
  };

  const groupOptions = form.type ? GROUP_MAP[form.type] || [] : [];
  const categoryOptions = form.subcategory_group && CATEGORY_BY_GROUP[form.type]?.[form.subcategory_group] ? CATEGORY_BY_GROUP[form.type][form.subcategory_group] : [];

  const categorySuggestions = useMemo(() => {
    const byType = {
      "Business": [
        "Accountant", "Airbnb", "B&B", "Bakery", "Bar & Pub", "Barber",
        "Bookshop", "Builder", "Butcher", "Café", "Carpenter",
        "Childcare & Crèche", "Cleaning Services", "Clothing & Fashion",
        "Craft & Hobby", "Dentist", "Electrician", "Estate Agent",
        "Financial Services", "Fishmonger", "Florist", "Gift Shop", "GP & Medical",
        "Grocery", "Guesthouses", "Gym & Fitness", "Hair & Beauty", "Hardware",
        "Health Food & Organic", "Hotels", "Newsagent", "Off Licence",
        "Painter & Decorator", "Pharmacy", "Plumber", "Restaurant",
        "Room to Let", "Solicitor", "Supermarket", "Takeaway", "Veterinary",
      ],
      "Club & Group": [
        "Art & Craft", "Athletics", "Baptist Church", "Book Club", "Boxing",
        "Buddhist Centre", "Catholic Church", "Charity", "Church of Ireland",
        "Community Group", "Cycling", "Dance", "Drama & Theatre",
        "Equestrian", "Evangelical Church", "Faith Community", "GAA",
        "Gardening Club", "Girl Guides", "Golf", "Hindu Temple", "ICA",
        "Islamic Centre / Mosque", "Jewish Synagogue", "Martial Arts",
        "Men's Shed", "Methodist Church", "Music", "Orthodox Church",
        "Presbyterian Church", "Quaker Meeting House", "Residents Association",
        "Rowing", "Rugby", "Sailing", "Scouts", "Senior Citizens",
        "Soccer / Football", "Swimming", "Tennis", "Tidy Towns",
        "Toastmasters", "Walking Group", "Women's Group", "Youth Club",
      ],
      "Community Services": [
        "Community Library", "County Library", "Mobile Library",
        "Public Library", "School Library", "University Library",
        "Baptist Church", "Buddhist Centre", "Catholic Church",
        "Church of Ireland", "Evangelical Church", "Faith Community",
        "Hindu Temple", "Islamic Centre / Mosque", "Jewish Synagogue",
        "Methodist Church", "Orthodox Church", "Presbyterian Church",
        "Quaker Meeting House",
      ],
      "Education": [
        "Adult Education", "Arts & Drama", "Childcare", "Community Training",
        "Crèche", "Further Education", "Gaelcholáiste", "Gaelscoil",
        "Language School", "Montessori", "Music Lessons", "Primary School",
        "Secondary School", "Special Education", "Sports Coaching",
        "Third Level", "Tutoring", "Youthreach",
      ],
      "What's On": [
        "Christmas Event", "Community Event", "Concert", "Cultural Event",
        "Exhibition", "Family Event", "Festival", "Food Event", "Fundraiser",
        "Market", "Sports Event", "Summer Event", "Talk & Lecture",
        "Theatre", "Workshop",
      ],
    };
    const list = byType[form.type] || [];
    if (!form.category) return list;
    return list.filter((s) => s.toLowerCase().includes(form.category.toLowerCase()));
  }, [form.type, form.category]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.type || !form.county || !form.town) {
      toast({ title: "Missing fields", description: "Name, type, county and town are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await base44.entities.CommunityListing.create(form);
        toast({ title: "Created", description: `${form.name} added.` });
      } else {
        await base44.entities.CommunityListing.update(listing.id, form);
        toast({ title: "Updated", description: `${form.name} updated.` });
      }
      onSave();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFetchImage = async () => {
    const urls = [form.website, form.facebook_url, form.instagram_url].filter(Boolean);
    if (!urls.length) {
      toast({ title: "No links", description: "Add a website or social link first.", variant: "destructive" });
      return;
    }
    setFetchingImage(true);
    try {
      const res = await base44.functions.invoke('fetchOgImage', { urls });
      if (res.data?.image_url) {
        update("image_url", res.data.image_url);
        toast({ title: "Image found!", description: "Image URL has been populated." });
      } else {
        toast({ title: "No image found", description: "Couldn't find an image from the provided links.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFetchingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update("image_url", file_url);
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add New Listing" : `Edit: ${listing.name}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => { update("type", v); update("subcategory_group", ""); update("category", ""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Club & Group">Club & Group</SelectItem>
                  <SelectItem value="Community Services">Community Services</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="What's On">What's On</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {groupOptions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Group</Label>
                <Select value={form.subcategory_group} onValueChange={(v) => { update("subcategory_group", v); update("category", ""); }}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {categoryOptions.length > 0 && (
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}



          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>County *</Label>
              <Input value={form.county} onChange={(e) => update("county", e.target.value)} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Townland / Village *</Label>
              <Input value={form.town} onChange={(e) => update("town", e.target.value)} placeholder="e.g. Crossmahon, Laragh" />
            </div>
            <div>
              <Label>Nearest Town / Area</Label>
              <Input value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="e.g. Bandon — shows under this area" />
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Contact Details</p>
              <p className="text-xs text-muted-foreground">Toggle = show publicly</p>
            </div>

            <FieldRow label="Contact Name" field="contact_name" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="e.g. John Murphy" />
            </FieldRow>

            <FieldRow label="Phone" field="phone" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 021 123 4567" />
            </FieldRow>

            <FieldRow label="Email Address" field="email" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g. info@example.ie" />
            </FieldRow>

            <FieldRow label="Website" field="website" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            </FieldRow>

            <FieldRow label="Facebook URL" field="facebook_url" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} placeholder="https://facebook.com/..." />
            </FieldRow>

            <FieldRow label="Instagram URL" field="instagram_url" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.instagram_url} onChange={(e) => update("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
            </FieldRow>

            <FieldRow label="LinkedIn URL" field="linkedin_url" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." />
            </FieldRow>

            <FieldRow label="Meeting Info" field="meeting_info" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.meeting_info} onChange={(e) => update("meeting_info", e.target.value)} placeholder="e.g. Every Tuesday at 7pm" />
            </FieldRow>

            <FieldRow label="Address" field="address" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </FieldRow>

            <FieldRow label="Description" field="description" isHidden={isHidden} toggleHidden={toggleHidden}>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
            </FieldRow>
          </div>

          {/* What's On Event Details */}
          {form.type === "What's On" && (
            <div className="border rounded-lg p-4 space-y-3 bg-amber-50/50 border-amber-200">
              <p className="text-sm font-semibold text-amber-800">Event Details</p>

              <div className="flex items-center gap-3">
                <Switch checked={form.is_recurring} onCheckedChange={(v) => update("is_recurring", v)} />
                <Label className="cursor-pointer">Recurring event</Label>
              </div>

              {form.is_recurring ? (
                <RecurringFields form={form} update={update} />
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} />
                    </div>
                    <div>
                      <Label>End Date <span className="text-xs text-muted-foreground">(multi-day)</span></Label>
                      <Input type="date" value={form.event_date_end} onChange={(e) => update("event_date_end", e.target.value)} min={form.event_date} />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input type="time" value={form.event_time} onChange={(e) => update("event_time", e.target.value)} />
                    </div>
                  </div>
                  {form.event_date && form.event_date_end && form.event_date_end > form.event_date && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                      📅 This event will appear on What's On for every day from {new Date(form.event_date + "T12:00:00").toLocaleDateString("en-IE", {day:"numeric",month:"short"})} to {new Date(form.event_date_end + "T12:00:00").toLocaleDateString("en-IE", {day:"numeric",month:"short"})}.
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label>Entry</Label>
                <Select
                  value={form.is_free === true ? "free" : form.is_free === false ? "paid" : ""}
                  onValueChange={(v) => update("is_free", v === "free" ? true : v === "paid" ? false : null)}
                >
                  <SelectTrigger><SelectValue placeholder="Free or Paid?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label>Image</Label>
            <div className="space-y-2 mt-1">
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>or paste a URL</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={form.image_url}
                  onChange={(e) => update("image_url", e.target.value)}
                  className="flex-1"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover border shrink-0" />
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleFetchImage} disabled={fetchingImage} className="gap-1.5 w-full">
                {fetchingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Auto-fetch image from website / social links
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
            <Label className="cursor-pointer">Featured Listing</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isNew ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
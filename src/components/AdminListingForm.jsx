import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  });
  const [saving, setSaving] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const categorySuggestions = useMemo(() => {
    const byType = {
      "Business": [
        "Restaurant", "Café", "Bar & Pub", "Takeaway", "Supermarket", "Grocery",
        "Pharmacy", "Hardware", "Clothing & Fashion", "Hair & Beauty", "Barber",
        "Solicitor", "Accountant", "Financial Services", "Estate Agent",
        "Garage & Motor", "Plumber", "Electrician", "Builder", "Carpenter",
        "Painter & Decorator", "Cleaning Services", "Childcare & Crèche",
        "Hotel", "B&B", "Gym & Fitness", "Dentist", "GP & Medical", "Veterinary",
        "Florist", "Bakery", "Butcher", "Fishmonger", "Off Licence",
        "Newsagent", "Bookshop", "Gift Shop", "Craft & Hobby",
      ],
      "Club & Group": [
        "GAA", "Soccer / Football", "Rugby", "Tennis", "Golf", "Athletics",
        "Swimming", "Cycling", "Boxing", "Martial Arts", "Equestrian",
        "Rowing", "Sailing",
        "Scouts", "Girl Guides", "Youth Club",
        "Tidy Towns", "Community Group", "Residents Association",
        "Drama & Theatre", "Music", "Dance", "Art & Craft", "Book Club",
        "Walking Group", "Gardening Club", "Toastmasters", "ICA",
        "Men's Shed", "Women's Group", "Senior Citizens", "Charity",
        "Catholic Church", "Church of Ireland", "Methodist Church",
        "Presbyterian Church", "Baptist Church", "Evangelical Church",
        "Orthodox Church", "Islamic Centre / Mosque", "Jewish Synagogue",
        "Hindu Temple", "Buddhist Centre", "Quaker Meeting House",
        "Faith Community",
        "Public Library", "County Library", "Mobile Library",
        "Community Library", "University Library", "School Library",
      ],
      "Education": [
        "Primary School", "Secondary School", "Further Education",
        "Third Level", "Youthreach", "Gaelscoil", "Gaelcholáiste",
        "Special Education", "Montessori", "Childcare", "Crèche",
        "Tutoring", "Language School", "Music Lessons", "Arts & Drama",
        "Sports Coaching", "Adult Education", "Community Training",
      ],
      "What's On": [
        "Festival", "Market", "Concert", "Theatre", "Exhibition",
        "Sports Event", "Fundraiser", "Community Event", "Workshop",
        "Talk & Lecture", "Food Event", "Outdoor Event", "Family Event",
        "Christmas Event", "Summer Event", "Cultural Event",
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
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Club & Group">Club & Group</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="What's On">What's On</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Label>Category / Trade Type</Label>
            <Input
              value={form.category}
              onChange={(e) => { update("category", e.target.value); setShowCategorySuggestions(true); }}
              onFocus={() => setShowCategorySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 150)}
              placeholder="e.g. Restaurant, GAA Club, Primary School"
            />
            {showCategorySuggestions && categorySuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {categorySuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                    onMouseDown={() => { update("category", s); setShowCategorySuggestions(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

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

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>

          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>

          {/* Contact Details Section */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Contact Details</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact Name</Label>
                <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="e.g. John Murphy" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g. 021 123 4567" />
              </div>
            </div>

            <div>
              <Label>Email Address</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g. info@example.ie" />
            </div>

            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Facebook URL</Label>
                <Input value={form.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={form.instagram_url} onChange={(e) => update("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." />
              </div>
            </div>

            <div>
              <Label>Meeting Info</Label>
              <Input value={form.meeting_info} onChange={(e) => update("meeting_info", e.target.value)} placeholder="e.g. Every Tuesday at 7pm" />
            </div>
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
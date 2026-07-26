// Maps messy free-text "What's On" group/category values onto a small,
// clean set of streamlined labels so the public filter dropdown stays usable.
const WHATSON_ALIASES = {
  // Community
  "community event": "Community", "community": "Community", "community gathering": "Community",
  "community gatherings": "Community", "community/gathering": "Community", "community activities": "Community",
  "community/sports": "Community", "community/educational": "Community", "agm / meeting": "Community",
  "information evening": "Community", "public consultation": "Community", "town hall meeting": "Community",
  "planning meeting": "Community", "networking": "Community", "safety": "Community", "agriculture": "Community",
  // Music
  "music": "Music", "concert": "Music", "concerts": "Music", "trad": "Music", "folk": "Music",
  "live music": "Music", "dj night": "Music", "jazz night": "Music", "choir performance": "Music",
  "classical music": "Music", "orchestra": "Music", "opera": "Music", "live band": "Music",
  "acoustic night": "Music", "pub music": "Music", "music workshop": "Music", "singing class": "Music",
  "instrument lessons": "Music", "battle of the bands": "Music",
  // Theatre & Drama
  "theatre": "Theatre & Drama", "drama": "Theatre & Drama", "amateur drama": "Theatre & Drama",
  "pantomime": "Theatre & Drama", "dance performance": "Theatre & Drama", "dancing": "Theatre & Drama",
  "dance": "Theatre & Drama", "improv night": "Theatre & Drama", "circus & cabaret": "Theatre & Drama",
  "comedy night": "Theatre & Drama", "stand-up comedy": "Theatre & Drama",
  "performing arts": "Theatre & Drama", "performance": "Theatre & Drama",
  // Film
  "film screening": "Film", "film festival": "Film",
  // Arts & Culture
  "arts": "Arts & Culture", "arts & culture": "Arts & Culture", "art exhibition": "Arts & Culture",
  "photography exhibition": "Arts & Culture", "craft exhibition": "Arts & Culture",
  "gallery opening": "Arts & Culture", "art fair": "Arts & Culture", "sculpture trail": "Arts & Culture",
  "culture": "Arts & Culture", "cultural event": "Arts & Culture", "craft": "Arts & Culture",
  "arts & crafts": "Arts & Culture", "craft workshop": "Arts & Culture", "art class": "Arts & Culture",
  "exhibition": "Arts & Culture",
  // Heritage
  "heritage": "Heritage", "heritage event": "Heritage", "commemoration": "Heritage", "traditional": "Heritage",
  // Sports & Recreation
  "sports": "Sports & Recreation", "sport": "Sports & Recreation", "sports event": "Sports & Recreation",
  "sports events": "Sports & Recreation", "sports & outdoors": "Sports & Recreation",
  "sports/outdoors": "Sports & Recreation", "soccer": "Sports & Recreation", "gaa": "Sports & Recreation",
  "running": "Sports & Recreation", "walking": "Sports & Recreation", "hiking event": "Sports & Recreation",
  "outdoor": "Sports & Recreation", "open water swim": "Sports & Recreation",
  "sailing regatta": "Sports & Recreation", "surf competition": "Sports & Recreation",
  "orienteering": "Sports & Recreation", "mountain bike race": "Sports & Recreation",
  "sport & recreation": "Sports & Recreation",
  // Health & Fitness
  "fitness": "Health & Fitness", "health & fitness": "Health & Fitness", "yoga": "Health & Fitness",
  // Festivals
  "festival": "Festivals", "festivals": "Festivals", "festivals & markets": "Festivals",
  "festivals & sales": "Festivals", "events & festivals": "Festivals", "events & activities": "Festivals",
  "harvest festival": "Festivals", "summer festival": "Festivals", "street festival": "Festivals",
  "arts festival": "Festivals", "cultural festival": "Festivals", "community festival": "Festivals",
  "heritage / festival": "Festivals",
  // Markets
  "market": "Markets", "markets": "Markets", "farmers market": "Markets", "craft market": "Markets",
  "christmas market": "Markets", "car boot sale": "Markets", "flea market": "Markets",
  "pop-up market": "Markets", "shopping": "Markets",
  // Family & Kids
  "kids": "Family & Kids", "children": "Family & Kids", "kids event": "Family & Kids",
  "kids workshop": "Family & Kids", "summer camp": "Family & Kids", "kids art class": "Family & Kids",
  "kids sports": "Family & Kids", "family": "Family & Kids", "family fun day": "Family & Kids",
  "treasure hunt": "Family & Kids", "circus skills": "Family & Kids", "family walk": "Family & Kids",
  "puppet show": "Family & Kids", "storytelling": "Family & Kids",
  // Food & Drink
  "food & drink": "Food & Drink", "food tasting": "Food & Drink", "pop-up restaurant": "Food & Drink",
  "supper club": "Food & Drink", "cookery demonstration": "Food & Drink", "cookery class": "Food & Drink",
  "brewery tour": "Food & Drink", "distillery tour": "Food & Drink", "afternoon tea": "Food & Drink",
  "bbq": "Food & Drink", "céilí": "Food & Drink", "food festival": "Food & Drink", "food market": "Food & Drink",
  // Charity & Fundraising
  "charity": "Charity & Fundraising", "charity run": "Charity & Fundraising",
  "charity walk": "Charity & Fundraising", "fundraiser": "Charity & Fundraising",
  "gala dinner": "Charity & Fundraising", "charity dinner": "Charity & Fundraising",
  "sponsored walk": "Charity & Fundraising", "quiz": "Charity & Fundraising",
  "quiz night": "Charity & Fundraising", "table quiz": "Charity & Fundraising",
  "coffee morning": "Charity & Fundraising",
  // Seasonal
  "christmas event": "Seasonal", "halloween event": "Seasonal", "st patrick's day": "Seasonal",
  "easter event": "Seasonal", "summer event": "Seasonal", "spring festival": "Seasonal",
  "new year's eve": "Seasonal", "religious ceremony": "Seasonal", "memorial service": "Seasonal",
  "award night": "Seasonal", "graduation": "Seasonal", "anniversary celebration": "Seasonal",
  "halloween event (kids)": "Seasonal", "christmas event (kids)": "Seasonal", "seasonal & themed": "Seasonal",
  // Health & Wellbeing
  "health": "Health & Wellbeing", "wellbeing": "Health & Wellbeing", "wellness workshop": "Health & Wellbeing",
  "mindfulness session": "Health & Wellbeing", "mindfulness": "Health & Wellbeing",
  "meditation class": "Health & Wellbeing", "retreat": "Health & Wellbeing",
  "breathwork session": "Health & Wellbeing", "sound bath": "Health & Wellbeing",
  "health talk": "Health & Wellbeing", "mental health awareness": "Health & Wellbeing",
  "nutrition talk": "Health & Wellbeing", "first aid course": "Health & Wellbeing", "parenting talk": "Health & Wellbeing",
  // Education & Learning
  "education": "Education & Learning", "public lecture": "Education & Learning",
  "book talk": "Education & Learning", "history talk": "Education & Learning",
  "science talk": "Education & Learning", "environmental talk": "Education & Learning",
  "guest speaker": "Education & Learning", "adult learning": "Education & Learning",
  "language class": "Education & Learning", "it class": "Education & Learning",
  "creative writing workshop": "Education & Learning", "photography workshop": "Education & Learning",
  "drama workshop": "Education & Learning", "workshop": "Education & Learning",
  "class": "Education & Learning", "classes & courses": "Education & Learning",
  "demonstration": "Education & Learning", "course": "Education & Learning",
  "seminar & conference": "Education & Learning", "webinar": "Education & Learning",
  "talk & lecture": "Education & Learning",
  // Entertainment / catch-all
  "entertainment": "Entertainment", "competitions": "Entertainment", "business": "Entertainment",
};

const NOISE = new Set(["what's on", "events", "event", "activity", "activities"]);

export function streamlineTag(raw) {
  if (!raw) return "";
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, " ");
  if (!key || NOISE.has(key)) return "";
  return WHATSON_ALIASES[key] || raw.trim();
}

export function getListingTags(listing) {
  const tags = new Set();
  (listing.subcategory_group || []).forEach((g) => {
    const s = streamlineTag(g);
    if (s) tags.add(s);
  });
  (listing.category || []).forEach((c) => {
    const s = streamlineTag(c);
    if (s) tags.add(s);
  });
  return [...tags];
}
/**
 * Master taxonomy: Type → Group → Categories
 * Categories that appear in multiple groups are cross-linked automatically.
 * When a user picks categories, groups are derived automatically.
 */

export const TAXONOMY = {
  "Business": {
    "Accommodation": [
      "Airbnb / Short-term Let", "B&B", "Guesthouse", "Hotel", "Room to Let",
      "Self-Catering", "Hostel", "Glamping & Camping"
    ],
    "Food & Beverage": [
      "Bakery", "Bar & Pub", "Café", "Coffee Shop", "Deli", "Fast Food",
      "Food Producer", "Ice Cream", "Restaurant", "Takeaway"
    ],
    "Healthcare": [
      "Dentist", "GP & Medical Centre", "Optician", "Pharmacy",
      "Physiotherapy", "Veterinary"
    ],
    "Personal Services": [
      "Barber", "Childcare & Crèche", "Cleaning Services",
      "Dry Cleaning & Laundry", "Funeral Director", "Gym & Fitness",
      "Hair & Beauty", "Massage & Therapy", "Nail Salon", "Tattoo & Piercing"
    ],
    "Professional Services": [
      "Accountant", "Architect", "Auctioneer / Estate Agent",
      "Financial Advisor", "Insurance Broker", "Mortgage Broker", "Solicitor"
    ],
    "Retail": [
      "Bookshop", "Butcher", "Clothing & Fashion", "Craft & Hobby",
      "DIY & Garden Centre", "Electronics", "Fishmonger", "Florist",
      "Gift Shop", "Grocery", "Hardware", "Health Food & Organic",
      "Jewellery", "Newsagent", "Off Licence", "Pharmacy", "Pet Shop",
      "Second-hand & Vintage", "Supermarket", "Toy Shop"
    ],
    "Industry & Agriculture": [
      "Agriculture & Farming", "Distillery & Brewery", "Engineering",
      "Food Production & Processing", "Manufacturing", "Technology"
    ],
    "Tourism & Leisure": [
      "Activity & Adventure", "Attraction", "Caravan & Camping",
      "Heritage & Culture", "Tour Operator", "Tourist Information"
    ],
    "Trades & Construction": [
      "Builder", "Carpenter & Joiner", "Electrician",
      "Landscaping & Gardening", "Painter & Decorator", "Plumber",
      "Roofer", "Tiler"
    ],
    "Transport & Logistics": [
      "Bus & Coach", "Courier & Delivery", "Freight & Haulage",
      "Moving Services", "Taxi & Private Hire"
    ],
    "Media & Creative": [
      "Advertising", "Design & Creative", "Marketing & PR",
      "Photography & Video", "Print & Publishing", "Web & Digital"
    ],
    "Financial Services": [
      "Bank & Credit Union", "Bookkeeper", "Currency Exchange",
      "Financial Advisor", "Insurance Broker", "Mortgage Broker"
    ]
  },

  "Club & Group": {
    "Arts & Culture": [
      "Art & Craft", "Book Club", "Choir", "Creative Writing",
      "Dance", "Drama & Theatre", "Film Club", "Music", "Photography Club"
    ],
    "Charity & Welfare": [
      "Charity", "Food Bank", "Hospice Support",
      "Mental Health Support", "St Vincent de Paul", "Volunteer Group"
    ],
    "Faith & Religious": [
      "Baptist", "Buddhist", "Catholic", "Church of Ireland",
      "Evangelical", "Hindu", "Islamic / Mosque", "Jewish",
      "Methodist", "Orthodox", "Presbyterian", "Quaker"
    ],
    "Leisure & Social": [
      "Bridge Club", "Gardening Club", "ICA", "Men's Shed",
      "Pigeon Club", "Senior Citizens", "Toastmasters",
      "Walking Group", "Women's Group"
    ],
    "Sports & Recreation": [
      "American Football", "Athletics", "Badminton", "Basketball",
      "Boxing", "Camogie", "Cycling", "Equestrian", "GAA",
      "Golf", "Hockey", "Hurling", "Kayaking & Rowing",
      "Martial Arts", "Rugby", "Sailing", "Soccer / Football",
      "Swimming", "Table Tennis", "Tennis"
    ],
    "Youth & Community": [
      "Community Group", "Girl Guides", "Residents Association",
      "Scouts", "Tidy Towns", "Youth Club"
    ],
    "Health & Wellbeing": [
      "Mindfulness & Meditation", "Pilates", "Running Club",
      "Weight Management", "Yoga"
    ]
  },

  "Community Services": {
    "Care & Support": [
      "Childminder", "Citizens Information", "Crèche",
      "Day Care Centre", "Disability Services", "Home Help",
      "Nursing Home", "Respite Care"
    ],
    "Emergency & Public Safety": [
      "Civil Defence", "Coast Guard", "Fire Station",
      "Garda Station", "Mountain Rescue", "RNLI / Lifeboat"
    ],
    "Faith & Worship": [
      "Baptist", "Buddhist", "Catholic", "Church of Ireland",
      "Evangelical", "Hindu", "Islamic / Mosque", "Jewish",
      "Methodist", "Orthodox", "Presbyterian", "Quaker"
    ],
    "Government & Civic": [
      "Council Office", "Post Office", "Revenue / Tax Office",
      "Social Welfare Office"
    ],
    "Health Services": [
      "Dentist", "GP & Medical Centre", "Health Centre",
      "Hospital", "HSE Service", "Mental Health Service",
      "Pharmacy", "Physiotherapy"
    ],
    "Libraries & Information": [
      "Community Library", "County Library", "Mobile Library",
      "Public Library", "School Library"
    ],
    "Voluntary & Community": [
      "Community Council", "Community Development", "Meals on Wheels",
      "St Vincent de Paul", "Tidy Towns", "Volunteer Centre"
    ]
  },

  "Education": {
    "Early Years": [
      "Childcare", "Crèche", "Montessori",
      "Naíonra (Irish-medium playschool)", "Playschool / Preschool"
    ],
    "Primary": [
      "Gaelscoil", "National School", "Special School"
    ],
    "Secondary": [
      "Gaelcholáiste", "Secondary School", "Special Education",
      "Vocational / ETB School"
    ],
    "Further & Higher Education": [
      "Adult Education", "College of Further Education",
      "Community Training Centre", "Institute of Technology",
      "University", "Youthreach"
    ],
    "Training & Skills": [
      "Arts & Drama Classes", "Craft Classes", "Language School",
      "Music Lessons", "Sports Coaching", "Tutoring"
    ]
  },

  "What's On": {
    "Arts & Entertainment": [
      "Comedy Night", "Concert", "Exhibition",
      "Film Screening", "Open Mic", "Theatre"
    ],
    "Community": [
      "AGM / Meeting", "Fundraiser", "Information Evening",
      "Open Day", "Talk & Lecture", "Workshop"
    ],
    "Family & Kids": [
      "Craft Fair", "Family Fun Day", "Kids Event",
      "Pantomime", "Puppet Show"
    ],
    "Festivals & Markets": [
      "Christmas Market", "Craft Market", "Farmers Market",
      "Food Festival", "Music Festival", "Street Festival"
    ],
    "Sport & Recreation": [
      "Fun Run / Walk", "Match / Game", "Sports Day",
      "Tournament", "Triathlon"
    ],
    "Seasonal & Cultural": [
      "Christmas Event", "Cultural Event", "Halloween Event",
      "St Patrick's Day", "Summer Event"
    ]
  }
};

/**
 * Get all available groups for a given type.
 */
export function getGroups(type) {
  return Object.keys(TAXONOMY[type] || {});
}

/**
 * Get all categories for a given type (flattened, sorted, deduplicated).
 */
export function getAllCategories(type) {
  const groups = TAXONOMY[type] || {};
  const all = new Set();
  Object.values(groups).forEach((cats) => cats.forEach((c) => all.add(c)));
  return [...all].sort();
}

/**
 * Given a type and a list of selected categories,
 * return the full list of groups those categories belong to.
 * This is the cross-linking magic — Pharmacy auto-assigns to both Retail & Health Services.
 */
export function getGroupsForCategories(type, selectedCategories) {
  const groups = TAXONOMY[type] || {};
  const result = new Set();
  selectedCategories.forEach((cat) => {
    Object.entries(groups).forEach(([group, cats]) => {
      if (cats.includes(cat)) result.add(group);
    });
  });
  return [...result];
}

/**
 * Get categories for a specific set of groups (used for filtered display).
 */
export function getCategoriesForGroups(type, selectedGroups) {
  const groups = TAXONOMY[type] || {};
  const all = new Set();
  selectedGroups.forEach((g) => {
    (groups[g] || []).forEach((c) => all.add(c));
  });
  return [...all].sort();
}
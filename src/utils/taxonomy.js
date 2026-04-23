/**
 * Master taxonomy: Type → Group → SubGroup → Categories
 * Categories that appear in multiple places are cross-linked automatically.
 * When a user picks categories, groups are derived automatically.
 */

export const TAXONOMY = {
  "Business": {
    "Accommodation": {
      "All Types": [
        "Airbnb / Short-term Let", "B&B", "Guesthouse", "Hotel", "Room to Let",
        "Self-Catering", "Hostel", "Glamping & Camping"
      ]
    },
    "Food & Beverage": {
      "All Types": [
        "Bakery", "Bar & Pub", "Café", "Coffee Shop", "Deli", "Fast Food",
        "Food Producer", "Ice Cream", "Restaurant", "Takeaway"
      ]
    },
    "Healthcare": {
      "Medical & Wellness": [
        "Dentist", "GP & Medical Centre", "Optician", "Pharmacy",
        "Physiotherapy", "Veterinary"
      ]
    },
    "Personal Services": {
      "Beauty & Grooming": [
        "Barber", "Hair & Beauty", "Massage & Therapy", "Nail Salon", "Tattoo & Piercing"
      ],
      "Care & Wellbeing": [
        "Childcare & Crèche", "Cleaning Services", "Dry Cleaning & Laundry",
        "Funeral Director", "Gym & Fitness"
      ]
    },
    "Professional Services": {
      "All Types": [
        "Accountant", "Architect", "Auctioneer / Estate Agent",
        "Financial Advisor", "Insurance Broker", "Mortgage Broker", "Solicitor"
      ]
    },
    "Retail": {
      "Food & Drink": [
        "Butcher", "Fishmonger", "Grocery", "Health Food & Organic",
        "Newsagent", "Off Licence", "Supermarket"
      ],
      "Home & Garden": [
        "DIY & Garden Centre", "Florist", "Hardware", "Pet Shop"
      ],
      "Fashion & Accessories": [
        "Clothing & Fashion", "Jewellery"
      ],
      "Hobbies & Books": [
        "Bookshop", "Craft & Hobby", "Gift Shop", "Toy Shop"
      ],
      "Other": [
        "Electronics", "Pharmacy", "Second-hand & Vintage"
      ]
    },
    "Industry & Agriculture": {
      "All Types": [
        "Agriculture & Farming", "Distillery & Brewery", "Engineering",
        "Food Production & Processing", "Manufacturing", "Technology"
      ]
    },
    "Tourism & Leisure": {
      "All Types": [
        "Activity & Adventure", "Attraction", "Caravan & Camping",
        "Heritage & Culture", "Tour Operator", "Tourist Information"
      ]
    },
    "Trades & Construction": {
      "All Types": [
        "Builder", "Carpenter & Joiner", "Electrician",
        "Landscaping & Gardening", "Painter & Decorator", "Plumber",
        "Roofer", "Tiler"
      ]
    },
    "Transport & Logistics": {
      "All Types": [
        "Bus & Coach", "Courier & Delivery", "Freight & Haulage",
        "Moving Services", "Taxi & Private Hire"
      ]
    },
    "Media & Creative": {
      "All Types": [
        "Advertising", "Design & Creative", "Marketing & PR",
        "Photography & Video", "Print & Publishing", "Web & Digital"
      ]
    },
    "Financial Services": {
      "All Types": [
        "Bank & Credit Union", "Bookkeeper", "Currency Exchange",
        "Financial Advisor", "Insurance Broker", "Mortgage Broker"
      ]
    }
  },

  "Club & Group": {
    "Arts & Culture": {
      "All Types": [
        "Art & Craft", "Book Club", "Choir", "Creative Writing",
        "Dance", "Drama & Theatre", "Film Club", "Music", "Photography Club"
      ]
    },
    "Charity & Welfare": {
      "All Types": [
        "Charity", "Food Bank", "Hospice Support",
        "Mental Health Support", "St Vincent de Paul", "Volunteer Group"
      ]
    },
    "Faith & Religious": {
      "All Types": [
        "Baptist", "Buddhist", "Catholic", "Church of Ireland",
        "Evangelical", "Hindu", "Islamic / Mosque", "Jewish",
        "Methodist", "Orthodox", "Presbyterian", "Quaker"
      ]
    },
    "Leisure & Social": {
      "All Types": [
        "Bridge Club", "Gardening Club", "ICA", "Men's Shed",
        "Pigeon Club", "Senior Citizens", "Toastmasters",
        "Walking Group", "Women's Group"
      ]
    },
    "Sports & Recreation": {
      "Team Sports": [
        "American Football", "Camogie", "GAA", "Hockey", "Hurling",
        "Rugby", "Soccer / Football"
      ],
      "Individual Sports": [
        "Athletics", "Badminton", "Basketball", "Boxing", "Cycling",
        "Equestrian", "Golf", "Martial Arts", "Sailing", "Swimming",
        "Table Tennis", "Tennis"
      ],
      "Water Sports": [
        "Kayaking & Rowing"
      ]
    },
    "Youth & Community": {
      "Youth Organisations": [
        "Foróige", "Girl Guides", "Scouts", "Youth Club"
      ],
      "Youth Sports & Activities": [
        "Gymnastics", "Karate", "Martial Arts (Youth)", "Youth Football",
        "Youth Sports Coaching"
      ],
      "Community Groups": [
        "Community Group", "Residents Association", "Tidy Towns"
      ]
    },
    "Health & Wellbeing": {
      "Fitness & Movement": [
        "Gym & Fitness", "Pilates", "Running Club", "Yoga"
      ],
      "Wellbeing": [
        "Mindfulness & Meditation", "Weight Management"
      ]
    }
  },

  "Community Services": {
    "Care & Support": {
      "All Types": [
        "Childminder", "Citizens Information", "Crèche",
        "Day Care Centre", "Disability Services", "Home Help",
        "Nursing Home", "Respite Care"
      ]
    },
    "Emergency & Public Safety": {
      "All Types": [
        "Civil Defence", "Coast Guard", "Fire Station",
        "Garda Station", "Mountain Rescue", "RNLI / Lifeboat"
      ]
    },
    "Faith & Worship": {
      "All Types": [
        "Baptist", "Buddhist", "Catholic", "Church of Ireland",
        "Evangelical", "Hindu", "Islamic / Mosque", "Jewish",
        "Methodist", "Orthodox", "Presbyterian", "Quaker"
      ]
    },
    "Government & Civic": {
      "All Types": [
        "Council Office", "Post Office", "Revenue / Tax Office",
        "Social Welfare Office"
      ]
    },
    "Health Services": {
      "Medical": [
        "Dentist", "GP & Medical Centre", "Health Centre", "Hospital",
        "HSE Service", "Physiotherapy"
      ],
      "Mental Health & Pharmacy": [
        "Mental Health Service", "Pharmacy"
      ]
    },
    "Libraries & Information": {
      "All Types": [
        "Community Library", "County Library", "Mobile Library",
        "Public Library", "School Library"
      ]
    },
    "Voluntary & Community": {
      "All Types": [
        "Community Council", "Community Development", "Meals on Wheels",
        "St Vincent de Paul", "Tidy Towns", "Volunteer Centre"
      ]
    }
  },

  "Education": {
    "Early Years": {
      "All Types": [
        "Childcare", "Crèche", "Montessori",
        "Naíonra (Irish-medium playschool)", "Playschool / Preschool"
      ]
    },
    "Primary": {
      "All Types": [
        "Gaelscoil", "National School", "Special School"
      ]
    },
    "Secondary": {
      "All Types": [
        "Gaelcholáiste", "Secondary School", "Special Education",
        "Vocational / ETB School"
      ]
    },
    "Further & Higher Education": {
      "All Types": [
        "Adult Education", "College of Further Education",
        "Community Training Centre", "Institute of Technology",
        "University", "Youthreach"
      ]
    },
    "Training & Skills": {
      "Arts & Leisure": [
        "Arts & Drama Classes", "Craft Classes", "Music Lessons"
      ],
      "Academic & Professional": [
        "Language School", "Sports Coaching", "Tutoring"
      ]
    }
  },

  "What's On": {
    "Arts & Entertainment": {
      "All Types": [
        "Comedy Night", "Concert", "Exhibition",
        "Film Screening", "Open Mic", "Theatre"
      ]
    },
    "Community": {
      "All Types": [
        "AGM / Meeting", "Fundraiser", "Information Evening",
        "Open Day", "Talk & Lecture", "Workshop"
      ]
    },
    "Family & Kids": {
      "All Types": [
        "Craft Fair", "Family Fun Day", "Kids Event",
        "Pantomime", "Puppet Show"
      ]
    },
    "Festivals & Markets": {
      "All Types": [
        "Christmas Market", "Craft Market", "Farmers Market",
        "Food Festival", "Music Festival", "Street Festival"
      ]
    },
    "Sport & Recreation": {
      "All Types": [
        "Fun Run / Walk", "Match / Game", "Sports Day",
        "Tournament", "Triathlon"
      ]
    },
    "Seasonal & Cultural": {
      "All Types": [
        "Christmas Event", "Cultural Event", "Halloween Event",
        "St Patrick's Day", "Summer Event"
      ]
    }
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
  Object.values(groups).forEach((subGroups) => {
    Object.values(subGroups).forEach((cats) => cats.forEach((c) => all.add(c)));
  });
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
    Object.entries(groups).forEach(([group, subGroups]) => {
      Object.values(subGroups).forEach((cats) => {
        if (cats.includes(cat)) result.add(group);
      });
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
    const subGroups = groups[g] || {};
    Object.values(subGroups).forEach((cats) => cats.forEach((c) => all.add(c)));
  });
  return [...all].sort();
}

/**
 * Get all subgroups for a given group and type.
 */
export function getSubGroupsForGroup(type, group) {
  const groups = TAXONOMY[type] || {};
  return Object.keys(groups[group] || {});
}

/**
 * Get categories for a specific subgroup.
 */
export function getCategoriesForSubGroup(type, group, subGroup) {
  const groups = TAXONOMY[type] || {};
  return groups[group]?.[subGroup] || [];
}
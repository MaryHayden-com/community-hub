/**
 * Master taxonomy: Type → Group → SubGroup → Categories
 * Categories that appear in multiple places are cross-linked automatically.
 * When a user picks categories, groups are derived automatically.
 */

export const TAXONOMY = {
  "Business": {
    "Accommodation": {
      "Hotels & Guesthouses": [
        "Hotel", "Boutique Hotel", "Guesthouse", "B&B", "Inn"
      ],
      "Self-Catering & Short Stays": [
        "Self-Catering Cottage", "Self-Catering Apartment", "Airbnb / Short-term Let", "Holiday Home", "Room to Let"
      ],
      "Camping & Outdoor Stays": [
        "Glamping", "Camping & Caravan Park", "Eco Retreat", "Hostel", "Bunkhouse"
      ]
    },
    "Food & Beverage": {
      "Eat In": [
        "Restaurant", "Bistro", "Gastropub", "Café", "Coffee Shop", "Deli", "Bar & Pub", "Hotel Restaurant"
      ],
      "Takeaway & Fast Food": [
        "Chipper / Fish & Chips", "Chinese Takeaway", "Indian Takeaway", "Pizza", "Burger & Fast Food", "Sandwich Bar"
      ],
      "Producers & Suppliers": [
        "Artisan Food Producer", "Bakery", "Ice Cream", "Chocolatier", "Catering Company", "Food Truck / Mobile Catering"
      ]
    },
    "Healthcare": {
      "Medical": [
        "GP & Medical Centre", "Hospital", "HSE Service", "Health Centre", "Specialist Clinic", "Optician", "Dentist"
      ],
      "Therapy & Allied Health": [
        "Physiotherapy", "Occupational Therapy", "Speech & Language Therapy", "Podiatry & Chiropody", "Osteopathy", "Chiropractic"
      ],
      "Mental Health & Wellbeing": [
        "Counselling & Psychotherapy", "Psychology", "Mental Health Service", "Addiction Services"
      ],
      "Pharmacy & Other": [
        "Pharmacy", "Veterinary", "Alternative / Complementary Medicine"
      ]
    },
    "Personal Services": {
      "Hair & Beauty": [
        "Hair Salon", "Barber", "Nail Salon", "Beauty Salon", "Spray Tan", "Eyebrow & Lash Specialist", "Makeup Artist"
      ],
      "Therapies & Wellness": [
        "Massage Therapist", "Reflexology", "Reiki", "Acupuncture", "Holistic Therapy", "Personal Trainer"
      ],
      "Domestic & Care": [
        "Childcare & Crèche", "Childminder", "Cleaning Services", "Ironing & Laundry", "Dry Cleaning", "Home Help", "Pet Grooming", "Dog Walker"
      ],
      "Life Events": [
        "Funeral Director", "Wedding Planner", "Celebrant", "Photographer (Personal)", "Florist (Personal)"
      ]
    },
    "Professional Services": {
      "Legal & Financial": [
        "Solicitor", "Barrister", "Notary", "Accountant", "Bookkeeper", "Tax Advisor", "Financial Advisor", "Mortgage Broker", "Insurance Broker"
      ],
      "Property & Construction": [
        "Auctioneer / Estate Agent", "Architect", "Quantity Surveyor", "Structural Engineer", "Property Management", "Valuer / Surveyor"
      ],
      "Business & Management": [
        "Business Consultant", "HR & Recruitment", "Management Consultant", "Project Manager", "Coaching & Mentoring"
      ],
      "Technology & IT": [
        "IT Support", "Software Development", "Cybersecurity", "Cloud Services", "Web Design", "App Development", "Data Analytics"
      ],
      "Marketing & Communications": [
        "Marketing Agency", "PR & Communications", "Social Media Management", "SEO & Digital Marketing", "Copywriting", "Content Creation", "Brand Strategy"
      ],
      "Creative & Design": [
        "Graphic Design", "Interior Design", "Product Design", "Animation & Motion Graphics", "Illustration"
      ],
      "Media & Production": [
        "Photography Studio", "Video Production", "Podcast Production", "Print & Publishing", "Advertising Agency"
      ],
      "Administrative & Office": [
        "Virtual Assistant", "Translation & Interpretation", "Secretarial Services", "Document Management", "Payroll Services"
      ],
      "Education & Training (Professional)": [
        "Corporate Training", "Executive Education", "Health & Safety Training", "First Aid Training", "Language Training"
      ]
    },
    "Retail": {
      "Food & Drink": [
        "Butcher", "Fishmonger", "Grocery", "Supermarket", "Health Food & Organic", "Off Licence", "Newsagent", "Deli Counter", "Farm Shop", "Farmers Market Stall"
      ],
      "Fashion & Clothing": [
        "Clothing & Fashion", "Menswear", "Womenswear", "Childrenswear", "Sportswear", "Footwear", "Accessories & Bags", "Jewellery", "Watches", "Second-hand & Vintage Clothing"
      ],
      "Home & Living": [
        "Furniture & Interiors", "Home Décor", "Kitchenware", "Bedding & Linen", "Lighting", "Antiques & Collectibles", "Second-hand Furniture"
      ],
      "Garden & Outdoors": [
        "Garden Centre", "Plants & Flowers", "Florist", "Outdoor Furniture", "Gardening Supplies", "Pet Shop"
      ],
      "Hardware & DIY": [
        "Hardware Store", "DIY & Home Improvement", "Paint & Decorating", "Building Materials", "Tools & Equipment"
      ],
      "Hobbies, Books & Gifts": [
        "Bookshop", "Gift Shop", "Craft & Hobby", "Toy Shop", "Arts & Crafts Supplies", "Games & Puzzles", "Music & Records"
      ],
      "Electronics & Technology": [
        "Electronics", "Mobile Phones", "Computer & IT Retail", "Photography Equipment", "Appliances"
      ],
      "Pharmacy & Health Retail": [
        "Pharmacy", "Health & Wellbeing Shop", "Optical Retail"
      ],
      "Speciality Retail": [
        "Charity Shop", "Second-hand & Vintage", "Pawn Shop", "Auction House", "Market Stall", "Online-only Retail"
      ]
    },
    "Trades & Construction": {
      "Groundworks & Structure": [
        "Builder / General Contractor", "Groundworks & Excavation", "Stone & Brickwork", "Concrete & Foundations", "Demolition"
      ],
      "Interior Trades": [
        "Carpenter & Joiner", "Kitchen Fitter", "Plasterer", "Tiler", "Floor Layer", "Painter & Decorator", "Glazier"
      ],
      "Mechanical & Electrical": [
        "Electrician", "Plumber", "Gas & Heating Engineer", "Boiler Installation", "Renewable Energy Installer", "Solar PV", "Heat Pump Installer"
      ],
      "Roofing & Exteriors": [
        "Roofer", "Guttering & Fascia", "Cladding & Insulation", "Window & Door Installer", "Conservatory Builder"
      ],
      "Landscaping & Outdoor": [
        "Landscaper", "Garden Design", "Driveway & Paving", "Fencing & Gates", "Tree Surgery & Arborist"
      ],
      "Specialist Services": [
        "Alarm & Security Installer", "CCTV Installer", "Lift & Elevator", "Scaffolding", "Surveying & Inspection", "BER Assessor"
      ]
    },
    "Transport & Logistics": {
      "Passenger Transport": [
        "Taxi & Private Hire", "Bus & Coach Hire", "Chauffeur Service", "Airport Transfer"
      ],
      "Freight & Delivery": [
        "Courier & Delivery", "Freight & Haulage", "Van Hire", "Moving & Removals", "Storage & Warehousing"
      ],
      "Vehicle Services": [
        "Car Dealer (New)", "Car Dealer (Used)", "Car Hire / Rental", "Garage & Mechanic", "Tyre & Exhaust Centre", "MOT & NCT Centre", "Bodywork & Valeting", "Motorcycle Dealer"
      ],
      "Marine & Aviation": [
        "Boat Sales & Hire", "Marine Services", "Pilot & Aviation Services"
      ]
    },
    "Industry & Agriculture": {
      "Agriculture": [
        "Arable Farming", "Dairy Farming", "Livestock Farming", "Horticulture & Market Gardening", "Organic Farming", "Poultry", "Equestrian & Horse"
      ],
      "Food & Drink Production": [
        "Artisan Food Production", "Distillery & Brewery", "Bakery Production", "Dairy Processing", "Meat Processing", "Seafood Processing"
      ],
      "Manufacturing & Industry": [
        "Engineering & Manufacturing", "Timber & Woodworking", "Plastics & Composites", "Pharmaceuticals", "Technology Manufacturing"
      ],
      "Agricultural Supplies": [
        "Agricultural Machinery", "Feed & Supplies", "Agri Chemicals", "Veterinary Supplies", "Seed & Fertiliser"
      ]
    },
    "Tourism & Leisure": {
      "Activities & Adventure": [
        "Activity Centre", "Cycling & Bike Hire", "Horse Riding", "Kayaking & Water Sports", "Walking & Hiking Tours", "Surfing & Water Sports", "Golf Course"
      ],
      "Attractions & Culture": [
        "Museum & Heritage", "Art Gallery", "Historic House & Gardens", "Zoo & Wildlife Park", "Aquarium", "Theme Park", "Visitor Centre"
      ],
      "Tours & Experiences": [
        "Tour Operator", "Guided Tours", "Food & Drink Tours", "Bus Tours", "Boat Tours", "Ghost & History Tours"
      ],
      "Events & Entertainment": [
        "Entertainment Venue", "Live Music Venue", "Theatre", "Cinema", "Comedy Club", "Escape Room", "Go-Kart / Motorsport"
      ]
    },
    "Financial Services": {
      "Banking & Credit": [
        "Bank", "Credit Union", "Building Society", "Moneylender"
      ],
      "Investment & Planning": [
        "Financial Planner", "Investment Advisor", "Pension Advisor", "Stockbroker"
      ],
      "Insurance": [
        "Life Insurance", "Home & Property Insurance", "Car Insurance", "Business Insurance", "Health Insurance"
      ],
      "Other Financial": [
        "Currency Exchange", "Payroll Services", "Debt Management", "Leasing & Finance"
      ]
    }
  },

  "Club & Group": {
    "Arts & Culture": {
      "Visual Arts": [
        "Art Club", "Drawing & Painting", "Pottery & Ceramics", "Photography Club", "Sculpture"
      ],
      "Performing Arts": [
        "Drama & Theatre", "Choir", "Dance", "Music Group", "Open Mic", "Improv Group"
      ],
      "Literary & Creative": [
        "Book Club", "Creative Writing", "Poetry Group", "Film Club", "Storytelling"
      ],
      "Crafts & Making": [
        "Craft & Hobby", "Knitting & Crochet", "Quilting", "Woodworking Club", "Sewing & Embroidery"
      ]
    },
    "Charity & Welfare": {
      "Fundraising & Aid": [
        "Charity", "Fundraising Group", "Food Bank", "Homeless Support", "Refugee & Asylum Support"
      ],
      "Support Groups": [
        "Mental Health Support", "Bereavement Support", "Addiction Recovery", "Carer Support", "Disability Support"
      ],
      "Service Organisations": [
        "St Vincent de Paul", "Lions Club", "Rotary Club", "Soroptimists", "Hospice Support", "Volunteer Group"
      ]
    },
    "Faith & Religious": {
      "Christian": [
        "Catholic", "Church of Ireland", "Presbyterian", "Methodist", "Baptist", "Evangelical", "Orthodox", "Quaker"
      ],
      "Other Faiths": [
        "Islamic / Mosque", "Jewish", "Hindu", "Buddhist", "Multi-faith"
      ]
    },
    "Leisure & Social": {
      "Social Clubs": [
        "Men's Shed", "Women's Group", "ICA", "Senior Citizens Club", "Bridge Club", "Chess Club", "Toastmasters", "Debating Club"
      ],
      "Outdoors & Nature": [
        "Walking Group", "Rambling Club", "Birdwatching", "Gardening Club", "Beekeeping", "Fishing Club"
      ],
      "Hobbies & Interests": [
        "Car & Motorbike Club", "Model Railway", "Pigeon Club", "Amateur Radio", "Astronomy Club", "History Society"
      ]
    },
    "Sports & Recreation": {
      "Gaelic Games": [
        "GAA", "Hurling", "Camogie", "Ladies Football", "Handball"
      ],
      "Team Sports": [
        "Soccer / Football", "Rugby", "Hockey", "Basketball", "Volleyball", "American Football", "Cricket"
      ],
      "Individual Sports": [
        "Athletics", "Badminton", "Boxing", "Cycling", "Equestrian", "Golf", "Gymnastics", "Martial Arts", "Sailing", "Swimming", "Table Tennis", "Tennis", "Squash"
      ],
      "Water & Outdoor Sports": [
        "Kayaking & Rowing", "Surfing", "Triathlon", "Orienteering", "Mountain Biking", "Hill Walking"
      ],
      "Racket & Target Sports": [
        "Archery", "Clay Pigeon Shooting", "Darts", "Snooker & Billiards", "Bowls"
      ]
    },
    "Youth & Community": {
      "Youth Organisations": [
        "Foróige", "Scouts", "Girl Guides", "Youth Club", "Macra na Feirme", "4-H Club"
      ],
      "Youth Sports & Activities": [
        "Youth Football", "Youth GAA", "Youth Rugby", "Gymnastics (Youth)", "Karate & Martial Arts (Youth)", "Youth Sports Coaching"
      ],
      "Community Groups": [
        "Community Council", "Community Group", "Residents Association", "Tidy Towns", "Heritage Society", "Development Association"
      ]
    },
    "Health & Wellness": {
      "Fitness & Movement": [
        "Running Club", "Yoga", "Pilates", "Gym & Fitness", "Crossfit", "Zumba & Dance Fitness", "Tai Chi", "Nordic Walking"
      ],
      "Therapies & Wellbeing": [
        "Mindfulness & Meditation", "Counselling Support Group", "Weight Management", "Physiotherapy Group", "Breathwork"
      ]
    }
  },

  "Community Services": {
    "Care & Support": {
      "Children & Families": [
        "Crèche", "Childminder", "Family Support", "Tusla / Child & Family Agency", "Parenting Support"
      ],
      "Older People": [
        "Day Care Centre", "Home Help", "Meals on Wheels", "Nursing Home", "Respite Care", "Active Retirement"
      ],
      "Disability & Special Needs": [
        "Disability Services", "Intellectual Disability Support", "Physical Disability Support", "Autism Services", "Sensory Support"
      ],
      "General Support": [
        "Citizens Information", "MABS (Money Advice)", "Social Work", "Housing Support", "Community Welfare"
      ]
    },
    "Emergency & Public Safety": {
      "Emergency Services": [
        "Fire Station", "Garda Station", "Coast Guard", "RNLI / Lifeboat", "Mountain Rescue", "Civil Defence"
      ],
      "First Aid & Safety": [
        "Defibrillator Location", "First Responders", "Red Cross", "St John Ambulance", "Order of Malta"
      ]
    },
    "Faith & Worship": {
      "Christian": [
        "Catholic", "Church of Ireland", "Presbyterian", "Methodist", "Baptist", "Evangelical", "Orthodox", "Quaker"
      ],
      "Other Faiths": [
        "Islamic / Mosque", "Jewish", "Hindu", "Buddhist", "Multi-faith"
      ]
    },
    "Government & Civic": {
      "Local Government": [
        "Council Office", "County Council", "Town Council", "Local Area Office"
      ],
      "State Services": [
        "Post Office", "Revenue / Tax Office", "Social Welfare Office", "Department of Agriculture", "HSE Office"
      ],
      "Civic & Legal": [
        "Courthouse", "Legal Aid Board", "Ombudsman Office"
      ]
    },
    "Health Services": {
      "Medical": [
        "GP & Medical Centre", "Health Centre", "Hospital", "HSE Service", "Specialist Clinic", "Dentist", "Physiotherapy"
      ],
      "Mental Health": [
        "Mental Health Service", "CAMHS", "Counselling Service", "Crisis Support"
      ],
      "Pharmacy & Allied": [
        "Pharmacy", "Optician", "Podiatry", "Occupational Therapy"
      ]
    },
    "Libraries & Information": {
      "Libraries": [
        "Public Library", "County Library", "Mobile Library", "School Library", "Community Library"
      ],
      "Information Services": [
        "Tourist Information", "Community Information Point", "Online Resources"
      ]
    },
    "Voluntary & Community": {
      "Community Development": [
        "Community Council", "Community Development Organisation", "Development Association", "LEADER Programme"
      ],
      "Volunteering": [
        "Volunteer Centre", "Tidy Towns", "Community Group", "Befriending Service"
      ],
      "Food & Welfare": [
        "Food Bank", "St Vincent de Paul", "Community Fridge", "Meals on Wheels"
      ]
    }
  },

  "Education": {
    "Early Years": {
      "Preschool & Playschool": [
        "Playschool / Preschool", "Montessori", "Naíonra (Irish-medium playschool)", "Waldorf / Steiner"
      ],
      "Childcare": [
        "Crèche", "Full-day Childcare", "After-school Care", "Childminder"
      ]
    },
    "Primary": {
      "Primary Schools": [
        "National School", "Gaelscoil", "Special School", "Educate Together", "Multi-denominational School"
      ]
    },
    "Secondary": {
      "Secondary Schools": [
        "Secondary School", "Gaelcholáiste", "Community School", "Vocational / ETB School", "Special Education"
      ]
    },
    "Further & Higher Education": {
      "Colleges & Universities": [
        "University", "Institute of Technology / TU", "College of Further Education", "Private College"
      ],
      "Community Education": [
        "Adult Education", "Community Training Centre", "Youthreach", "VTOS", "BTEI"
      ]
    },
    "Training & Skills": {
      "Arts & Leisure": [
        "Arts & Drama Classes", "Music Lessons", "Craft Classes", "Dance Classes", "Language Classes"
      ],
      "Academic & Professional": [
        "Tutoring", "Grinds", "Sports Coaching", "TEFL / English Language", "IT & Computer Training"
      ],
      "Trades & Vocational": [
        "Apprenticeship", "Trades Training", "Health & Safety Training", "First Aid Training", "Driver Training"
      ]
    }
  },

  "What's On": {
    "Arts & Entertainment": {
      "Music": [
        "Concert", "Live Music Night", "Trad Session", "Open Mic", "Choir Performance", "Classical Music", "Music Festival"
      ],
      "Stage & Screen": [
        "Theatre", "Comedy Night", "Stand-up", "Film Screening", "Pantomime", "Dance Performance", "Circus & Cabaret"
      ],
      "Visual Arts": [
        "Art Exhibition", "Photography Exhibition", "Craft Exhibition", "Gallery Opening", "Art Fair"
      ]
    },
    "Community": {
      "Meetings & Information": [
        "AGM / Meeting", "Information Evening", "Talk & Lecture", "Public Consultation", "Town Hall Meeting"
      ],
      "Fundraisers & Charity": [
        "Fundraiser", "Charity Auction", "Coffee Morning", "Quiz Night", "Gala Dinner"
      ],
      "Open Days & Tours": [
        "Open Day", "Heritage Tour", "School Open Night", "Business Open Day"
      ],
      "Workshops & Classes": [
        "Workshop", "Class", "Demonstration", "Course", "Seminar & Conference"
      ]
    },
    "Family & Kids": {
      "Kids Activities": [
        "Kids Event", "Storytelling", "Puppet Show", "Kids Workshop", "Summer Camp"
      ],
      "Family Fun": [
        "Family Fun Day", "Craft Fair", "Treasure Hunt", "Circus Skills", "Pantomime"
      ]
    },
    "Festivals & Markets": {
      "Festivals": [
        "Music Festival", "Food Festival", "Street Festival", "Arts Festival", "Cultural Festival", "Film Festival"
      ],
      "Markets": [
        "Farmers Market", "Craft Market", "Christmas Market", "Car Boot Sale", "Flea Market"
      ]
    },
    "Sport & Recreation": {
      "Running & Walking": [
        "Fun Run", "5K / 10K Race", "Half Marathon", "Marathon", "Charity Walk", "Sponsored Walk"
      ],
      "Sport Events": [
        "Match / Game", "Tournament", "Sports Day", "Triathlon", "Swimming Gala", "Cycling Sportive"
      ],
      "Outdoor & Adventure": [
        "Hiking Event", "Orienteering", "Sailing Regatta", "Surf Competition", "Equestrian Event"
      ]
    },
    "Seasonal & Cultural": {
      "Seasonal": [
        "Christmas Event", "Halloween Event", "St Patrick's Day", "Easter Event", "Summer Event", "Spring Festival"
      ],
      "Cultural & Heritage": [
        "Cultural Event", "Heritage Event", "Irish Language Event", "Religious Ceremony", "Commemoration"
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
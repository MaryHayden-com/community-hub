import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_BY_GROUP = {
  "Business": {
    "Accommodation": ["Accommodation", "Hotel & Accommodation", "Hotel", "B&B", "Bed & Breakfast", "Airbnb", "Room to Let", "Guesthouses", "Guest House", "Hostel", "Holiday Home"],
    "Food & Beverage": ["Café & Restaurant", "Restaurant", "Café", "Coffee", "Bar & Pub", "Pub", "Bar", "Takeaway", "Take Away", "Bakery", "Deli & Fine Foods", "Deli", "Food & Drink", "Food Producer", "Farmers Market", "Food Market", "Fish & Chips"],
    "Retail": ["Supermarket", "Grocery", "Newsagent", "Bookshop", "Book Shop", "Hardware", "DIY", "Clothing & Fashion", "Clothes", "Fashion", "Gift Shop", "Gifts", "Craft & Retail", "Craft & Hobby", "Craft", "Hobby", "Florist", "Butcher", "Fishmonger", "Off Licence", "Off License", "Wine", "Shoe", "Shoes", "Sport", "Sports"],
    "Professional Services": ["Solicitor", "Solicitors", "Accountant", "Accountants", "Financial Services", "Financial", "Finance", "Estate Agent & Valuer", "Estate Agent", "Estate Agents", "Professional Services", "Lawyer", "Law", "Services"],
    "Personal Services": ["Beauty & Wellness", "Hair & Beauty", "Hair", "Beauty", "Salon", "Barber", "Gym & Fitness", "Gym", "Fitness", "Personal Trainer", "Cleaning Services", "Cleaning", "Childcare & Crèche", "Childcare", "Crèche"],
    "Healthcare": ["Dentist", "Dentistry", "Dental", "GP & Medical", "Health & Medical", "GP", "Doctor", "Medical", "Health Centre", "Health Center", "Veterinary", "Vet", "Pharmacy", "Chemist"],
    "Trades & Construction": ["Plumber", "Plumbing", "Electrician", "Electrical", "Builder", "Building", "Carpenter", "Carpentry", "Painter & Decorator", "Painter", "Decorator", "Roofer", "Roofing", "Joinery", "Joiner"],
    "Arts & Culture": ["Arts & Culture", "Photography & Arts"]
  },
  "Club & Group": {
    "Sports & Recreation": ["Sports", "Fitness; Sports", "GAA", "GAA / Sport", "Soccer", "Soccer / Football", "Football", "Rugby", "Tennis", "Golf & Pitch & Putt", "Golf", "Athletics", "Swimming", "Swim", "Cycling", "Cycle", "Boxing", "Martial Arts", "Martial Art", "Karate", "Judo", "Equestrian", "Horse", "Horses", "Rowing", "Rowing & Water Sports", "Sailing & Water Sports", "Sailing", "Badminton", "Squash", "Table Tennis", "Volleyball", "Basketball", "Sport & Outdoor"],
    "Youth & Community": ["Scouts", "Girl Guides", "Guides", "Youth Club", "Youth", "Youth Community", "Tidy Towns", "Community Group", "Community", "Community & Volunteering", "Community Organisation", "Residents Association", "Residents", "Social"],
    "Arts & Culture": ["Arts & Culture", "Arts & Drama", "Arts Centre", "Drama & Theatre", "Drama", "Theatre", "Theater", "Music", "Band", "Orchestra", "Dance", "Art & Craft", "Art", "Craft", "Gallery", "Book Club", "Writing", "Photography & Arts"],
    "Faith & Religious": ["Faith Community", "Catholic Church", "Roman Catholic Church", "Church of Ireland", "Methodist Church", "Methodist", "Presbyterian Church", "Presbyterian", "Baptist Church", "Baptist", "Evangelical Church", "Evangelical", "Orthodox Church", "Orthodox", "Islamic Centre / Mosque", "Islamic", "Mosque", "Jewish Synagogue", "Synagogue", "Hindu Temple", "Hindu", "Temple", "Buddhist Centre", "Buddhist", "Quaker Meeting House", "Quaker"],
    "Libraries": ["Public Library", "Library", "County Library", "Mobile Library", "Community Library", "University Library", "School Library"],
    "Leisure & Community": ["Walking Group", "Walking", "Gardening Club", "Gardening", "Toastmasters", "ICA", "Men's Shed", "Mens Shed", "Women's Group", "Womens Group", "Senior Citizens", "Seniors", "Over 55s", "Hobby & Nature"],
    "Charity & Welfare": ["Charity", "Charities", "Charity/Community", "Welfare", "Non-Profit", "Non Profit", "NGO"],
    "Education": ["Education"]
  },
  "Education": {
    "Schools": ["Primary School", "Primary", "Secondary School", "Secondary", "Gaelscoil", "Gaelchóláiste", "Special Education", "Special School"],
    "Higher Education": ["Third Level", "University", "College", "Further Education", "FE College"],
    "Childcare": ["Montessori", "Childcare", "Child Care", "Crèche", "Creche", "Pre-School", "Preschool", "Nursery"],
    "Training & Skills": ["Language School", "Language", "Music Lessons", "Music", "Arts & Drama", "Arts", "Sports Coaching", "Coaching", "Adult Education", "Adult", "Tutoring", "Tuition", "Community Training", "Training", "Youthreach"]
  },
  "What's On": {
    "Festivals & Markets": ["Festival", "Festivals", "Market", "Markets", "Fair", "Fairs", "Arts Festival", "Community Festival", "Food Festival", "Music Festival"],
    "Entertainment": ["Concert", "Concerts", "Theatre", "Theater", "Exhibition", "Exhibitions", "Show", "Shows", "Comedy", "Comedy Club", "Concert/Music", "Theatre & Performance"],
    "Community Activities": ["Community Event", "Community Gathering", "Community Activities", "Event", "Workshop", "Workshops", "Talk & Lecture", "Talk", "Lecture", "Talks", "Fundraiser", "Fundraising", "Family Event", "Family", "Arts & Literature"],
    "Seasonal & Themed": ["Christmas Event", "Christmas", "Summer Event", "Summer", "Food Event", "Food", "Sports Event", "Sports", "Cultural Event", "Cultural", "Halloween", "Easter", "New Year", "Garden & Outdoor Event", "Outdoor & Walking", "Sport & Outdoor", "Horse Racing", "Tour & Experience"],
    "Community/Sports": ["Community/Sports", "Sports/Outdoors", "Sports", "Sport & Outdoor"],
    "Community/Gathering": ["Community/Gathering", "Community/Business", "Community/Educational"],
    "Sports/Youth": ["Sports/Youth", "Sports/Concert"]
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all listings
    const listings = await base44.entities.CommunityListing.list('-created_date', 10000);

    let updated = 0;
    let skipped = 0;

    // Build reverse lookup: category → group
    const categoryToGroup = {};
    for (const [type, groups] of Object.entries(CATEGORY_BY_GROUP)) {
      for (const [group, categories] of Object.entries(groups)) {
        categories.forEach(cat => {
          categoryToGroup[`${type}|${cat}`] = group;
        });
      }
    }

    // Collect updates sequentially with small delays
    for (const listing of listings) {
      if (!listing.type || !listing.category) {
        skipped++;
        continue;
      }

      const key = `${listing.type}|${listing.category}`;
      const group = categoryToGroup[key];

      if (group && !listing.subcategory_group) {
        await base44.entities.CommunityListing.update(listing.id, { subcategory_group: group });
        updated++;
        // Small delay between updates
        await new Promise(r => setTimeout(r, 50));
      } else if (!group) {
        skipped++;
      }
    }

    return Response.json({ 
      success: true, 
      updated, 
      skipped, 
      message: `Backfilled ${updated} listings with subcategory groups (${skipped} skipped due to missing category mapping)` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
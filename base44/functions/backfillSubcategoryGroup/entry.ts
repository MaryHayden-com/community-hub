import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_BY_GROUP = {
  "Business": {
    "Accommodation": ["Hotels", "Hotel", "B&B", "Bed & Breakfast", "Airbnb", "Room to Let", "Guesthouses", "Guest House", "Hostel", "Holiday Home"],
    "Food & Beverage": ["Restaurant", "Café", "Coffee", "Bar & Pub", "Pub", "Bar", "Takeaway", "Take Away", "Bakery", "Deli", "Fish & Chips"],
    "Retail": ["Supermarket", "Grocery", "Newsagent", "Bookshop", "Book Shop", "Hardware", "DIY", "Clothing & Fashion", "Clothes", "Fashion", "Gift Shop", "Gifts", "Craft & Hobby", "Craft", "Hobby", "Florist", "Butcher", "Fishmonger", "Off Licence", "Off License", "Wine", "Shoe", "Shoes", "Sport", "Sports"],
    "Professional Services": ["Solicitor", "Solicitors", "Accountant", "Accountants", "Financial Services", "Finance", "Estate Agent", "Estate Agents", "Lawyer", "Law"],
    "Personal Services": ["Hair & Beauty", "Hair", "Beauty", "Salon", "Barber", "Gym & Fitness", "Gym", "Fitness", "Personal Trainer", "Cleaning Services", "Cleaning", "Childcare & Crèche", "Childcare", "Crèche"],
    "Healthcare": ["Dentist", "Dentistry", "Dental", "GP & Medical", "GP", "Doctor", "Medical", "Health Centre", "Health Center", "Veterinary", "Vet", "Pharmacy", "Chemist"],
    "Trades & Construction": ["Plumber", "Plumbing", "Electrician", "Electrical", "Builder", "Building", "Carpenter", "Carpentry", "Painter & Decorator", "Painter", "Decorator", "Roofer", "Roofing", "Joinery", "Joiner"]
  },
  "Club & Group": {
    "Sports & Recreation": ["GAA", "Soccer", "Soccer / Football", "Football", "Rugby", "Tennis", "Golf", "Athletics", "Swimming", "Swim", "Cycling", "Cycle", "Boxing", "Martial Arts", "Martial Art", "Karate", "Judo", "Equestrian", "Horse", "Horses", "Rowing", "Sailing", "Badminton", "Squash", "Table Tennis", "Volleyball", "Basketball"],
    "Youth & Community": ["Scouts", "Girl Guides", "Guides", "Youth Club", "Youth", "Tidy Towns", "Community Group", "Community", "Community Organisation", "Residents Association", "Residents"],
    "Arts & Culture": ["Drama & Theatre", "Drama", "Theatre", "Theater", "Music", "Band", "Orchestra", "Dance", "Art & Craft", "Art", "Craft", "Gallery", "Book Club", "Writing"],
    "Faith & Religious": ["Catholic Church", "Catholic", "Church of Ireland", "Methodist Church", "Methodist", "Presbyterian Church", "Presbyterian", "Baptist Church", "Baptist", "Evangelical Church", "Evangelical", "Orthodox Church", "Orthodox", "Islamic Centre / Mosque", "Islamic", "Mosque", "Jewish Synagogue", "Synagogue", "Hindu Temple", "Hindu", "Temple", "Buddhist Centre", "Buddhist", "Quaker Meeting House", "Quaker", "Faith Community", "Church"],
    "Libraries": ["Public Library", "Library", "County Library", "Mobile Library", "Community Library", "University Library", "School Library"],
    "Leisure & Community": ["Walking Group", "Walking", "Gardening Club", "Gardening", "Toastmasters", "ICA", "Men's Shed", "Mens Shed", "Women's Group", "Womens Group", "Senior Citizens", "Seniors", "Over 55s"],
    "Charity & Welfare": ["Charity", "Charities", "Welfare", "Non-Profit", "Non Profit", "NGO"]
  },
  "Education": {
    "Schools": ["Primary School", "Primary", "Secondary School", "Secondary", "Gaelscoil", "Gaelchóláiste", "Special Education", "Special School"],
    "Higher Education": ["Third Level", "University", "College", "Further Education", "FE College"],
    "Childcare": ["Montessori", "Childcare", "Child Care", "Crèche", "Creche", "Pre-School", "Preschool", "Nursery"],
    "Training & Skills": ["Language School", "Language", "Music Lessons", "Music", "Arts & Drama", "Arts", "Sports Coaching", "Coaching", "Adult Education", "Adult", "Tutoring", "Tuition", "Community Training", "Training", "Youthreach"]
  },
  "What's On": {
    "Festivals & Markets": ["Festival", "Festivals", "Market", "Markets", "Fair", "Fairs"],
    "Entertainment": ["Concert", "Concerts", "Theatre", "Theater", "Exhibition", "Exhibitions", "Show", "Shows", "Comedy", "Comedy Club"],
    "Community Activities": ["Community Event", "Community Activities", "Event", "Workshop", "Workshops", "Talk & Lecture", "Talk", "Lecture", "Talks", "Fundraiser", "Fundraising", "Family Event", "Family"],
    "Seasonal & Themed": ["Christmas Event", "Christmas", "Summer Event", "Summer", "Food Event", "Food", "Sports Event", "Sports", "Cultural Event", "Cultural", "Halloween", "Easter", "New Year"]
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

    // Update listings with matching categories
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
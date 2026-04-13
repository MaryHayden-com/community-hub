import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_BY_GROUP = {
  "Business": {
    "Accommodation": ["Hotels", "B&B", "Airbnb", "Room to Let", "Guesthouses"],
    "Food & Beverage": ["Restaurant", "Café", "Bar & Pub", "Takeaway", "Bakery"],
    "Retail": ["Supermarket", "Grocery", "Newsagent", "Bookshop", "Hardware", "Clothing & Fashion", "Gift Shop", "Craft & Hobby", "Florist", "Butcher", "Fishmonger", "Off Licence"],
    "Professional Services": ["Solicitor", "Accountant", "Financial Services", "Estate Agent"],
    "Personal Services": ["Hair & Beauty", "Barber", "Gym & Fitness", "Cleaning Services", "Childcare & Crèche"],
    "Healthcare": ["Dentist", "GP & Medical", "Veterinary", "Pharmacy"],
    "Trades & Construction": ["Plumber", "Electrician", "Builder", "Carpenter", "Painter & Decorator"]
  },
  "Club & Group": {
    "Sports & Recreation": ["GAA", "Soccer / Football", "Rugby", "Tennis", "Golf", "Athletics", "Swimming", "Cycling", "Boxing", "Martial Arts", "Equestrian", "Rowing", "Sailing"],
    "Youth & Community": ["Scouts", "Girl Guides", "Youth Club", "Tidy Towns", "Community Group", "Residents Association"],
    "Arts & Culture": ["Drama & Theatre", "Music", "Dance", "Art & Craft", "Book Club"],
    "Faith & Religious": ["Catholic Church", "Church of Ireland", "Methodist Church", "Presbyterian Church", "Baptist Church", "Evangelical Church", "Orthodox Church", "Islamic Centre / Mosque", "Jewish Synagogue", "Hindu Temple", "Buddhist Centre", "Quaker Meeting House", "Faith Community"],
    "Libraries": ["Public Library", "County Library", "Mobile Library", "Community Library", "University Library", "School Library"],
    "Leisure & Community": ["Walking Group", "Gardening Club", "Toastmasters", "ICA", "Men's Shed", "Women's Group", "Senior Citizens"],
    "Charity & Welfare": ["Charity"]
  },
  "Education": {
    "Schools": ["Primary School", "Secondary School", "Gaelscoil", "Gaelchóláiste", "Special Education"],
    "Higher Education": ["Third Level", "Further Education"],
    "Childcare": ["Montessori", "Childcare", "Crèche"],
    "Training & Skills": ["Language School", "Music Lessons", "Arts & Drama", "Sports Coaching", "Adult Education", "Tutoring", "Community Training", "Youthreach"]
  },
  "What's On": {
    "Festivals & Markets": ["Festival", "Market"],
    "Entertainment": ["Concert", "Theatre", "Exhibition"],
    "Community Activities": ["Community Event", "Workshop", "Talk & Lecture", "Fundraiser", "Family Event"],
    "Seasonal & Themed": ["Christmas Event", "Summer Event", "Food Event", "Sports Event", "Cultural Event"]
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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const listings = await base44.entities.CommunityListing.list('-created_date', 10000);

    // Group by type, then collect all unique categories per type
    const categoryByType = {};
    listings.forEach(l => {
      if (!l.type || !l.category) return;
      if (!categoryByType[l.type]) categoryByType[l.type] = new Set();
      categoryByType[l.type].add(l.category);
    });

    // Convert sets to sorted arrays
    const result = {};
    for (const [type, cats] of Object.entries(categoryByType)) {
      result[type] = Array.from(cats).sort();
    }

    return Response.json({ categories: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
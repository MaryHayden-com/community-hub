import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { q, limit = 200 } = await req.json();

    if (!q || q.trim().length < 2) {
      return Response.json({ results: [] });
    }

    const term = q.trim();

    // Search all text fields including array fields via $elemMatch
    const results = await base44.asServiceRole.entities.CommunityListing.filter(
      {
        status: { $ne: "rejected" },
        $or: [
          { name: { $regex: term, $options: "i" } },
          { description: { $regex: term, $options: "i" } },
          { contact_name: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
          { phone: { $regex: term, $options: "i" } },
          { town: { $regex: term, $options: "i" } },
          { nearest_town: { $regex: term, $options: "i" } },
          { county: { $regex: term, $options: "i" } },
          { area: { $regex: term, $options: "i" } },
          { address: { $regex: term, $options: "i" } },
          { meeting_info: { $regex: term, $options: "i" } },
          { category_text: { $regex: term, $options: "i" } },
          { type: { $regex: term, $options: "i" } },
          // Array field searches
          { category: { $elemMatch: { $regex: term, $options: "i" } } },
          { subcategory_group: { $elemMatch: { $regex: term, $options: "i" } } },
          { subgroup: { $elemMatch: { $regex: term, $options: "i" } } },
        ]
      },
      "-created_date",
      Math.min(limit, 500)
    );

    return Response.json({ results, total: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
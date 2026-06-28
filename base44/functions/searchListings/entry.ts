import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { q, limit = 100 } = await req.json();

    if (!q || q.trim().length < 2) {
      return Response.json({ results: [] });
    }

    const term = q.trim();

    // Search across all text fields using $regex on multiple fields with $or
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
        ]
      },
      "-created_date",
      Math.min(limit, 500)
    );

    // Also search array fields (category, subcategory_group, subgroup) client-side
    // since $regex on array fields may not be supported — fetch a broader set and filter
    return Response.json({ results, total: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
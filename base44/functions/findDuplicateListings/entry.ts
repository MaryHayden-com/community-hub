import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Normalise a name/town for duplicate comparison: lowercase, strip accents and
// all non-alphanumerics so "An Tobairin" / "An Tobairín" and "atkins farm" /
// "Atkins Farm & Garden" collapse to the same key.
function norm(s: unknown): string {
  return (s ? String(s) : "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only: duplicate-review clusters expose private owner/contact data
    // across all listings, so callers must be authenticated and authorised.
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.CommunityListing.filter(
      { status: { $ne: "rejected" } },
      "name",
      2000
    );

    const byKey = new Map<string, any[]>();
    (all as any[]).forEach((l) => {
      const townPart = norm(l.town || l.nearest_town || l.area || l.county);
      const baseKey = norm(l.name) + "||" + townPart;
      // What's On events are only flagged as duplicates when they also share the
      // same event date (or recurrence schedule) — two events with the same name
      // at the same venue on different dates are legitimate separate listings.
      let key = baseKey;
      if (l.type === "What's On") {
        let dateKey = l.event_date || "";
        if (!dateKey) dateKey = (l.recurring_type || "") + "|" + (l.recurring_day || "");
        if (!dateKey) dateKey = "nodate";
        key = baseKey + "||" + dateKey;
      }
      const arr = byKey.get(key) || [];
      arr.push(l);
      byKey.set(key, arr);
    });

    const clusters = [...byKey.values()]
      .filter((g) => g.length >= 2)
      .map((g) =>
        g
          .map((l) => ({
            id: l.id,
            name: l.name,
            type: l.type,
            category: l.category,
            subcategory_group: l.subcategory_group,
            county: l.county,
            town: l.town,
            area: l.area,
            phone: l.phone,
            email: l.email,
            website: l.website,
            facebook_url: l.facebook_url,
            instagram_url: l.instagram_url,
            linkedin_url: l.linkedin_url,
            contact_name: l.contact_name,
            description: l.description,
            address: l.address,
            meeting_info: l.meeting_info,
            image_url: l.image_url,
            owner_email: l.owner_email,
            is_featured: l.is_featured,
            event_date: l.event_date,
            is_recurring: l.is_recurring,
            recurring_type: l.recurring_type,
            recurring_day: l.recurring_day,
            updated_date: l.updated_date,
          }))
      )
      .sort((a, b) => b.length - a.length);

    return Response.json({
      clusters,
      total: clusters.length,
      potentialDuplicates: clusters.reduce((s, g) => s + (g.length - 1), 0),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Common local search synonyms — expand a query so a search term also matches
// the way the same thing is typically described in a listing.
const SYNONYMS: Record<string, string[]> = {
  plumber: ["plumbing", "plumbers"],
  electrician: ["electrical", "electricians"],
  hairdresser: ["hair", "hair salon", "barber"],
  barber: ["barber", "hair", "hairdresser"],
  takeaway: ["take away", "fast food", "chipper", "takeaway"],
  coffee: ["café", "cafe", "coffee shop"],
  cafe: ["coffee", "café", "coffee shop"],
  gym: ["fitness", "leisure centre", "gymnasium"],
  vet: ["veterinary", "veterinary clinic"],
  childcare: ["crèche", "creche", "child care", "playschool", "montessori"],
  doctor: ["gp", "medical", "medical centre"],
  dentist: ["dental", "dental clinic"],
  pharmacy: ["chemist", "pharmacist"],
  pub: ["bar", "public house"],
  restaurant: ["dining", "eatery", "bistro"],
  solicitor: ["legal", "law", "lawyer"],
  florist: ["flowers", "floristry"],
  hotel: ["accommodation", "guesthouse", "bnb", "b&b"],
  school: ["education", "college", "course"],
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toArr(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : (v ? [v as string] : []);
}

function score(listing: any, terms: string[]): number {
  const name = (listing.name || "").toLowerCase();
  const desc = (listing.description || "").toLowerCase();
  const town = (listing.town || "").toLowerCase();
  const area = (listing.area || "").toLowerCase();
  const county = (listing.county || "").toLowerCase();
  const nearest = (listing.nearest_town || "").toLowerCase();
  const address = (listing.address || "").toLowerCase();
  const type = (listing.type || "").toLowerCase();
  const catText = (listing.category_text || "").toLowerCase();
  const groups = toArr(listing.subcategory_group).map((s) => s.toLowerCase());
  const subgroups = toArr(listing.subgroup).map((s) => s.toLowerCase());
  const categories = toArr(listing.category).map((s) => s.toLowerCase());

  // Tiered ranking: a single match in a high-tier field (name, category) must
  // outrank any number of lower-tier (description) matches. Encoded as
  // tier * 100000 + pts so the sort key is a single number and the existing
  // desc-by-score sort keeps tiers strictly ordered above description hits
  // (fixes alphabetical-on-description bug where "coffee" surfaced a toy shop
  // ahead of real cafés).
  let tier = -1;
  let pts = 0;
  const consider = (t: number, p: number) => {
    if (t > tier) { tier = t; pts = p; }
    else if (t === tier && p > pts) { pts = p; }
  };

  for (const t of terms) {
    const tl = t.toLowerCase();
    if (name === tl) consider(5, 100);
    else if (name.startsWith(tl)) consider(5, 70);
    else if (name.includes(tl)) consider(5, 40);
    if (groups.some((g) => g.includes(tl)) || subgroups.some((s) => s.includes(tl)) || categories.some((c) => c.includes(tl)) || catText.includes(tl)) consider(4, 30);
    if (type.includes(tl)) consider(3, 20);
    if (town.includes(tl) || area.includes(tl) || nearest.includes(tl) || county.includes(tl)) consider(2, 10);
    if (address.includes(tl)) consider(1, 5);
    if (desc.includes(tl)) consider(0, 1);
  }
  if (tier < 0) return 0;
  return tier * 100000 + pts;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { q, limit = 200 } = await req.json();

    if (!q || q.trim().length < 2) {
      return Response.json({ results: [] });
    }

    const term = q.trim();
    const syn = SYNONYMS[term.toLowerCase()] || [];
    const terms = [term, ...syn];

    const textFields = ["name", "description", "contact_name", "email", "phone", "town", "nearest_town", "county", "area", "address", "meeting_info", "category_text", "type"];
    const orClauses: object[] = [];
    terms.forEach((t) => {
      const r = { $regex: escapeRegex(t), $options: "i" };
      textFields.forEach((f) => orClauses.push({ [f]: r }));
      orClauses.push({ category: { $elemMatch: r } });
      orClauses.push({ subcategory_group: { $elemMatch: r } });
      orClauses.push({ subgroup: { $elemMatch: r } });
    });

    // Public search must only surface approved listings — never pending
    // (unreviewed) submissions, which `$ne: "rejected"` would have leaked.
    const candidates = await base44.asServiceRole.entities.CommunityListing.filter(
      { status: "approved", $or: orClauses },
      "-created_date",
      Math.min(Math.max(limit * 3, 50), 500)
    );

    const ranked = (candidates as any[])
      .map((l) => ({ l, s: score(l, terms) }))
      .sort((a, b) => b.s - a.s || (a.l.name || "").localeCompare(b.l.name || ""))
      .slice(0, Math.min(limit, 500))
      .map((x) => x.l);

    return Response.json({ results: ranked, total: ranked.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
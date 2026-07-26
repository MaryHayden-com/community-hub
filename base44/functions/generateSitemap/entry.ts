import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ORIGIN = "https://hub4community.com";
const STATIC_PAGES = ["/", "/directory", "/whats-on", "/about", "/privacy", "/saved", "/calendar", "/survey"];
// /directory?type=<Type> — one landing URL per listing type
const DIRECTORY_TYPES = [
  "Business",
  "Club & Group",
  "Community Services",
  "Education",
  "What's On",
];
const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow",
  "Antrim", "Armagh", "Down", "Fermanagh", "Tyrone", "Derry/Londonderry",
];

// Escape XML special chars without using HTML entities in source
function xmlEscape(s) {
  const amp = String.fromCharCode(38); // &
  return String(s || "")
    .replace(/&/g, amp + "amp;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;");
}

export default async function (req: Request): Promise<Response> {
  try {
    // Public endpoint (no auth) — crawlers must be able to fetch it.
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().slice(0, 10);

    const urls = STATIC_PAGES.map((p) => `${ORIGIN}${p}`);

    // /directory?type=<Type> — one landing URL per listing type
    DIRECTORY_TYPES.forEach((t) => urls.push(`${ORIGIN}/directory?type=${encodeURIComponent(t)}`));

    // /county/:county — one landing URL per county
    COUNTIES.forEach((c) => urls.push(`${ORIGIN}/county/${encodeURIComponent(c)}`));

    // All approved listings → /listing/:id (one URL per listing).
    // Collect distinct (county, town) pairs at the same time → /town/:county/:town.
    const townPairs = new Set();
    let skip = 0;
    let hasMore = true;
    while (hasMore) {
      const batch = await base44.asServiceRole.entities.CommunityListing.filter(
        { status: "approved" },
        "-updated_date",
        200,
        skip
      );
      for (const l of batch) {
        if (l && l.id) urls.push(`${ORIGIN}/listing/${encodeURIComponent(l.id)}`);
        if (l && l.county && l.town) {
          townPairs.add(`${l.county}\u0000${l.town}`);
        }
      }
      hasMore = batch.length === 200;
      skip += 200;
    }

    // /town/:county/:town — one landing URL per real town with listings
    for (const pair of townPairs) {
      const [county, town] = pair.split("\u0000");
      urls.push(`${ORIGIN}/town/${encodeURIComponent(county)}/${encodeURIComponent(town)}`);
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml = xml + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const u of urls) {
      xml = xml + `  <url><loc>${xmlEscape(u)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
    }
    xml = xml + "</urlset>";

    return new Response(xml, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
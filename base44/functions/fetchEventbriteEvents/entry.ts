import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Token that authorises the scheduled automation (no user context) to run this endpoint.
const SCHEDULER_TOKEN = 'chEvSched_9f3c7a1e4d8b';

// 26 Republic counties grouped by province. One AI web-search call per province covers
// events + businesses + community clubs across that province's towns.
const PROVINCES = [
  { name: "Munster", counties: [
    { county: "Cork", towns: ["Cork City","Bandon","Bantry","Clonakilty","Macroom","Mallow","Midleton","Skibbereen","Kinsale","Fermoy","Youghal"] },
    { county: "Kerry", towns: ["Tralee","Killarney","Listowel","Kenmare","Dingle","Cahirciveen","Killorglin"] },
    { county: "Limerick", towns: ["Limerick City","Newcastle West","Adare","Kilmallock","Rathkeale"] },
    { county: "Tipperary", towns: ["Clonmel","Nenagh","Thurles","Tipperary Town","Carrick-on-Suir","Cashel","Roscrea"] },
    { county: "Clare", towns: ["Ennis","Ennistymon","Kilrush","Killaloe","Shannon"] },
    { county: "Waterford", towns: ["Waterford City","Dungarvan","Tramore","Lismore"] },
  ]},
  { name: "Leinster", counties: [
    { county: "Dublin", towns: ["Dublin City","Swords","Tallaght","Dún Laoghaire","Balbriggan","Lucan"] },
    { county: "Kildare", towns: ["Naas","Athy","Newbridge","Leixlip","Maynooth","Kildare"] },
    { county: "Kilkenny", towns: ["Kilkenny City","Callan","Castlecomer","Thomastown"] },
    { county: "Laois", towns: ["Portlaoise","Portarlington","Mountmellick","Abbeyleix"] },
    { county: "Longford", towns: ["Longford Town","Ballymahon","Granard"] },
    { county: "Louth", towns: ["Drogheda","Dundalk","Ardee","Carlingford"] },
    { county: "Meath", towns: ["Navan","Trim","Kells","Ashbourne","Dunshaughlin"] },
    { county: "Offaly", towns: ["Tullamore","Birr","Edenderry","Clara"] },
    { county: "Westmeath", towns: ["Athlone","Mullingar","Moate","Kinnegad"] },
    { county: "Wexford", towns: ["Wexford Town","Enniscorthy","Gorey","New Ross","Rosslare"] },
    { county: "Wicklow", towns: ["Bray","Wicklow Town","Greystones","Arklow","Blessington"] },
    { county: "Carlow", towns: ["Carlow","Tullow","Bagenalstown"] },
  ]},
  { name: "Connacht", counties: [
    { county: "Galway", towns: ["Galway City","Tuam","Ballinasloe","Loughrea","Oranmore","Gort"] },
    { county: "Mayo", towns: ["Castlebar","Ballina","Westport","Claremorris","Ballinrobe"] },
    { county: "Roscommon", towns: ["Roscommon Town","Boyle","Castlerea","Strokestown"] },
    { county: "Sligo", towns: ["Sligo Town","Ballymote","Collooney","Strandhill"] },
    { county: "Leitrim", towns: ["Carrick-on-Shannon","Manorhamilton","Ballinamore"] },
  ]},
  { name: "Ulster (Republic)", counties: [
    { county: "Donegal", towns: ["Letterkenny","Donegal Town","Buncrana","Ballyshannon","Bundoran","Killybegs"] },
    { county: "Monaghan", towns: ["Monaghan Town","Carrickmacross","Castleblayney","Clones"] },
    { county: "Cavan", towns: ["Cavan","Bailieborough","Virginia","Belturbet"] },
  ]},
];

const MAX_BUSINESS_PER_PROVINCE = 8;
const MAX_CLUB_PER_PROVINCE = 6;
const MAX_EVENTS_PER_PROVINCE = 20;

const GENERIC_EVENT = new Set(["event","market","festival","meeting","mass","gaa","bingo"]);
const GENERIC_BUSINESS = new Set(["pub","hotel","restaurant","cafe","shop","bar","store","salon","gym"]);

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
const todayStr = () => new Date().toISOString().slice(0, 10);

// Build a town -> {county, town} lookup and a known-county set for location matching.
const townIndex: Record<string, { county: string; town: string }> = {};
const knownCounties = new Set<string>();
for (const p of PROVINCES) for (const c of p.counties) {
  knownCounties.add(c.county);
  for (const t of c.towns) townIndex[norm(t)] = { county: c.county, town: t };
}

function matchLocation(rawTown?: string, rawCounty?: string) {
  const t = norm(rawTown || "");
  if (t && townIndex[t]) return { county: townIndex[t].county, town: townIndex[t].town, matchedTown: true };
  const c = (rawCounty || "").trim();
  if (c && knownCounties.has(c)) return { county: c, town: (rawTown || "").trim(), matchedTown: false };
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin (manual) OR scheduled automation carrying the shared token.
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const isScheduler = body?.scheduler_token === SCHEDULER_TOKEN;
    const isAdmin = user && user.role === "admin";
    if (!isAdmin && !isScheduler) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }
    const dryRun = body?.dry_run === true;

    const today = todayStr();

    // ── Load existing listings to dedup against (events + places) ──────────────
    const [existingEvents, existingBiz, existingClubs] = await Promise.all([
      base44.asServiceRole.entities.CommunityListing.filter({ type: "What's On" }, "-created_date", 2000),
      base44.asServiceRole.entities.CommunityListing.filter({ type: "Business" }, "-created_date", 2000),
      base44.asServiceRole.entities.CommunityListing.filter({ type: "Club & Group" }, "-created_date", 2000),
    ]);

    const eventKeys = new Set<string>();
    const placeKeyId: Record<string, string> = {}; // venueKey -> listing id (resolved venues)
    const placeKeySet = new Set<string>();          // venueKey (existing + queued this run)

    for (const l of existingEvents) {
      const baseName = (l.name || "").replace(/\s+—\s*\d{4}-\d{2}-\d{2}$/, "").trim();
      eventKeys.add(norm(baseName) + "__" + norm(l.nearest_town || l.town) + "__" + (l.event_date || "none"));
    }
    for (const l of [...existingBiz, ...existingClubs]) {
      const k = norm(l.name) + "__" + norm(l.nearest_town || l.town);
      placeKeyId[k] = l.id;
      placeKeySet.add(k);
    }

    // Buckets collected across all provinces.
    const buckets = {
      bizApproved: [] as any[], bizPending: [] as any[],
      clubApproved: [] as any[], clubPending: [] as any[],
      eventApproved: [] as any[], eventPending: [] as any[],
    };
    let venuesCreated = 0;
    const samples: any = { events: [], businesses: [], clubs: [] };

    const processProvince = async (prov:typeof PROVINCES[number]) => {
      try {
        const townList = prov.counties.map(c => `${c.towns.join(", ")} (${c.county})`).join("; ");
        const prompt = `Search the web for real, specific local information across these Irish towns by county: ${townList}.

Return THREE categories as JSON, all genuine and current (no invented entries):

1) "events" — public community events, festivals, markets, concerts, sport and other happenings in the next 30 days (from ${today}). Each needs: name, description, event_date (YYYY-MM-DD), event_time (HH:MM or ""), venue_name (the host venue/business if known), venue_type ("Business" or "Club & Group" or ""), address, website, email, phone, town, county.

2) "businesses" — well-known local businesses (pubs, restaurants, shops, salons, trades, etc). Each needs: name, description, category (e.g. Pub, Restaurant, Shop, Salon), address, website, phone, town, county.

3) "clubs" — community clubs and groups (GAA, soccer, scouts, tidy towns, drama, choirs, community groups, charities). Each needs: name, description, category (e.g. GAA, Scouts, Drama), meeting_info, address, website, town, county.

Only return items where the town matches one of the listed towns. Prefer entries with a website or verifiable source.`;

        const aiRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              events: { type: "array", items: { type: "object", properties: {
                name: { type: "string" }, description: { type: "string" }, event_date: { type: "string" },
                event_time: { type: "string" }, venue_name: { type: "string" }, venue_type: { type: "string" },
                address: { type: "string" }, website: { type: "string" }, email: { type: "string" },
                phone: { type: "string" }, town: { type: "string" }, county: { type: "string" },
              } } },
              businesses: { type: "array", items: { type: "object", properties: {
                name: { type: "string" }, description: { type: "string" }, category: { type: "string" },
                address: { type: "string" }, website: { type: "string" }, phone: { type: "string" },
                town: { type: "string" }, county: { type: "string" },
              } } },
              clubs: { type: "array", items: { type: "object", properties: {
                name: { type: "string" }, description: { type: "string" }, category: { type: "string" },
                meeting_info: { type: "string" }, address: { type: "string" }, website: { type: "string" },
                town: { type: "string" }, county: { type: "string" },
              } } },
            }
          }
        });

        const events = aiRes?.events || [];
        const businesses = aiRes?.businesses || [];
        const clubs = aiRes?.clubs || [];

        // ── Businesses ─────────────────────────────────────────────────────────
        let bizCount = 0;
        for (const b of businesses) {
          if (!b.name || bizCount >= MAX_BUSINESS_PER_PROVINCE) break;
          const loc = matchLocation(b.town, b.county);
          if (!loc) continue;
          const key = norm(b.name) + "__" + norm(loc.town);
          if (placeKeySet.has(key)) continue;
          placeKeySet.add(key);
          const name = String(b.name).trim();
          const wc = name.split(/\s+/).length;
          const generic = wc === 1 && GENERIC_BUSINESS.has(norm(name));
          const looksGood = loc.matchedTown && name.length >= 4 && !generic && !!(b.website || b.description);
          const rec = {
            name, type: "Business",
            category: b.category ? [String(b.category)] : [],
            county: loc.county, nearest_town: loc.town, town: loc.town, country: "Ireland",
            description: b.description || "", address: b.address || "", website: b.website || "",
            phone: b.phone || "", status: looksGood ? "approved" : "pending",
            is_verified: false, is_featured: false,
          };
          (looksGood ? buckets.bizApproved : buckets.bizPending).push(rec);
          if (samples.businesses.length < 6) samples.businesses.push(rec);
          bizCount++;
        }

        // ── Clubs & Groups ─────────────────────────────────────────────────────
        let clubCount = 0;
        for (const cl of clubs) {
          if (!cl.name || clubCount >= MAX_CLUB_PER_PROVINCE) break;
          const loc = matchLocation(cl.town, cl.county);
          if (!loc) continue;
          const key = norm(cl.name) + "__" + norm(loc.town);
          if (placeKeySet.has(key)) continue;
          placeKeySet.add(key);
          const name = String(cl.name).trim();
          const wc = name.split(/\s+/).length;
          const generic = wc === 1 && GENERIC_BUSINESS.has(norm(name));
          const looksGood = loc.matchedTown && name.length >= 4 && !generic && !!(cl.website || cl.description || cl.meeting_info);
          const rec = {
            name, type: "Club & Group",
            category: cl.category ? [String(cl.category)] : [],
            county: loc.county, nearest_town: loc.town, town: loc.town, country: "Ireland",
            description: cl.description || "", meeting_info: cl.meeting_info || "",
            address: cl.address || "", website: cl.website || "",
            status: looksGood ? "approved" : "pending", is_verified: false, is_featured: false,
          };
          (looksGood ? buckets.clubApproved : buckets.clubPending).push(rec);
          if (samples.clubs.length < 6) samples.clubs.push(rec);
          clubCount++;
        }

        // ── Events (with parent venue listing) ─────────────────────────────────
        let evCount = 0;
        for (const e of events) {
          if (!e.name || !e.event_date || evCount >= MAX_EVENTS_PER_PROVINCE) continue;
          const loc = matchLocation(e.town, e.county);
          if (!loc) continue;
          const baseName = String(e.name).replace(/\s+—\s*\d{4}-\d{2}-\d{2}$/, "").trim();
          const eKey = norm(baseName) + "__" + norm(loc.town) + "__" + e.event_date;
          if (eventKeys.has(eKey)) continue;
          eventKeys.add(eKey);

          // Resolve / create parent venue listing
          let parentId = "";
          if (e.venue_name) {
            const vKey = norm(String(e.venue_name)) + "__" + norm(loc.town);
            if (placeKeyId[vKey]) {
              parentId = placeKeyId[vKey];
            } else if (!placeKeySet.has(vKey) && !dryRun) {
              // Net-new venue — create now to obtain its id and link the event.
              const vLoc = loc;
              const vType = e.venue_type === "Club & Group" ? "Club & Group" : "Business";
              const venue = await base44.asServiceRole.entities.CommunityListing.create({
                name: String(e.venue_name),
                type: vType,
                county: vLoc.county, nearest_town: vLoc.town, town: vLoc.town, country: "Ireland",
                description: `Venue hosting "${baseName}"`, address: e.address || "",
                website: e.website || "", phone: e.phone || "", email: e.email || "",
                status: vLoc.matchedTown ? "approved" : "pending",
                is_verified: false, is_featured: false,
              });
              placeKeyId[vKey] = venue.id;
              placeKeySet.add(vKey);
              parentId = venue.id;
              venuesCreated++;
            }
          }

          const wc = baseName.split(/\s+/).length;
          const isGeneric = wc === 1 && GENERIC_EVENT.has(norm(baseName));
          const looksGood = e.event_date >= today && loc.matchedTown && !isGeneric && !!(e.description || "").trim();

          const rec = {
            name: baseName, type: "What's On",
            category: ["Community Event"],
            county: loc.county, nearest_town: loc.town, town: loc.town, country: "Ireland",
            description: e.description || "", address: e.address || "", website: e.website || "",
            email: e.email || "", phone: e.phone || "",
            event_date: e.event_date, event_time: e.event_time || "",
            parent_listing_id: parentId,
            status: looksGood ? "approved" : "pending", is_verified: false, is_featured: false,
          };
          (looksGood ? buckets.eventApproved : buckets.eventPending).push(rec);
          if (samples.events.length < 8) samples.events.push(rec);
          evCount++;
        }
      } catch (err) {
        console.error(`Province ${prov.name} failed:`, err.message);
      }
    };

    // Provinces operate on disjoint towns — safe to run in parallel.
    await Promise.all(PROVINCES.map(processProvince));

    const created: any = {};
    if (!dryRun) {
      for (const [k, arr] of Object.entries(buckets)) {
        if (arr.length > 0) {
          try {
            await base44.asServiceRole.entities.CommunityListing.bulkCreate(arr);
            created[k] = arr.length;
          } catch (err) { console.error(`bulkCreate ${k} failed:`, err.message); }
        } else { created[k] = 0; }
      }
    }

    const totals = {
      businesses: buckets.bizApproved.length + buckets.bizPending.length,
      clubs: buckets.clubApproved.length + buckets.clubPending.length,
      events: buckets.eventApproved.length + buckets.eventPending.length,
      approved: buckets.bizApproved.length + buckets.clubApproved.length + buckets.eventApproved.length,
      pending: buckets.bizPending.length + buckets.clubPending.length + buckets.eventPending.length,
    };
    const totalNew = totals.businesses + totals.clubs + totals.events;

    // Admin digest email (only on a real run that produced something)
    if (!dryRun && totalNew > 0) {
      try {
        const reviewLine = totals.pending > 0
          ? `Review pending items: https://hub4community.com/admin#pending (Pending Approval tab)`
          : `Nothing needs review this run — all listings were auto-published.\nManage them: https://hub4community.com/admin`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: "mary@maryhayden.com",
          from_name: "Community Hub",
          subject: `📍 ${totalNew} new listings imported (auto-published + review)`,
          body: `Auto-import summary across ${PROVINCES.length} provinces / ${PROVINCES.reduce((n,p)=>n+p.counties.length,0)} counties.\n\n`
            + `Approved (live): ${totals.approved}\nNeeds review: ${totals.pending}\n`
            + `Businesses: ${totals.businesses}  Clubs/Groups: ${totals.clubs}  Events: ${totals.events}\n`
            + `Parent venue listings created: ${venuesCreated}\n\n`
            + reviewLine,
        });
      } catch (err) { console.error("digest email failed:", err.message); }
    }

    return Response.json({
      dry_run: dryRun,
      provinces: PROVINCES.length,
      counties: PROVINCES.reduce((n, p) => n + p.counties.length, 0),
      totals,
      venues_created: dryRun ? 0 : venuesCreated,
      created,
      samples: dryRun ? samples : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
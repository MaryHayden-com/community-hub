import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Locations to search for events
const IRELAND_LOCATIONS = [
  { county: 'Cork', town: 'Cork' },
  { county: 'Kerry', town: 'Tralee' },
  { county: 'Kerry', town: 'Killarney' },
  { county: 'Cork', town: 'Bantry' },
  { county: 'Cork', town: 'Skibbereen' },
  { county: 'Cork', town: 'Clonakilty' },
  { county: 'Cork', town: 'Dunmanway' },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Require an authenticated Super Admin. (Scheduled callers must supply a
  // valid admin context; anonymous HTTP calls are rejected.)
  let user = null;
  try { user = await base44.auth.me(); } catch (_) {}
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const locationList = IRELAND_LOCATIONS.map(l => `${l.town}, ${l.county}`).join('; ');

  // Fetch existing listings to avoid duplicates
  const existing = await base44.asServiceRole.entities.CommunityListing.filter({ type: "What's On" }, '-created_date', 2000);
  const existingNames = new Set(existing.map(l => l.name?.toLowerCase().trim()));

  console.log(`Searching for events across: ${locationList}`);

  // Single batched AI web search for all locations
  let aiResult;
  try {
    aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search the web for upcoming community events, festivals, markets, concerts, sports events and other public events in the following towns in Ireland in the next 30 days (from ${today}): ${locationList}. 
      
      Return only real, specific events with confirmed dates. Include events from local council websites, eventbrite.ie, facebook events, local newspapers, and community websites. 
      
      For each event include: name, description (1-2 sentences), event_date (YYYY-MM-DD format), event_time (HH:MM format, or empty string if unknown), address, website (URL if available), email (contact email if available), phone (contact phone number if available), town, county.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                event_date: { type: 'string' },
                event_time: { type: 'string' },
                address: { type: 'string' },
                website: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                town: { type: 'string' },
                county: { type: 'string' },
              }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('AI web search failed:', err.message);
    return Response.json({ error: err.message, created: 0 }, { status: 500 });
  }

  const events = aiResult?.events || [];
  console.log(`AI returned ${events.length} events`);

  const toCreate = [];
  for (const e of events) {
    if (!e.name || !e.event_date) continue;
    if (existingNames.has(e.name.toLowerCase().trim())) continue;

    // Match town/county to our known locations (fallback to first match by county)
    const loc = IRELAND_LOCATIONS.find(l =>
      l.town.toLowerCase() === (e.town || '').toLowerCase() ||
      l.county.toLowerCase() === (e.county || '').toLowerCase()
    ) || IRELAND_LOCATIONS[0];

    const resolvedTown = e.town || loc.town;
    toCreate.push({
      name: e.name,
      type: "What's On",
      category: ['Community Event'],
      county: e.county || loc.county,
      nearest_town: resolvedTown,
      town: resolvedTown,
      country: 'Ireland',
      description: e.description || '',
      address: e.address || '',
      website: e.website || '',
      email: e.email || '',
      phone: e.phone || '',
      event_date: e.event_date,
      event_time: e.event_time || '',
      status: 'pending',
      is_verified: false,
      is_featured: false,
    });

    existingNames.add(e.name.toLowerCase().trim());
  }

  if (toCreate.length > 0) {
    await base44.asServiceRole.entities.CommunityListing.bulkCreate(toCreate);
    console.log(`Created ${toCreate.length} new events`);

    const rows = toCreate.map((e) => {
      const contact = [e.email, e.phone].filter(Boolean).join(' / ') || 'No contact info found';
      return `- ${e.name} (${e.town}, Co. ${e.county}) on ${e.event_date}\n  Contact: ${contact}`;
    }).join('\n\n');

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'mary@maryhayden.com',
        from_name: 'Community Hub',
        subject: `📅 ${toCreate.length} new What's On event${toCreate.length > 1 ? 's' : ''} awaiting review`,
        body: `The daily events search found ${toCreate.length} new event${toCreate.length > 1 ? 's' : ''}. They've been added as pending so you can review and follow up before they go live:\n\n${rows}\n\n👉 Review and approve here: https://community-hub.base44.app/admin\n(Go to the "Pending Approval" tab)`,
      });
    } catch (err) {
      console.error('Failed to send new events notification email:', err.message);
    }
  } else {
    console.log('No new events to create');
  }

  return Response.json({ created: toCreate.length, total_found: events.length });
});
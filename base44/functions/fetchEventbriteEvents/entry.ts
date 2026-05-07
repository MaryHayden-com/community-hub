import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Irish counties with their approximate lat/long for Eventbrite location search
const IRELAND_LOCATIONS = [
  { county: 'Cork', town: 'Cork', lat: 51.8985, lng: -8.4756 },
  { county: 'Kerry', town: 'Tralee', lat: 52.2675, lng: -9.7003 },
  { county: 'Kerry', town: 'Killarney', lat: 52.0599, lng: -9.5044 },
  { county: 'Cork', town: 'Bantry', lat: 51.6817, lng: -9.4564 },
  { county: 'Cork', town: 'Skibbereen', lat: 51.5527, lng: -9.2613 },
  { county: 'Cork', town: 'Clonakilty', lat: 51.6237, lng: -8.8991 },
  { county: 'Cork', town: 'Dunmanway', lat: 51.7167, lng: -9.1167 },
];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow both admin calls and scheduled automation (no user)
  let user = null;
  try { user = await base44.auth.me(); } catch (_) {}
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const today = new Date().toISOString();
  const allCreated = [];
  const errors = [];

  // Fetch existing listings to avoid duplicates
  const existing = await base44.asServiceRole.entities.CommunityListing.filter({ type: "What's On" }, '-created_date', 2000);
  const existingNames = new Set(existing.map(l => l.name?.toLowerCase().trim()));

  for (const loc of IRELAND_LOCATIONS) {
    try {
      // Eventbrite public search — no API key needed for basic searches
      const url = `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${loc.lat}&location.longitude=${loc.lng}&location.within=30km&start_date.range_start=${today}&expand=venue,organizer&sort_by=date&page_size=20`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!res.ok) {
        console.error(`Eventbrite fetch failed for ${loc.town}: ${res.status} ${res.statusText}`);
        // Fall back to AI web search for this location
        const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Search the web for upcoming events in ${loc.town}, ${loc.county}, Ireland in the next 30 days. Today is ${new Date().toISOString().slice(0,10)}. Return real, specific events only with dates.`,
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
                  }
                }
              }
            }
          }
        });

        for (const e of (aiResult?.events || [])) {
          if (!e.name || existingNames.has(e.name.toLowerCase().trim())) continue;
          const listing = {
            name: e.name,
            type: "What's On",
            category: ['Community Event'],
            county: loc.county,
            town: loc.town,
            country: 'Ireland',
            description: e.description || '',
            address: e.address || '',
            website: e.website || '',
            event_date: e.event_date || '',
            event_time: e.event_time || '',
            is_verified: false,
            is_featured: false,
          };
          allCreated.push(listing);
          existingNames.add(e.name.toLowerCase().trim());
        }
        continue;
      }

      const data = await res.json();
      const events = data.events || [];

      for (const e of events) {
        const name = e.name?.text || e.name;
        if (!name || existingNames.has(name.toLowerCase().trim())) continue;

        const startDate = e.start?.local || '';
        const eventDate = startDate ? startDate.slice(0, 10) : '';
        const eventTime = startDate && startDate.includes('T') ? startDate.slice(11, 16) : '';
        const venue = e.venue;
        const address = venue ? [venue.name, venue.address?.address_1, venue.address?.city].filter(Boolean).join(', ') : '';
        const website = e.url || '';
        const description = e.description?.text || e.summary || '';

        const listing = {
          name,
          type: "What's On",
          category: ['Community Event'],
          county: loc.county,
          town: venue?.address?.city || loc.town,
          country: 'Ireland',
          description,
          address,
          website,
          event_date: eventDate,
          event_time: eventTime,
          is_verified: false,
          is_featured: false,
        };

        allCreated.push(listing);
        existingNames.add(name.toLowerCase().trim());
      }
    } catch (err) {
      console.error(`Error processing ${loc.town}:`, err.message);
      errors.push(`${loc.town}: ${err.message}`);
    }
  }

  if (allCreated.length > 0) {
    await base44.asServiceRole.entities.CommunityListing.bulkCreate(allCreated);
  }

  console.log(`Eventbrite fetch complete: ${allCreated.length} new events created`);
  return Response.json({ created: allCreated.length, errors, events: allCreated });
});
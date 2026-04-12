import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Get existing listings to know which counties/towns to search
  const existing = await base44.asServiceRole.entities.CommunityListing.list('-created_date', 2000);
  const counties = [...new Set(existing.map(l => l.county).filter(Boolean))];
  const towns = [...new Set(existing.map(l => l.town).filter(Boolean))];

  // Also get existing clubs/businesses to search their websites
  const businesses = existing.filter(l => l.type === 'Business' || l.type === 'Club & Group').slice(0, 30);
  const businessNames = businesses.map(b => b.name).join(', ');

  const locationList = towns.slice(0, 20).join(', ') + (counties.length ? ` (Counties: ${counties.slice(0, 10).join(', ')})` : '');

  const prompt = `Search the web and find upcoming events, festivals, markets, concerts, sports events, community gatherings and other "What's On" listings for the following locations in Ireland: ${locationList}.

Also search for events from these local businesses and clubs: ${businessNames}.

Search Facebook events, local council websites, community websites, club websites, and any relevant local Irish event listings.

Return a list of events with as much detail as possible.

Important rules:
- Only include real, specific upcoming events (not generic descriptions)
- Include the exact town and county in Ireland
- Include dates where available
- Include website or Facebook URLs where found
- Do NOT duplicate events that are clearly the same

Return as a JSON array of event objects.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
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
              town: { type: 'string' },
              county: { type: 'string' },
              category: { type: 'string' },
              address: { type: 'string' },
              website: { type: 'string' },
              facebook_url: { type: 'string' },
              meeting_info: { type: 'string' },
              contact_name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
            }
          }
        }
      }
    }
  });

  const events = result?.events || [];

  // Get existing What's On names to avoid duplicates
  const existingWhatsOn = existing.filter(l => l.type === "What's On").map(l => l.name.toLowerCase());

  const toCreate = events.filter(e =>
    e.name && e.town && e.county &&
    !existingWhatsOn.includes(e.name.toLowerCase())
  ).map(e => ({
    name: e.name,
    type: "What's On",
    category: e.category || 'Community Event',
    county: e.county,
    town: e.town,
    country: 'Ireland',
    description: e.description || '',
    address: e.address || '',
    website: e.website || '',
    facebook_url: e.facebook_url || '',
    meeting_info: e.meeting_info || '',
    contact_name: e.contact_name || '',
    phone: e.phone || '',
    email: e.email || '',
    is_featured: false,
  }));

  if (toCreate.length > 0) {
    await base44.asServiceRole.entities.CommunityListing.bulkCreate(toCreate);
  }

  return Response.json({ found: events.length, created: toCreate.length, events: toCreate });
});
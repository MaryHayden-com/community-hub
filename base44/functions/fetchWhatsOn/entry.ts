import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Returns next N occurrences of a given weekday (0=Sun...6=Sat) starting from today
function nextWeeklyDates(weekday, count = 4) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 28 && dates.length < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === weekday) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const existing = await base44.asServiceRole.entities.CommunityListing.list('-created_date', 2000);
  const counties = [...new Set(existing.map(l => l.county).filter(Boolean))];
  const towns = [...new Set(existing.map(l => l.town).filter(Boolean))];
  const businesses = existing.filter(l => l.type === 'Business' || l.type === 'Club & Group').slice(0, 30);
  const businessNames = businesses.map(b => b.name).join(', ');
  const locationList = towns.slice(0, 20).join(', ') + (counties.length ? ` (Counties: ${counties.slice(0, 10).join(', ')})` : '');
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Search the web and find upcoming events, festivals, markets, concerts, sports events, community gatherings and other "What's On" listings for the following locations in Ireland: ${locationList}.

Also search for events from these local businesses and clubs: ${businessNames}.

Today's date is ${today}.

For each event return:
- name, description, town, county, category, address, website, facebook_url, contact_name, phone, email
- event_date: the specific date in YYYY-MM-DD format (required if it's a one-off or the next occurrence)
- event_time: the time e.g. "7:30pm"
- is_recurring: true if the event repeats weekly
- recurrence_day: the English weekday name (e.g. "tuesday") if is_recurring is true

Only include real, specific upcoming events. Include dates wherever possible.

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
              contact_name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string' },
              event_date: { type: 'string' },
              event_time: { type: 'string' },
              is_recurring: { type: 'boolean' },
              recurrence_day: { type: 'string' },
            }
          }
        }
      }
    }
  });

  const events = result?.events || [];
  const toCreate = [];

  for (const e of events) {
    if (!e.name || !e.town || !e.county) continue;

    const base = {
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
      contact_name: e.contact_name || '',
      phone: e.phone || '',
      email: e.email || '',
      event_time: e.event_time || '',
      is_featured: false,
    };

    if (e.is_recurring && e.recurrence_day) {
      const dayIndex = DAY_NAMES.indexOf(e.recurrence_day.toLowerCase());
      if (dayIndex !== -1) {
        const dates = nextWeeklyDates(dayIndex, 4);
        for (const date of dates) {
          toCreate.push({ ...base, name: `${e.name} — ${date}`, event_date: date });
        }
        continue;
      }
    }

    // One-off event
    toCreate.push({ ...base, event_date: e.event_date || '' });
  }

  if (toCreate.length > 0) {
    await base44.asServiceRole.entities.CommunityListing.bulkCreate(toCreate);
  }

  return Response.json({ found: events.length, created: toCreate.length, events: toCreate });
});
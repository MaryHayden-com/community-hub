import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

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

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all What's On listings that have meeting_info but no event_date
    const all = await base44.asServiceRole.entities.CommunityListing.list('-created_date', 2000);
    const toProcess = all.filter(l =>
      l.type === "What's On" &&
      l.meeting_info &&
      !l.meeting_info.includes('[expanded]') &&
      !l.event_date
    );

    console.log(`Found ${toProcess.length} recurring events to process`);

    if (toProcess.length === 0) {
      return Response.json({ processed: 0, created: 0, message: 'No recurring events to expand.' });
    }

    // Use LLM to parse recurrence from meeting_info
    const parseResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `For each of the following events, parse the meeting_info to determine if it's a weekly recurring event and extract the day of week and time.

Events:
${toProcess.map((l, i) => `${i}. Name: "${l.name}" | meeting_info: "${l.meeting_info}"`).join('\n')}

For each event, return:
- index (the number before the event)
- is_weekly: true if it recurs weekly
- day_of_week: English weekday name (e.g. "thursday") if weekly
- time: time string if found (e.g. "9:00pm")`,
      response_json_schema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                index: { type: 'number' },
                is_weekly: { type: 'boolean' },
                day_of_week: { type: 'string' },
                time: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const parsed = parseResult?.events || [];
    console.log(`LLM parsed ${parsed.length} events`);

    let created = 0;
    let processed = 0;

    for (const p of parsed) {
      if (!p.is_weekly || !p.day_of_week) continue;
      const dayIndex = DAY_NAMES.indexOf(p.day_of_week.toLowerCase());
      if (dayIndex === -1) continue;

      const original = toProcess[p.index];
      if (!original) continue;

      const resolvedNearestTown = (original.nearest_town && original.nearest_town.trim())
        || original.town
        || original.area
        || original.county;

      if (!resolvedNearestTown) {
        console.log(`Skipping "${original.name}" — no town/area found`);
        continue;
      }

      const category = toArray(original.category);
      const subcategory_group = toArray(original.subcategory_group);

      const dates = nextWeeklyDates(dayIndex, 4);
      const toCreate = dates.map(date => ({
        name: original.name,
        type: "What's On",
        status: 'approved',
        category: category.length > 0 ? category : ['Community Event'],
        subcategory_group,
        county: original.county || '',
        nearest_town: resolvedNearestTown,
        town: original.town || resolvedNearestTown,
        area: original.area || '',
        country: 'Ireland',
        description: original.description || '',
        address: original.address || '',
        website: original.website || '',
        facebook_url: original.facebook_url || '',
        contact_name: original.contact_name || '',
        phone: original.phone || '',
        email: original.email || '',
        meeting_info: original.meeting_info || '',
        event_date: date,
        event_time: p.time || original.event_time || '',
        is_featured: original.is_featured || false,
        image_url: original.image_url || '',
      }));

      try {
        await base44.asServiceRole.entities.CommunityListing.bulkCreate(toCreate);
        created += toCreate.length;
        processed++;

        // Mark original as expanded
        await base44.asServiceRole.entities.CommunityListing.update(original.id, {
          meeting_info: original.meeting_info + ' [expanded]'
        });
      } catch (err) {
        console.error(`Failed to create entries for "${original.name}":`, err.message);
      }
    }

    console.log(`Done: processed=${processed}, created=${created}`);
    return Response.json({
      processed,
      created,
      message: `Expanded ${processed} recurring events into ${created} dated entries.`
    });

  } catch (error) {
    console.error('expandRecurringEvents error:', error.message, error.data || '');
    return Response.json({ error: error.message }, { status: 500 });
  }
});
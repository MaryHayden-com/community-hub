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

// Token that authorises the scheduled automation (no user context) to run
// this endpoint. Set on the automation's function_args; never shipped to the client.
const SCHEDULER_TOKEN = 'chEvSched_9f3c7a1e4d8b';

// Normalize a string for duplicate comparison: lowercase, strip punctuation/whitespace.
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow an authenticated Super Admin, or the scheduled automation (which
  // runs with no user context) when it supplies the shared SCHEDULER_TOKEN.
  let user = null;
  try { user = await base44.auth.me(); } catch (_) {}
  let body = {};
  try { body = await req.json(); } catch (_) {}
  const isScheduler = body?.scheduler_token === SCHEDULER_TOKEN;
  const isAdmin = user && user.role === 'admin';
  if (!isAdmin && !isScheduler) {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const locationList = IRELAND_LOCATIONS.map(l => `${l.town}, ${l.county}`).join('; ');

  // Fetch existing listings to avoid duplicates. Smart dedup key:
  // normalized name + town + event_date (stops near-dupes like
  // "Farmers' Market" vs "Farmers Market" on the same slot).
  const existing = await base44.asServiceRole.entities.CommunityListing.filter({ type: "What's On" }, '-created_date', 2000);
  const existingKeys = new Set(
    existing.map(l => {
      // Strip trailing duplicate-date suffix some records carry ("Name — 2026-06-27")
      const baseName = (l.name || '').replace(/\s+—\s*\d{4}-\d{2}-\d{2}$/, '').trim();
      return norm(baseName) + '__' + norm(l.nearest_town || l.town) + '__' + (l.event_date || 'none');
    })
  );

  const todayDate = new Date().toISOString().slice(0, 10);
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

  const autoApproved = [];
  const needsReview = [];
  const toCreateByStatus = { approved: [], pending: [] };

  for (const e of events) {
    if (!e.name || !e.event_date) continue;

    // Match town/county to our known locations
    const loc = IRELAND_LOCATIONS.find(l =>
      l.town.toLowerCase() === (e.town || '').toLowerCase() ||
      l.county.toLowerCase() === (e.county || '').toLowerCase()
    );
    const matchedTown = !!(loc && loc.town.toLowerCase() === (e.town || '').toLowerCase());
    const fallbackLoc = loc || IRELAND_LOCATIONS[0];

    // Smart dedup key
    const dedupKey = norm(e.name) + '__' + norm(e.town || fallbackLoc.town) + '__' + e.event_date;
    if (existingKeys.has(dedupKey)) continue;

    // Quality gate for auto-approve:
    //  - event_date is today or in the future
    //  - town matched a known location exactly
    //  - name is at least 4 chars and not a single generic word
    //  - has a non-empty description
    const genericNames = new Set(['event', 'market', 'festival', 'meeting', 'mass', 'gaa', 'bingo']);
    const wordCount = e.name.trim().split(/\s+/).length;
    const isGeneric = wordCount === 1 && genericNames.has(norm(e.name));
    const futureDate = e.event_date >= todayDate;
    const hasDescription = (e.description || '').trim().length > 0;
    const looksGood = futureDate && matchedTown && !isGeneric && hasDescription;

    const resolvedTown = e.town || fallbackLoc.town;
    const record = {
      name: e.name,
      type: "What's On",
      category: ['Community Event'],
      county: e.county || fallbackLoc.county,
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
      status: looksGood ? 'approved' : 'pending',
      is_verified: false,
      is_featured: false,
    };

    // Track which bucket it went into so the email can separate them
    if (looksGood) {
      autoApproved.push(record);
      toCreateByStatus.approved.push(record);
    } else {
      needsReview.push({ ...record, _reason: !futureDate ? 'past date' : !matchedTown ? 'town not matched' : !hasDescription ? 'no description' : 'generic name' });
      toCreateByStatus.pending.push(record);
    }
    existingKeys.add(dedupKey);
  }

  if (autoApproved.length > 0) {
    await base44.asServiceRole.entities.CommunityListing.bulkCreate(autoApproved);
    console.log(`Auto-approved: ${autoApproved.length} events`);
  }
  if (needsReview.length > 0) {
    await base44.asServiceRole.entities.CommunityListing.bulkCreate(needsReview.map(({ _reason, ...r }) => r));
    console.log(`Sent to pending review: ${needsReview.length} events`);
  }
  if (autoApproved.length === 0 && needsReview.length === 0) {
    console.log('No new events to create');
  }

  // Daily summary email (only when something happened)
  const totalNew = autoApproved.length + needsReview.length;
  if (totalNew > 0) {
    const parts = [];
    if (autoApproved.length > 0) {
      parts.push(`✅ Auto-published (${autoApproved.length}):\n` +
        autoApproved.map(e => `- ${e.name} — ${e.event_date} (${e.nearest_town}, Co. ${e.county})`).join('\n'));
    }
    if (needsReview.length > 0) {
      parts.push(`🔎 Needs your review (${needsReview.length}):\n` +
        needsReview.map(e => `- ${e.name} — ${e.event_date} (${e.nearest_town}) [${e._reason}]`).join('\n') +
        `\n\nReview/approve here: https://community-hub.base44.app/admin (Pending Approval tab)`);
    }
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'mary@maryhayden.com',
        from_name: 'Community Hub',
        subject: `📅 ${totalNew} new What's On event${totalNew > 1 ? 's' : ''} (auto-published + review)`,
        body: parts.join('\n\n'),
      });
    } catch (err) {
      console.error('Failed to send events notification email:', err.message);
    }
  }

  return Response.json({
    created: totalNew,
    auto_approved: autoApproved.length,
    needs_review: needsReview.length,
    total_found: events.length,
  });
});
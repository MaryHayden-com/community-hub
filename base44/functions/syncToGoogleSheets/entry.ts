import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LISTING_TYPES = ["Business", "Club & Group", "Community Services", "Education", "What's On"];

const HEADERS = [
  "id", "name", "type", "status", "plan", "county", "nearest_town", "town",
  "description", "address", "phone", "email", "website", "facebook_url",
  "instagram_url", "linkedin_url", "contact_name", "owner_email",
  "subcategory_group", "subgroup", "category", "is_featured", "is_verified",
  "event_date", "event_time", "is_recurring", "recurring_type",
  "created_date", "updated_date"
];

function toRow(l) {
  return HEADERS.map(h => {
    const v = l[h];
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === 'boolean') return v ? "Yes" : "No";
    return v ?? "";
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    // 1. Fetch all approved listings (paginated)
    let allListings = [];
    let page = 0;
    const pageSize = 500;
    while (true) {
      const batch = await base44.asServiceRole.entities.CommunityListing.filter(
        { status: "approved" }, "-created_date", pageSize, page * pageSize
      );
      allListings = allListings.concat(batch);
      if (batch.length < pageSize) break;
      page++;
    }

    // 2. Group by type
    const byType = {};
    for (const type of LISTING_TYPES) {
      byType[type] = allListings.filter(l => l.type === type);
    }

    // 3. Create spreadsheet with one sheet per type
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: { title: `Community Hub Listings — ${new Date().toISOString().slice(0, 10)}` },
        sheets: LISTING_TYPES.map(t => ({ properties: { title: t } }))
      })
    });
    const sheet = await createRes.json();
    if (!sheet.spreadsheetId) {
      return Response.json({ error: "Failed to create spreadsheet", details: sheet }, { status: 500 });
    }

    const spreadsheetId = sheet.spreadsheetId;

    // 4. Write each tab
    const data = LISTING_TYPES.map(type => ({
      range: `'${type}'!A1`,
      values: [HEADERS, ...byType[type].map(toRow)]
    }));

    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ valueInputOption: "RAW", data })
      }
    );
    const writeData = await writeRes.json();
    if (writeData.error) {
      return Response.json({ error: "Failed to write data", details: writeData }, { status: 500 });
    }

    const counts = {};
    for (const type of LISTING_TYPES) counts[type] = byType[type].length;

    return Response.json({
      success: true,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      total: allListings.length,
      counts
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
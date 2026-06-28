import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const HEADERS = [
  "id", "name", "type", "status", "plan", "county", "nearest_town", "town",
  "description", "address", "phone", "email", "website", "facebook_url",
  "instagram_url", "linkedin_url", "contact_name", "owner_email",
  "subcategory_group", "subgroup", "category", "is_featured", "is_verified",
  "created_date", "updated_date"
];

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
        { status: "approved" },
        "-created_date",
        pageSize,
        page * pageSize
      );
      allListings = allListings.concat(batch);
      if (batch.length < pageSize) break;
      page++;
    }

    // 2. Build rows
    const rows = allListings.map(l => HEADERS.map(h => {
      const v = l[h];
      if (Array.isArray(v)) return v.join(", ");
      if (typeof v === 'boolean') return v ? "Yes" : "No";
      return v ?? "";
    }));

    // 3. Create a new spreadsheet
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: { title: `Community Hub Listings — ${new Date().toISOString().slice(0, 10)}` },
        sheets: [{ properties: { title: "Listings" } }]
      })
    });
    const sheet = await createRes.json();
    if (!sheet.spreadsheetId) {
      return Response.json({ error: "Failed to create spreadsheet", details: sheet }, { status: 500 });
    }

    const spreadsheetId = sheet.spreadsheetId;

    // 4. Write header + data
    const values = [HEADERS, ...rows];
    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Listings!A1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values })
      }
    );
    const writeData = await writeRes.json();
    if (writeData.error) {
      return Response.json({ error: "Failed to write data", details: writeData }, { status: 500 });
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    return Response.json({ success: true, spreadsheetUrl, count: allListings.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
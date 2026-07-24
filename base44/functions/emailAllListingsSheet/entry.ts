import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { SHEET_HEADERS, listingToRow } from '../../shared/listingSheet.ts';

// Authorises the scheduled automation (no user context) to run this endpoint.
const SCHEDULER_TOKEN = 'chEvSched_9f3c7a1e4d8b';

const LISTING_TYPES = ["Business", "Club & Group", "Community Services", "Education", "What's On"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    const isAdmin = user && user.role === "admin";
    if (!isAdmin && body?.scheduler_token !== SCHEDULER_TOKEN) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    // 1. Fetch ALL listings (every status), paginated.
    let allListings: any[] = [];
    let page = 0;
    const pageSize = 500;
    while (true) {
      const batch = await base44.asServiceRole.entities.CommunityListing.list("-created_date", pageSize, page * pageSize);
      allListings = allListings.concat(batch);
      if (batch.length < pageSize) break;
      page++;
    }

    // 2. Build a fresh spreadsheet (one tab per type) with all statuses + Status column.
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");
    const title = `Community Hub — All Listings ${new Date().toISOString().slice(0, 10)}`;
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: { title },
        sheets: LISTING_TYPES.map((t) => ({ properties: { title: t } })),
      }),
    });
    const sheet = await createRes.json();
    if (!sheet.spreadsheetId) {
      return Response.json({ error: "Failed to create spreadsheet", details: sheet }, { status: 500 });
    }
    const spreadsheetId = sheet.spreadsheetId;

    const byType: Record<string, any[]> = {};
    for (const type of LISTING_TYPES) byType[type] = allListings.filter((l) => l.type === type);

    const data = LISTING_TYPES.map((type) => ({
      range: `'${type}'!A1`,
      values: [SHEET_HEADERS, ...byType[type].map(listingToRow)],
    }));

    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ valueInputOption: "RAW", data }),
      }
    );
    const writeData = await writeRes.json();
    if (writeData.error) {
      return Response.json({ error: "Failed to write data", details: writeData }, { status: 500 });
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    const counts: Record<string, number> = {};
    for (const type of LISTING_TYPES) counts[type] = byType[type].length;
    const pending = allListings.filter((l) => l.status === "pending").length;
    const approved = allListings.filter((l) => l.status === "approved").length;

    // 3. Email Mary a link to the spreadsheet (SendEmail can't attach files, so a link is used).
    const byTypeLines = LISTING_TYPES.map((t) => `- ${t}: ${counts[t]}`).join("\n");
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "mary@maryhayden.com",
      from_name: "Community Hub",
      subject: `📋 All listings export — ${allListings.length} listings (${pending} pending)`,
      body:
        `Hi Mary,\n\nHere's your full Community Hub listings export for ${new Date().toISOString().slice(0, 10)}.\n\n` +
        `Total listings: ${allListings.length}\nApproved (live): ${approved}\nPending approval: ${pending}\n\n` +
        `By type:\n${byTypeLines}\n\n` +
        `Open the spreadsheet to review, approve and manage everything in one place:\n${spreadsheetUrl}\n\n` +
        `— Hub for Community`,
    });

    return Response.json({
      ok: true,
      total: allListings.length,
      approved,
      pending,
      spreadsheetUrl,
      counts,
    });
  } catch (error) {
    console.error("emailAllListingsSheet error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
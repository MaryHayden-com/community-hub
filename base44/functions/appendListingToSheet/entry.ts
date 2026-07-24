import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { listingToRow } from '../../shared/listingSheet.ts';

// Master approvals sheet. Default to the one created for this app; allow override via env.
const MASTER_SHEET_ID = Deno.env.get('GOOGLE_SHEETS_MASTER_ID') || '1iBGxTWcEfTGaA2S_J4ah0OteJ-gdBHFgKtiEoTJYmyU';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body || {};

    if (!data || event?.type !== 'create') {
      return Response.json({ ok: true, skipped: true });
    }

    // Auto-imports (daily national importer etc.) run as the service account.
    // Keep the approvals sheet focused on human submissions — skip those.
    const createdBy = String(data.created_by_id || '');
    if (createdBy.startsWith('service_')) {
      return Response.json({ ok: true, skipped: 'auto_import' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');
    const range = encodeURIComponent("'All Listings'!A1");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${MASTER_SHEET_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [listingToRow(data)] }),
    });
    const j = await res.json();
    if (!res.ok) {
      console.error('appendListingToSheet sheets error:', JSON.stringify(j));
      return Response.json({ error: 'sheets append failed', details: j }, { status: 500 });
    }

    return Response.json({ ok: true, appended: true, name: data.name });
  } catch (error) {
    console.error('appendListingToSheet error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
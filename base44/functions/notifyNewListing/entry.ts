import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data } = body;

    if (event?.type !== 'create') {
      return Response.json({ ok: true, skipped: true });
    }

    const listing = data;
    const name = listing?.name || 'Unnamed listing';
    const type = listing?.type || 'Unknown';
    const town = listing?.town || '';
    const county = listing?.county || '';
    const createdBy = listing?.created_by || 'Unknown';
    const location = [town, county].filter(Boolean).join(', ');

    const link = 'https://hub4community.com/admin#pending';
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
        <div style="background:#097275;padding:18px 24px;border-radius:8px 8px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:18px;">New listing awaiting approval</h1>
          <p style="color:#cfe9ea;margin:4px 0 0;font-size:12px;">Community Hub</p>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">
          <p style="margin-top:0;">A new listing has been submitted and is awaiting your approval:</p>
          <table style="width:100%;font-size:14px;border-collapse:collapse;margin:6px 0 16px;">
            <tr><td style="padding:4px 0;color:#6b7280;width:130px;">Name</td><td style="font-weight:600;">${name}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Type</td><td>${type}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Location</td><td>${location}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Submitted by</td><td>${createdBy}</td></tr>
          </table>
          <a href="${link}" style="display:inline-block;background:#E2701B;color:#fff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Review & approve &rarr;</a>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af;">This opens the Pending Approval tab in your admin panel.</p>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'communitywhatson@gmail.com',
      from_name: 'Community Hub',
      subject: `New listing awaiting approval: ${name}`,
      body: html,
    });

    console.log(`[notifyNewListing] Email sent for new listing: ${name}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[notifyNewListing] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
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

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'mary@maryhayden.com',
      from_name: 'Community Hub',
      subject: `New listing awaiting approval: ${name}`,
      body: `A new listing has been submitted and is awaiting your approval.\n\n` +
        `Name: ${name}\n` +
        `Type: ${type}\n` +
        `Location: ${location}\n` +
        `Submitted by: ${createdBy}\n\n` +
        `👉 Review and approve it here: https://community-hub.base44.app/admin\n` +
        `(Go to the "Pending Approval" tab)`
    });

    console.log(`[notifyNewListing] Email sent for new listing: ${name}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[notifyNewListing] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
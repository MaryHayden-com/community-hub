import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// HTML-entity escape untrusted values before interpolating into email HTML.
function esc(v: any): string {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const listing = body.data;
    if (!listing || listing.type !== "What's On") return Response.json({ ok: true });

    const submitterEmail = listing.email || listing.owner_email;
    const isPending = listing.status === "pending";

    const eventDateLine = listing.event_date
      ? `\nDate: ${new Date(listing.event_date + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
      : "";

    // 1. Always email the submitter a confirmation
    if (submitterEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: submitterEmail,
        from_name: "Hub for Community",
        subject: `✅ We received your event: ${listing.name}`,
        body: `Hi ${listing.contact_name || "there"},

Thanks for submitting your event to Hub for Community!

Event: ${listing.name}
Location: ${listing.town}, Co. ${listing.county}${eventDateLine}

${isPending
  ? "Your event is pending approval from the listing owner. You should hear back within 24 hours."
  : "Your event is now live and visible on the What's On calendar."
}

Thanks,
The Community Hub Team
https://hub4community.com`,
      });
    }

    // 2. If pending and linked to a parent listing, notify that listing's owner
    if (isPending && listing.parent_listing_id) {
      const parentListing = await base44.asServiceRole.entities.CommunityListing.get(listing.parent_listing_id);
      const ownerEmail = parentListing?.owner_email;

      if (ownerEmail) {
        const adminLink = `https://hub4community.com/admin#whatson`;
        const ownerHtml = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
            <div style="background:#097275;padding:18px 24px;border-radius:8px 8px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:18px;">📅 New event awaiting your approval</h1>
              <p style="color:#cfe9ea;margin:4px 0 0;font-size:12px;">Hub for Community</p>
            </div>
            <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">
              <p style="margin-top:0;">Hi ${esc(parentListing.contact_name) || "there"},</p>
              <p>A new event has been submitted for your listing <strong>"${esc(parentListing.name)}"</strong> and is awaiting your approval.</p>
              <table style="width:100%;font-size:14px;border-collapse:collapse;margin:6px 0 16px;">
                <tr><td style="padding:4px 0;color:#6b7280;width:130px;">Event</td><td style="font-weight:600;">${esc(listing.name)}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280;">Submitted by</td><td>${esc(listing.contact_name) || "Anonymous"}${listing.email ? ` (${esc(listing.email)})` : ""}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280;">Location</td><td>${esc(listing.town)}, Co. ${esc(listing.county)}</td></tr>
              </table>
              <a href="${adminLink}" style="display:inline-block;background:#E2701B;color:#fff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Review & approve &rarr;</a>
              <p style="margin-top:16px;font-size:12px;color:#9ca3af;">This opens the What's On tab in your admin panel.</p>
            </div>
          </div>
        `;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          from_name: "Hub for Community",
          subject: `📅 New event awaiting your approval: ${listing.name}`,
          body: ownerHtml,
        });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("notifyEventSubmission error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
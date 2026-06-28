import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
The Hub for Community Team
https://localcommunityhub.ie`,
      });
    }

    // 2. If pending and linked to a parent listing, notify that listing's owner
    if (isPending && listing.parent_listing_id) {
      const parentListing = await base44.asServiceRole.entities.CommunityListing.get(listing.parent_listing_id);
      const ownerEmail = parentListing?.owner_email;

      if (ownerEmail) {
        const adminLink = `https://localcommunityhub.ie/admin#stream`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          from_name: "Hub for Community",
          subject: `📅 New event awaiting your approval: ${listing.name}`,
          body: `Hi ${parentListing.contact_name || "there"},

A new event has been submitted for your listing "${parentListing.name}" and is awaiting your approval.

Event: ${listing.name}
Submitted by: ${listing.contact_name || "Anonymous"}${listing.email ? ` (${listing.email})` : ""}
Location: ${listing.town}, Co. ${listing.county}${eventDateLine}
${listing.description ? `\nDescription: ${listing.description}\n` : ""}
You can review and approve this event from your admin panel:
${adminLink}

Thanks,
The Hub for Community Team`,
        });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("notifyEventSubmission error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
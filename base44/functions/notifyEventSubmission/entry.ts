import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const listing = body.data;
    if (!listing || listing.type !== "What's On") return Response.json({ ok: true });

    const submitterEmail = listing.email || listing.owner_email;
    const isPending = listing.status === "pending";
    const isApproved = listing.status === "approved";

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
  ? "Your event is pending approval from the local listing owner. You should hear back within 24 hours."
  : "Your event is now live and visible on the What's On calendar."
}

Thanks,
The Hub for Community Team
https://localcommunityhub.ie`,
      });
    }

    // 2. If pending (public submission), find a paid listing owner for this area and notify them
    if (isPending) {
      // Look for a paid directory listing in the same town/county to find the owner to notify
      const localListings = await base44.asServiceRole.entities.CommunityListing.filter({
        county: listing.county,
        plan_status: "active",
      });

      // Prefer same town, fallback to any paid listing in the county
      const matchedOwner = localListings.find(l =>
        (l.plan === "standard" || l.plan === "premium") &&
        l.plan_status === "active" &&
        l.owner_email &&
        l.type !== "What's On" &&
        (l.town === listing.town || l.nearest_town === listing.town)
      ) || localListings.find(l =>
        (l.plan === "standard" || l.plan === "premium") &&
        l.plan_status === "active" &&
        l.owner_email &&
        l.type !== "What's On"
      );

      if (matchedOwner?.owner_email) {
        const adminLink = `https://localcommunityhub.ie/admin#stream`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: matchedOwner.owner_email,
          from_name: "Hub for Community",
          subject: `📅 New event awaiting your approval: ${listing.name}`,
          body: `Hi ${matchedOwner.contact_name || "there"},

A new community event has been submitted for ${listing.town}, Co. ${listing.county} and is awaiting approval.

Event: ${listing.name}
Submitted by: ${listing.contact_name || "Anonymous"}${listing.email ? ` (${listing.email})` : ""}
Location: ${listing.town}, Co. ${listing.county}${eventDateLine}
${listing.description ? `\nDescription: ${listing.description}\n` : ""}
As a local listing holder, you can review and approve this event from your admin panel:
${adminLink}

If this event looks good for your community, please approve it so it appears on the What's On calendar.

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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Triggered by entity automation on CommunityListing create
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const listing = body.data;
    if (!listing) return Response.json({ ok: true });

    const submitterEmail = listing.email || listing.owner_email;
    if (!submitterEmail) return Response.json({ ok: true, skipped: "no email" });

    const typeLine = listing.type === "What's On"
      ? `Event: ${listing.name}`
      : `Listing: ${listing.name}`;

    const eventDateLine = listing.event_date
      ? `\nDate: ${new Date(listing.event_date + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
      : "";

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: submitterEmail,
      from_name: "Local Community Hub",
      subject: `✅ We received your submission: ${listing.name}`,
      body: `Hi ${listing.contact_name || "there"},

Thanks for submitting to Local Community Hub!

${typeLine}
Location: ${listing.town}, Co. ${listing.county}${eventDateLine}

Your submission is now pending review. We aim to have it live within 24 hours. Once approved, it will appear in the directory for everyone in your area to find.

If you have any questions, just reply to this email.

Thanks,
The Local Community Hub Team
https://localcommunityhub.ie`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("notifyEventSubmission error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
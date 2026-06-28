import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { listing_id, test_email } = await req.json();

    let listingsToInvite = [];

    if (listing_id) {
      // Send to a specific listing
      const listing = await base44.asServiceRole.entities.CommunityListing.get(listing_id);
      if (listing) listingsToInvite = [listing];
    } else if (test_email) {
      // Test mode: send a sample to the provided email
      listingsToInvite = [{
        id: 'test',
        name: 'Your Business Name',
        type: 'Business',
        owner_email: test_email,
        town: 'Bandon',
        county: 'Cork',
      }];
    } else {
      // Send to all unverified listings with owner emails
      const all = await base44.asServiceRole.entities.CommunityListing.filter({ is_verified: false });
      listingsToInvite = all.filter(l => l.owner_email);
    }

    const appUrl = 'https://hub4community.ie';
    const results = [];

    for (const listing of listingsToInvite) {
      const claimUrl = `${appUrl}/listing/${listing.id}`;
      const dashboardUrl = `${appUrl}/dashboard`;
      const privacyUrl = `${appUrl}/privacy`;

      const subject = `Your ${listing.name || listing.town || 'local'} listing is live on Hub for Community 🎉`;

      const body = `
Hi there,

Great news — **${listing.name}** is now listed on **Hub for Community**, Bandon's new community directory and events hub.

🔗 **Your listing is already live:**
${claimUrl}

---

**Why claim your listing?**

✓ Update your details (phone, address, website, hours)
✓ Add photos to showcase your business
✓ Post events directly to the "What's On" calendar
✓ See how many people view and interact with your listing
✓ Connect with customers right in your community

**It's 100% free to claim and manage.**

👉 **Claim your listing here:** ${claimUrl}

Once you claim it, you'll have full control to keep everything up to date.

---

Hub for Community is built for Bandon, by Bandon — helping local businesses, clubs, and community groups get discovered online.

If you have any questions or would like help updating your listing, just reply to this email.

Best regards,
The Hub for Community Team

---
*You're receiving this because your business appears in the Bandon community directory. If you'd like your listing removed, please reply to this email or visit ${privacyUrl}.*
      `.trim();

      try {
        await base44.integrations.Core.SendEmail({
          from_name: 'Hub for Community',
          to: listing.owner_email,
          subject,
          body,
        });
        results.push({ name: listing.name, email: listing.owner_email, sent: true });
      } catch (emailError) {
        results.push({ name: listing.name, email: listing.owner_email, sent: false, error: emailError.message });
      }
    }

    return Response.json({
      total: listingsToInvite.length,
      sent: results.filter(r => r.sent).length,
      failed: results.filter(r => !r.sent).length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
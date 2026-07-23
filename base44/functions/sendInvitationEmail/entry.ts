import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildEmailHtml({ name, firstName, town, claimUrl, appUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your listing is live on Community Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#097275;padding:28px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle;padding-right:16px;">
                    <img src="https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/e27af7809_generated_image.png" alt="Community Hub Logo" width="56" height="56" style="border-radius:10px;display:block;" />
                  </td>
                  <td style="vertical-align:middle;text-align:left;">
                    <h1 style="color:#ffffff;margin:0 0 1px 0;font-size:26px;font-weight:bold;letter-spacing:0.5px;line-height:1.1;">Community Hub</h1>
                    <p style="color:#a8d8da;margin:0;font-size:15px;font-weight:500;line-height:1.1;letter-spacing:0.3px;">${town}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 30px 40px;">
              <p style="margin:0 0 20px 0;font-size:16px;color:#333333;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;color:#333333;line-height:1.6;">
                Great news — <strong>${name}</strong> is now listed on <strong>Community Hub</strong>, Bandon's new community directory and events hub.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="background-color:#E2701B;border-radius:6px;padding:0;">
                    <a href="${claimUrl}" style="display:inline-block;padding:14px 30px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;">
                      View &amp; Claim Your Listing →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:16px;color:#333333;line-height:1.6;">
                Once you claim it, you can:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                <tr><td style="padding:5px 0;font-size:15px;color:#444444;">✓&nbsp;&nbsp;Update your details (phone, address, website)</td></tr>
                <tr><td style="padding:5px 0;font-size:15px;color:#444444;">✓&nbsp;&nbsp;Add photos to showcase your business</td></tr>
                <tr><td style="padding:5px 0;font-size:15px;color:#444444;">✓&nbsp;&nbsp;Post events to the "What's On" calendar</td></tr>
                <tr><td style="padding:5px 0;font-size:15px;color:#444444;">✓&nbsp;&nbsp;See how many people view your listing</td></tr>
                <tr><td style="padding:5px 0;font-size:15px;color:#444444;">✓&nbsp;&nbsp;Connect directly with local customers</td></tr>
              </table>

              <p style="margin:0 0 20px 0;font-size:16px;color:#333333;line-height:1.6;">
                <strong>It's 100% free to claim and manage.</strong>
              </p>

              <hr style="border:none;border-top:1px solid #e8e8e8;margin:30px 0;">

              <p style="margin:0 0 20px 0;font-size:15px;color:#555555;line-height:1.6;">
                Community Hub is built for Bandon, by Bandon — helping local businesses, clubs, and community groups get discovered online.
              </p>

              <p style="margin:0 0 20px 0;font-size:15px;color:#555555;line-height:1.6;">
                If you have any questions or would like help updating your listing, just reply to this email — we're always happy to help.
              </p>

              <p style="margin:0;font-size:15px;color:#555555;line-height:1.6;">
                Best regards,<br>
                <img src="https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/e27af7809_generated_image.png" alt="Community Hub Logo" width="36" height="36" style="border-radius:6px;vertical-align:middle;margin-right:8px;display:inline-block;" />
                <strong style="vertical-align:middle;">The Community Hub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8f8;padding:24px 40px;border-top:1px solid #e8e8e8;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#999999;line-height:1.6;text-align:center;">
                You're receiving this because your business appears in the Bandon community directory.
              </p>
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;text-align:center;">
                If you'd like your listing removed, please reply to this email or visit
                <a href="${appUrl}/privacy" style="color:#097275;text-decoration:none;">our privacy page</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { listing_id, test_email } = await req.json();
    // Derive the live app URL from the request so the claim link always points to wherever the app is actually hosted
    const origin = req.headers.get('origin') || req.headers.get('referer');
    const appUrl = origin ? origin.replace(/\/$/, '').split('/').slice(0, 3).join('/') : 'https://hub4community.com';

    let listingsToInvite = [];

    if (listing_id) {
      const listing = await base44.asServiceRole.entities.CommunityListing.get(listing_id);
      if (listing) listingsToInvite = [listing];
    } else if (test_email) {
      listingsToInvite = [{
        id: '69db8b146dfd6d26f1d45a63',
        name: 'Mary Hayden Business Consulting',
        contact_name: 'Mary Hayden',
        owner_email: test_email,
        town: 'Bandon',
        county: 'Cork',
      }];
    } else {
      const all = await base44.asServiceRole.entities.CommunityListing.filter({ is_verified: false });
      listingsToInvite = all.filter(l => l.owner_email);
    }

    const results = [];

    for (const listing of listingsToInvite) {
      const claimUrl = `${appUrl}/listing/${listing.id}`;

      // Extract first name from contact_name or listing name
      const contactName = listing.contact_name || listing.name || '';
      const firstName = contactName.split(' ')[0] || 'there';

      const subject = `Your listing is live on Community Hub, ${firstName} 🎉 — Discover the businesses, clubs, schools and events that bring your community together.`;

      const html = buildEmailHtml({
        name: listing.name,
        firstName,
        town: listing.nearest_town || listing.town || listing.county || 'Ireland',
        claimUrl,
        appUrl,
      });

      try {
        await base44.integrations.Core.SendEmail({
          from_name: 'Community Hub',
          to: listing.owner_email,
          subject,
          body: html,
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
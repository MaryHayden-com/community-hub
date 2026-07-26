import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStr = lastWeek.toISOString().slice(0, 10);

    // Get all paid listings with owner emails
    const allListings = await base44.asServiceRole.entities.CommunityListing.filter({
      plan: ['standard', 'premium'],
      plan_status: 'active',
    });

    const listingsWithOwners = allListings.filter(l => l.owner_email && l.id);

    const results = [];

    for (const listing of listingsWithOwners) {
      // Get engagement in last 7 days
      const engagement = await base44.asServiceRole.entities.ListingEngagement.filter({
        listing_id: listing.id,
      });

      const recentEngagement = engagement.filter(e => {
        const eventDate = new Date(e.created_date);
        return eventDate >= lastWeek;
      });

      const views = recentEngagement.filter(e => e.event_type === 'view').length;
      const phoneClicks = recentEngagement.filter(e => e.event_type === 'phone_click').length;
      const websiteClicks = recentEngagement.filter(e => e.event_type === 'website_click').length;
      const emailClicks = recentEngagement.filter(e => e.event_type === 'email_click').length;

      // Get saved listings count
      const savedCount = await base44.asServiceRole.entities.SavedListing.filter({
        listing_id: listing.id,
      }).then(lists => lists.length);

      // Get event attendance for What's On
      let attendanceCount = 0;
      let newAttendanceCount = 0;
      let attendanceText = '';
      if (listing.type === "What's On") {
        const allAttendance = await base44.asServiceRole.entities.EventAttendance.filter({
          listing_id: listing.id,
          attending: true,
        });
        attendanceCount = allAttendance.length;
        // Count new RSVPs this week
        newAttendanceCount = allAttendance.filter(a => {
          const rsvpDate = new Date(a.created_date);
          return rsvpDate >= lastWeek;
        }).length;
        if (attendanceCount > 0) {
          attendanceText = `${attendanceCount} people marked themselves as going`;
          if (newAttendanceCount > 0) {
            attendanceText += ` (${newAttendanceCount} new this week)`;
          }
        } else {
          attendanceText = 'No attendees yet';
        }
      }

      // Only send if there's meaningful activity
      const totalEngagement = views + phoneClicks + websiteClicks + emailClicks;
      if (totalEngagement === 0 && attendanceCount === 0 && savedCount === 0) continue;

      // Build email
      const subject = `Your weekly ${listing.name} engagement report`;
      const body = `
Hi there,

Here's your weekly engagement report for **${listing.name}** (${lastWeekStr} to ${now.toISOString().slice(0, 10)}):

📊 **This Week's Activity:**
- Profile Views: ${views}
- Phone Clicks: ${phoneClicks}
- Website Visits: ${websiteClicks}
- Email Clicks: ${emailClicks}
- Times Saved: ${savedCount}
${listing.type === "What's On" ? `\n🎉 **Event Update:**\n- Total RSVPs: ${attendanceCount}\n${newAttendanceCount > 0 ? `- New This Week: ${newAttendanceCount}\n` : ''}` : ''}

${totalEngagement > 0 || savedCount > 0 ? `That's ${totalEngagement + savedCount} interactions with your listing this week!` : ''}

👉 **View your full dashboard:** ${process.env.BASE44_APP_URL || 'https://hub4community.com'}/dashboard

Keep your listing fresh and engaging to attract more visitors!

Best regards,
Hub4Community Team
      `.trim();

      try {
        await base44.integrations.Core.SendEmail({
          to: listing.owner_email,
          from_name: "Hub4Community",
          subject,
          body,
        });
        results.push({ listing_id: listing.id, email: listing.owner_email, sent: true });
      } catch (emailError) {
        results.push({ listing_id: listing.id, email: listing.owner_email, sent: false, error: emailError.message });
      }
    }

    return Response.json({
      total_listings: listingsWithOwners.length,
      emails_sent: results.filter(r => r.sent).length,
      emails_failed: results.filter(r => !r.sent).length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
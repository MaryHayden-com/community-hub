import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Token that authorises the scheduled automation (no user context) to run this endpoint.
const SCHEDULER_TOKEN = 'secScan_5e3a9c1b7f2d';
// Where the email button should land (open the Base44 builder).
const SCAN_LINK = 'https://base44.com';
const LOGO_URL =
  'https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/e27af7809_generated_image.png';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    // A legitimate scheduled run carries the shared token (no user); an admin may also call directly.
    // Any anonymous request lacking the token is rejected.
    const isScheduler = body?.scheduler_token === SCHEDULER_TOKEN;
    const isAdmin = !!user && user.role === 'admin';
    if (!isScheduler && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch every admin user so the reminder lands with the people who can act on it.
    const users = await base44.asServiceRole.entities.User.list('', 1000);
    const admins = users.filter((u: any) => u.role === 'admin' && u.email);

    if (admins.length === 0) {
      return Response.json({ sent: 0, message: 'No admin users found' });
    }

    const subject = 'Weekly reminder: run your Community Hub security scan';

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
        <div style="background:#097275;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:12px;">
          <img src="${LOGO_URL}" alt="Hub for Community" style="width:40px;height:40px;border-radius:10px;background:#fff;padding:2px;" />
          <div>
            <h1 style="color:#fff;margin:0;font-size:20px;">Hub for Community</h1>
            <p style="color:#cfe9ea;margin:2px 0 0;font-size:12px;">Security status check</p>
          </div>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">
          <p style="margin-top:0;">Hi,</p>
          <p>It's your weekly nudge to keep your app's security status up to date. Base44 doesn't run the scan automatically, so a quick manual check each week keeps your directory protected.</p>

          <p style="font-weight:600;">Here's the 30-second drill:</p>
          <ol style="margin:8px 0 16px 18px;padding:0;line-height:1.6;">
            <li>Open your app in the Base44 builder.</li>
            <li>Go to <strong>Dashboard &rarr; Security</strong>.</li>
            <li>Click <strong>Run Security Scan</strong>.</li>
            <li>Review anything flagged and hit <strong>Fix all issues</strong> (or fix individually).</li>
          </ol>

          <a href="${SCAN_LINK}"
             style="display:inline-block;background:#E2701B;color:#fff;padding:13px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
            Open Base44 &rarr;
          </a>

          <p style="margin-top:20px;font-size:13px;color:#6b7280;">
            Tip: re-run the scan after adding new entities, changing permissions, or connecting new integrations.
          </p>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
            You're receiving this because you're an admin on Hub for Community.
          </p>
        </div>
      </div>
    `;

    let sent = 0;
    const errors = [];

    for (const admin of admins) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject,
          body: html,
          from_name: 'Hub for Community',
        });
        sent++;
      } catch (err) {
        errors.push({ email: admin.email, error: err.message });
      }
    }

    return Response.json({ sent, total_admins: admins.length, errors });
  } catch (error) {
    console.error('sendSecurityScanReminder error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
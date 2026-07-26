import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Token that authorises the scheduled automation (no user context) to run this endpoint.
const SCHEDULER_TOKEN = 'actRem_7c2e9b1f4d6a';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}

    // A legitimate scheduled run carries the shared token (no user); an admin may also call directly.
    // Any anonymous request lacking the token is rejected.
    let body: any = {};
    try { body = await req.json(); } catch {}
    const isScheduler = body?.scheduler_token === SCHEDULER_TOKEN;
    const isAdmin = !!user && user.role === 'admin';
    if (!isScheduler && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Fetch all pending actions with a due date
    const allActions = await base44.asServiceRole.entities.ListingAction.list('-due_date', 2000);

    const dueActions = allActions.filter((a) => {
      if (a.is_done) return false;
      if (!a.due_date) return false;
      return a.due_date <= today;
    });

    if (dueActions.length === 0) {
      console.log('No due actions found, nothing to send.');
      return Response.json({ sent: 0, message: 'No due actions' });
    }

    // Group by recipient (assigned_to, or fall back to created_by)
    const byRecipient = {};
    for (const action of dueActions) {
      const recipient = action.assigned_to || action.created_by;
      if (!recipient) continue;
      if (!byRecipient[recipient]) byRecipient[recipient] = [];
      byRecipient[recipient].push(action);
    }

    let sent = 0;
    const errors = [];

    for (const [email, actions] of Object.entries(byRecipient)) {
      const overdue = actions.filter((a) => a.due_date < today);
      const dueToday = actions.filter((a) => a.due_date === today);

      const rows = actions
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
        .map((a) => {
          const label = a.due_date < today ? '🔴 OVERDUE' : '🟡 TODAY';
          return `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${label}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${a.listing_name || 'Unknown Listing'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${a.action_type.replace(/_/g, ' ')}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${a.note || '—'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${a.due_date}</td>
          </tr>`;
        })
        .join('');

      const subject = overdue.length > 0
        ? `⚠️ ${overdue.length} overdue action${overdue.length > 1 ? 's' : ''} need your attention`
        : `📋 You have ${dueToday.length} action${dueToday.length > 1 ? 's' : ''} due today`;

      const body = `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#111;">
          <div style="background:#166534;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Community Hub — Action Reminders</h1>
          </div>
          <div style="background:#f9fafb;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none;">
            <p style="margin-top:0;">Hi,</p>
            <p>You have <strong>${actions.length} listing action${actions.length > 1 ? 's' : ''}</strong> that ${actions.length > 1 ? 'are' : 'is'} due or overdue:</p>

            <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;font-size:14px;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Status</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Listing</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Type</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Note</th>
                  <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Due</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>

            <p style="margin-top:16px;">Log in to the admin panel to review and mark these as done.</p>
            <a href="https://communityhub.ie/admin#stream" style="display:inline-block;background:#166534;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:4px;">Open Admin Panel → Action Stream</a>

            <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
              You are receiving this because you are assigned to these actions in Community Hub.
            </p>
          </div>
        </div>
      `;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: "Community Hub",
          subject,
          body,
        });
        console.log(`Sent reminder to ${email} (${actions.length} actions)`);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err.message);
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({
      sent,
      total_due: dueActions.length,
      recipients: Object.keys(byRecipient).length,
      errors,
    });

  } catch (error) {
    console.error('sendActionReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
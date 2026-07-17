import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_ROLES = ['admin', 'group_admin', 'listing_owner', 'user'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let caller = null;
    try { caller = await base44.auth.me(); } catch (_) {}
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let body;
    try { body = await req.json(); } catch (_) { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const { user_id, role, managed_tags } = body || {};
    if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });
    if (!ALLOWED_ROLES.includes(role)) return Response.json({ error: 'Invalid role' }, { status: 400 });

    const tags = role === 'group_admin' ? (Array.isArray(managed_tags) ? managed_tags : []) : [];
    await base44.asServiceRole.entities.User.update(user_id, { role, managed_tags: tags });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Get the 5 most recent messages
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
      { headers: authHeader }
    );
    const listData = await listRes.json();
    const messages = listData.messages || [];

    const results = [];
    for (const msg of messages) {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: authHeader }
      );
      const data = await res.json();
      const headers = data.payload?.headers || [];
      const get = (name) => headers.find(h => h.name === name)?.value || '';
      results.push({
        id: msg.id,
        from: get('From'),
        subject: get('Subject'),
        date: get('Date'),
        internalDate: data.internalDate,
      });
    }

    return Response.json({ messages: results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
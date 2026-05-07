import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function decodeBase64(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return atob(base64);
  } catch {
    return '';
  }
}

function extractBody(payload) {
  if (!payload) return '';
  // Direct body
  if (payload.body?.data) return decodeBase64(payload.body.data);
  // Multipart
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64(part.body.data);
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) return decodeBase64(part.body.data);
    }
    // nested multipart
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  return '';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
      { headers: authHeader }
    );
    const listData = await listRes.json();
    const messages = listData.messages || [];

    const results = [];
    for (const msg of messages) {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: authHeader }
      );
      const data = await res.json();
      const headers = data.payload?.headers || [];
      const get = (name) => headers.find(h => h.name === name)?.value || '';
      const body = extractBody(data.payload);
      results.push({
        id: msg.id,
        from: get('From'),
        subject: get('Subject'),
        date: get('Date'),
        body: body.slice(0, 3000), // trim to avoid huge responses
      });
    }

    return Response.json({ messages: results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
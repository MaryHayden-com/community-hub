import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const messageIds = body.data?.new_message_ids ?? [];
    console.log(`Processing ${messageIds.length} new message(s)`);

    if (messageIds.length === 0) {
      return Response.json({ message: 'No new messages to process' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    const results = [];

    for (const messageId of messageIds) {
      console.log(`Fetching message: ${messageId}`);

      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: authHeader }
      );

      if (!res.ok) {
        console.error(`Failed to fetch message ${messageId}: ${res.status}`);
        continue;
      }

      const message = await res.json();
      const headers = message.payload?.headers ?? [];
      const subject = headers.find(h => h.name === 'Subject')?.value ?? '(no subject)';
      const from = headers.find(h => h.name === 'From')?.value ?? '';

      console.log(`Email from: ${from}, subject: ${subject}`);

      // Extract email body text
      let bodyText = '';
      const parts = message.payload?.parts ?? [];

      function extractText(parts) {
        for (const part of parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')) + '\n';
          }
          if (part.parts) extractText(part.parts);
        }
      }

      if (message.payload?.body?.data) {
        bodyText = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else {
        extractText(parts);
      }

      // Find image attachments
      const imageAttachments = [];
      function findAttachments(parts) {
        for (const part of parts) {
          if (part.mimeType?.startsWith('image/') && part.body?.attachmentId) {
            imageAttachments.push({ attachmentId: part.body.attachmentId, mimeType: part.mimeType, filename: part.filename });
          }
          if (part.parts) findAttachments(part.parts);
        }
      }
      findAttachments(parts);

      console.log(`Found ${imageAttachments.length} image attachment(s)`);

      // Upload image attachments and get URLs
      const imageUrls = [];
      for (const att of imageAttachments) {
        const attRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${att.attachmentId}`,
          { headers: authHeader }
        );
        if (!attRes.ok) continue;
        const attData = await attRes.json();
        const base64Data = attData.data.replace(/-/g, '+').replace(/_/g, '/');
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const blob = new Blob([binaryData], { type: att.mimeType });
        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
        if (uploadResult?.file_url) {
          imageUrls.push(uploadResult.file_url);
          console.log(`Uploaded attachment: ${uploadResult.file_url}`);
        }
      }

      // Build prompt for AI extraction
      const prompt = `You are extracting event details from a community What's On flyer or email.

Email subject: ${subject}
Email body: ${bodyText}

Extract the following details and return as JSON. If a field cannot be determined, return null for it.
- name: Event name/title
- description: Full event description
- event_date: Start date in YYYY-MM-DD format (if mentioned)
- event_date_end: End date in YYYY-MM-DD format (if different from start, otherwise null)
- event_time: Time in HH:MM 24h format (if mentioned)
- town: Town or village where the event takes place
- county: County (default to "Cork" if in Ireland and not specified)
- address: Full address if mentioned
- phone: Contact phone number if mentioned
- email: Contact email if mentioned
- website: Website URL if mentioned
- facebook_url: Facebook URL if mentioned
- is_free: true if event is free, false if there's a cost, null if unknown
- is_recurring: true if this is a recurring event, false if one-off
- recurring_type: one of: daily, weekly, fortnightly, monthly_date, twice_monthly, monthly_weekday — only if is_recurring is true
- recurring_day: e.g. "Monday", "1st Tuesday" etc — only if is_recurring is true
- contact_name: Organiser/contact person name if mentioned

Return ONLY valid JSON, no explanation.`;

      const jsonSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          event_date: { type: "string" },
          event_date_end: { type: "string" },
          event_time: { type: "string" },
          town: { type: "string" },
          county: { type: "string" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          website: { type: "string" },
          facebook_url: { type: "string" },
          is_free: { type: "boolean" },
          is_recurring: { type: "boolean" },
          recurring_type: { type: "string" },
          recurring_day: { type: "string" },
          contact_name: { type: "string" }
        }
      };

      const extracted = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: jsonSchema,
        file_urls: imageUrls.length > 0 ? imageUrls : undefined,
        model: imageUrls.length > 0 ? 'claude_sonnet_4_6' : undefined
      });

      console.log('AI extracted:', JSON.stringify(extracted));

      if (!extracted?.name) {
        console.warn(`Could not extract event name from message ${messageId}, skipping`);
        continue;
      }

      // Create the listing as a What's On event (pending verification)
      const listingData = {
        type: "What's On",
        name: extracted.name,
        description: extracted.description || '',
        event_date: extracted.event_date || null,
        event_date_end: extracted.event_date_end || null,
        event_time: extracted.event_time || null,
        town: extracted.town || 'Bandon',
        county: extracted.county || 'Cork',
        country: 'Ireland',
        address: extracted.address || null,
        phone: extracted.phone || null,
        email: extracted.email || null,
        website: extracted.website || null,
        facebook_url: extracted.facebook_url || null,
        is_free: extracted.is_free ?? null,
        is_recurring: extracted.is_recurring ?? false,
        recurring_type: extracted.recurring_type || null,
        recurring_day: extracted.recurring_day || null,
        contact_name: extracted.contact_name || null,
        image_url: imageUrls[0] || null,
        is_verified: false,
        is_featured: false,
        owner_email: from.match(/[\w.+-]+@[\w-]+\.[a-z]+/i)?.[0] || null,
        subcategory_group: [],
        category: [],
        plan: 'basic',
        plan_status: 'active'
      };

      const created = await base44.asServiceRole.entities.CommunityListing.create(listingData);
      console.log(`Created listing: ${created.id} — ${created.name}`);

      results.push({ messageId, listingId: created.id, name: created.name });
    }

    return Response.json({ processed: results.length, listings: results });
  } catch (error) {
    console.error('processWhatsOnEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
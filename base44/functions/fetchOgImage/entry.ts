import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { urls } = await req.json();
    if (!urls || !urls.length) return Response.json({ image_url: null });

    for (const url of urls) {
      if (!url) continue;
      try {
        // For Facebook pages, try the graph API thumbnail approach
        if (url.includes('facebook.com')) {
          const match = url.match(/facebook\.com\/([^/?#]+)/);
          if (match && match[1] && match[1] !== 'pages') {
            const fbUrl = `https://graph.facebook.com/${match[1]}/picture?type=large&redirect=false`;
            const fbRes = await fetch(fbUrl);
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              if (fbData?.data?.url && !fbData?.data?.is_silhouette) {
                return Response.json({ image_url: fbData.data.url });
              }
            }
          }
        }

        // Fetch HTML and extract og:image
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IrishDirectory/1.0)' },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) continue;
        const html = await res.text();

        // Try og:image first
        const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (ogMatch) {
          let imgUrl = ogMatch[1];
          if (imgUrl.startsWith('/')) {
            const base = new URL(url);
            imgUrl = `${base.origin}${imgUrl}`;
          }
          return Response.json({ image_url: imgUrl });
        }

        // Try twitter:image
        const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
        if (twMatch) {
          let imgUrl = twMatch[1];
          if (imgUrl.startsWith('/')) {
            const base = new URL(url);
            imgUrl = `${base.origin}${imgUrl}`;
          }
          return Response.json({ image_url: imgUrl });
        }
      } catch (_) {
        // try next URL
      }
    }

    return Response.json({ image_url: null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Guard against SSRF: only http(s) URLs whose host is not a private/loopback/link-local address.
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.localhost') || h === 'metadata' || h === 'metadata.google.internal') return true;
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = parseInt(v4[1], 10), b = parseInt(v4[2], 10);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (h.includes(':')) {
    const v = h.replace(/^::ffff:/i, '');
    const mapped = v.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (mapped) return isBlockedHost(mapped[0]);
    if (v === '::' || v === '::1') return true;
    if (v.startsWith('fe80') || v.startsWith('fc') || v.startsWith('fd')) return true;
  }
  return false;
}

function safeUrl(raw: string): string | null {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (isBlockedHost(u.hostname)) return null;
  return u.href;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { dry_run = false, limit = 500 } = await req.json().catch(() => ({}));

    // Fetch all listings without images
    const all = await base44.asServiceRole.entities.CommunityListing.list('-created_date', limit);
    const needsImage = all.filter((l) => !l.image_url && (l.website || l.facebook_url || l.instagram_url));

    console.log(`Found ${needsImage.length} listings needing images (from ${all.length} total)`);

    if (dry_run) {
      return Response.json({ would_process: needsImage.length, listings: needsImage.map(l => ({ id: l.id, name: l.name })) });
    }

    let updated = 0;
    let failed = 0;
    const results = [];

    for (const listing of needsImage) {
      const urls = [listing.website, listing.facebook_url, listing.instagram_url].filter(Boolean).map(u => u.trim()).filter(u => u.startsWith('http'));
      let foundImage = null;

      for (const url of urls) {
        try {
          if (url.includes('facebook.com')) {
            const match = url.match(/facebook\.com\/([^/?#]+)/);
            if (match && match[1] && match[1] !== 'pages') {
              const fbRes = await fetch(`https://graph.facebook.com/${match[1]}/picture?type=large&redirect=false`);
              if (fbRes.ok) {
                const fbData = await fbRes.json();
                if (fbData?.data?.url && !fbData?.data?.is_silhouette) {
                  foundImage = fbData.data.url;
                  break;
                }
              }
            }
          }

          const safe = safeUrl(url);
          if (!safe) { console.log(`  Blocked unsafe URL: ${url}`); continue; }
          const res = await fetch(safe, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IrishDirectory/1.0)' },
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) continue;
          const html = await res.text();

          const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
          if (ogMatch) {
            let imgUrl = ogMatch[1];
            if (imgUrl.startsWith('/')) {
              imgUrl = `${new URL(url).origin}${imgUrl}`;
            }
            foundImage = imgUrl;
            break;
          }

          const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
          if (twMatch) {
            let imgUrl = twMatch[1];
            if (imgUrl.startsWith('/')) {
              imgUrl = `${new URL(url).origin}${imgUrl}`;
            }
            foundImage = imgUrl;
            break;
          }
        } catch (err) {
          console.log(`  Failed to fetch ${url}: ${err.message}`);
        }
      }

      // Fallback: try Clearbit logo API for websites
      if (!foundImage && listing.website) {
        try {
          const domain = new URL(listing.website.trim()).hostname.replace(/^www\./, '');
          const logoUrl = `https://logo.clearbit.com/${domain}`;
          const logoRes = await fetch(logoUrl, { signal: AbortSignal.timeout(5000) });
          if (logoRes.ok && logoRes.headers.get('content-type')?.startsWith('image/')) {
            foundImage = logoUrl;
          }
        } catch (_) {}
      }

      if (foundImage) {
        // Also normalise subcategory_group and category to arrays while we're updating
        const patch = { image_url: foundImage };
        if (listing.subcategory_group && !Array.isArray(listing.subcategory_group)) {
          patch.subcategory_group = [listing.subcategory_group];
        }
        if (listing.category && !Array.isArray(listing.category)) {
          patch.category = [listing.category];
        }
        await base44.asServiceRole.entities.CommunityListing.update(listing.id, patch);
        console.log(`✓ ${listing.name}: ${foundImage}`);
        results.push({ id: listing.id, name: listing.name, image_url: foundImage, status: 'updated' });
        updated++;
      } else {
        // Still normalise string fields even if no image found
        const migratePatch = {};
        if (listing.subcategory_group && !Array.isArray(listing.subcategory_group)) {
          migratePatch.subcategory_group = [listing.subcategory_group];
        }
        if (listing.category && !Array.isArray(listing.category)) {
          migratePatch.category = [listing.category];
        }
        if (Object.keys(migratePatch).length) {
          await base44.asServiceRole.entities.CommunityListing.update(listing.id, migratePatch);
        }
        console.log(`✗ ${listing.name}: no image found`);
        results.push({ id: listing.id, name: listing.name, status: 'not_found' });
        failed++;
      }
    }

    return Response.json({
      processed: needsImage.length,
      updated,
      failed,
      results,
    });
  } catch (error) {
    console.error('bulkFetchMissingImages error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
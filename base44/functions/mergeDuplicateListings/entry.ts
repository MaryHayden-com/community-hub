import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Normalise a name/town for duplicate comparison: lowercase, strip accents and
// all non-alphanumerics so "An Tobairin" / "An Tobairín" or "Atkins – Farm & Garden"
// / "Atkins Farm & Garden" collapse to the same key.
function norm(s: any): string {
  return (s ? String(s) : "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function nonEmpty(v: any): boolean {
  return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
}
function toArr(v: any): any[] {
  return Array.isArray(v) ? v : (v ? [v] : []);
}
function uniq(a: any[]): any[] {
  const out: any[] = [];
  for (const x of a) {
    if (x !== undefined && x !== null && x !== "" && !out.includes(x)) out.push(x);
  }
  return out;
}

const SCALAR_FIELDS = [
  "description", "address", "phone", "email", "website", "facebook_url",
  "instagram_url", "linkedin_url", "contact_name", "meeting_info", "image_url",
  "owner_email", "parent_listing_id", "area", "nearest_town", "event_date",
  "event_date_end", "event_time", "recurring_day", "recurring_type", "category_text",
];
const RICH_FIELDS = [
  "description", "address", "phone", "email", "website", "facebook_url",
  "instagram_url", "linkedin_url", "contact_name", "meeting_info", "image_url",
];
const PLAN_RANK: Record<string, number> = { premium: 3, standard: 2, basic: 1 };
const CHILD_ENTITIES = [
  "ListingReview", "ListingEngagement", "SavedListing", "EventAttendance",
  "ListingNotice", "ClaimRequest", "ListingAction",
];

function richness(l: any): number {
  let r = 0;
  for (const f of RICH_FIELDS) if (nonEmpty(l[f])) r += 1;
  r += toArr(l.category).length + toArr(l.subgroup).length + toArr(l.subcategory_group).length;
  if (l.status === "approved") r += 5;
  if (l.is_featured) r += 2;
  if (l.is_verified) r += 2;
  return r;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({})) as any;
    const dryRun = body.dryRun !== false; // safe by default

    const all = await base44.asServiceRole.entities.CommunityListing.filter(
      { status: { $ne: "rejected" } },
      "name",
      2000
    ) as any[];

    // Group by normalised name + normalised town/county
    const byKey = new Map<string, any[]>();
    for (const l of all) {
      const townPart = norm(l.town || l.nearest_town || l.area || l.county);
      const key = norm(l.name) + "||" + townPart;
      const arr = byKey.get(key) || [];
      arr.push(l);
      byKey.set(key, arr);
    }
    const clusters = [...byKey.values()].filter((g) => g.length >= 2);

    const plan: any[] = [];
    for (const g of clusters) {
      const sorted = g.slice().sort(
        (a, b) => richness(b) - richness(a) || String(b.updated_date || "").localeCompare(String(a.updated_date || ""))
      );
      const keep = sorted[0];
      const dups = sorted.slice(1).map((l) => l.id);
      plan.push({ keepId: keep.id, keepName: keep.name, dups, town: keep.town, county: keep.county });
    }

    if (dryRun) {
      return Response.json({
        dryRun: true,
        clusters: clusters.length,
        recordsToRemove: plan.reduce((s, p) => s + p.dups.length, 0),
        examples: plan.slice(0, 30).map((p) => ({ keep: p.keepName, town: p.town, county: p.county, duplicateIds: p.dups.length })),
      });
    }

    // ── Execute ──
    let totalRemoved = 0;
    const byId = new Map<string, any>(all.map((l) => [l.id, l]));

    for (const p of plan) {
      const keep = byId.get(p.keepId);
      if (!keep) continue;
      const dupsList = p.dups.map((id: string) => byId.get(id)).filter(Boolean) as any[];
      const orderedDups = dupsList.slice().sort(
        (a, b) => String(b.updated_date || "").localeCompare(String(a.updated_date || ""))
      );

      const update: any = {};
      for (const f of SCALAR_FIELDS) {
        if (!nonEmpty(keep[f])) {
          for (const d of orderedDups) {
            if (nonEmpty(d[f])) { update[f] = d[f]; break; }
          }
        }
      }
      const union = (field: string) => uniq<string>([...toArr(keep[field]), ...orderedDups.flatMap((d) => toArr(d[field]))]);
      const ug = union("subcategory_group");
      const usg = union("subgroup");
      const uc = union("category");
      const uh = union("hidden_fields");
      if (ug.length) update.subcategory_group = ug;
      if (usg.length) update.subgroup = usg;
      if (uc.length) update.category = uc;
      if (uh.length) update.hidden_fields = uh;

      // Guarantee schema-required fields are non-empty before writing (some
      // imported records are missing nearest_town; updating them otherwise
      // throws "Field required").
      const REQ: Record<string, () => any> = {
        name: () => keep.nearest_town || keep.town || "Untitled",
        type: () => "Business",
        county: () => keep.nearest_town || keep.town || "Cork",
        town: () => keep.nearest_town || keep.area || keep.county || "Ireland",
        nearest_town: () => keep.town || keep.area || keep.county || "Ireland",
      };
      for (const f of Object.keys(REQ)) {
        if (!nonEmpty(keep[f]) && !nonEmpty(update[f])) {
          let v = undefined;
          for (const d of orderedDups) if (nonEmpty(d[f])) { v = d[f]; break; }
          if (v === undefined) v = REQ[f]();
          update[f] = v;
        }
      }

      if (orderedDups.some((d) => d.is_featured)) update.is_featured = true;
      if (orderedDups.some((d) => d.is_verified)) update.is_verified = true;
      if (keep.is_free !== true && orderedDups.some((d) => d.is_free === true)) update.is_free = true;
      if (keep.status !== "approved" && orderedDups.some((d) => d.status === "approved")) update.status = "approved";
      let bestPlan = keep.plan || "basic";
      for (const d of orderedDups) {
        if ((PLAN_RANK[d.plan] || 0) > (PLAN_RANK[bestPlan] || 0)) bestPlan = d.plan;
      }
      if (bestPlan !== keep.plan) update.plan = bestPlan;

      if (Object.keys(update).length) {
        await base44.asServiceRole.entities.CommunityListing.update(keep.id, update);
      }

      // Reparent child records from each duplicate onto the keeper
      for (const ent of CHILD_ENTITIES) {
        try {
          await base44.asServiceRole.entities[ent].updateMany(
            { listing_id: { $in: p.dups } },
            { $set: { listing_id: keep.id } }
          );
        } catch (_) { /* entity may not expose updateMany — skip */ }
      }
      // Reparent What's On events that pointed at a duplicate venue
      try {
        await base44.asServiceRole.entities.CommunityListing.updateMany(
          { parent_listing_id: { $in: p.dups } },
          { $set: { parent_listing_id: keep.id } }
        );
      } catch (_) { /* ignore */ }

      // Dedupe reviews by (listing_id, user_email) — keep the oldest
      try {
        const reviews = await base44.asServiceRole.entities.ListingReview.filter({ listing_id: keep.id }, "created_date", 500) as any[];
        const byUser = new Map<string, any[]>();
        for (const rv of reviews) {
          const k = (rv.user_email || "").toLowerCase();
          const arr = byUser.get(k) || [];
          arr.push(rv);
          byUser.set(k, arr);
        }
        for (const list of byUser.values()) {
          for (const rv of list.slice(1)) {
            await base44.asServiceRole.entities.ListingReview.delete(rv.id);
          }
        }
      } catch (_) { /* ignore */ }

      // Finally, delete the duplicate records
      for (const id of p.dups) {
        try {
          await base44.asServiceRole.entities.CommunityListing.delete(id);
          totalRemoved += 1;
        } catch (_) { /* ignore */ }
      }
    }

    return Response.json({
      dryRun: false,
      clustersMerged: plan.length,
      recordsRemoved: totalRemoved,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
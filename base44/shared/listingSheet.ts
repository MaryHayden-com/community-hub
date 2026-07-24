// Shared row builder for Google Sheets listing exports.
// Used by appendListingToSheet (real-time) and emailAllListingsSheet (scheduled).

export const SHEET_HEADERS = [
  "id","submitted","name","type","status","plan","is_featured","is_verified",
  "country","county","nearest_town","town","area","description","address",
  "phone","email","website","facebook_url","instagram_url","linkedin_url",
  "contact_name","owner_email","meeting_info","subcategory_group","subgroup",
  "category","category_text","event_date","event_date_end","event_time",
  "is_recurring","recurring_type","recurring_day","is_free","parent_listing_id",
  "created_date","updated_date","created_by_id","admin_link"
];

function arr(v: any, sep = "; "): string {
  if (Array.isArray(v)) return v.filter(Boolean).join(sep);
  return v == null ? "" : String(v);
}
function yn(v: any): string {
  return v ? "Yes" : "No";
}

export function listingToRow(l: any): string[] {
  const adminLink = l && l.id ? `https://hub4community.com/listing/${l.id}` : "";
  return [
    l?.id || "",
    l?.created_date || "",
    l?.name || "",
    l?.type || "",
    l?.status || "",
    l?.plan || "basic",
    yn(l?.is_featured),
    yn(l?.is_verified),
    l?.country || "Ireland",
    l?.county || "",
    l?.nearest_town || "",
    l?.town || "",
    l?.area || "",
    l?.description || "",
    l?.address || "",
    l?.phone || "",
    l?.email || "",
    l?.website || "",
    l?.facebook_url || "",
    l?.instagram_url || "",
    l?.linkedin_url || "",
    l?.contact_name || "",
    l?.owner_email || "",
    l?.meeting_info || "",
    arr(l?.subcategory_group),
    arr(l?.subgroup),
    arr(l?.category),
    l?.category_text || "",
    l?.event_date || "",
    l?.event_date_end || "",
    l?.event_time || "",
    yn(l?.is_recurring),
    l?.recurring_type || "",
    l?.recurring_day || "",
    l?.is_free == null ? "" : yn(l?.is_free),
    l?.parent_listing_id || "",
    l?.created_date || "",
    l?.updated_date || "",
    l?.created_by_id || "",
    adminLink,
  ];
}
// "Openness + needs" strip for a listing detail page.
// Answers the outsider's real questions: can I just turn up, do I need to
// know anyone, and who/how can I help? Renders nothing if a listing has
// none of the openness fields set, so existing listings are unaffected.
import { DoorOpen, Sparkles, HandHeart, KeyRound } from "lucide-react";

const STATUS_LABELS = {
  just_turn_up: "Just turn up",
  come_and_try: "Come & try",
  contact_first: "Contact first",
  members_only: "Members only",
};

const STATUS_STYLES = {
  just_turn_up: "bg-emerald-50 text-emerald-800 border-emerald-200",
  come_and_try: "bg-teal-50 text-teal-800 border-teal-200",
  contact_first: "bg-amber-50 text-amber-800 border-amber-200",
  members_only: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function OpennessStrip({ listing }) {
  if (!listing) return null;
  const {
    newcomer_status,
    beginner_friendly,
    welcome_note,
    volunteer_needed,
    volunteer_summary,
    facility_available,
    facility_details,
  } = listing;

  const hasAnything =
    newcomer_status ||
    beginner_friendly ||
    welcome_note ||
    volunteer_needed ||
    facility_available;
  if (!hasAnything) return null;

  return (
    <div
      className="mt-6 rounded-xl border p-4 sm:p-5"
      style={{ borderColor: "rgba(9,114,117,0.25)", background: "rgba(9,114,117,0.05)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#097275" }}>
        Can I come? · How you can help
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {newcomer_status && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
              STATUS_STYLES[newcomer_status] || STATUS_STYLES.members_only
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" /> {STATUS_LABELS[newcomer_status]}
          </span>
        )}
        {beginner_friendly && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-sky-50 text-sky-800 border-sky-200">
            <Sparkles className="w-3.5 h-3.5" /> Beginners welcome
          </span>
        )}
        {volunteer_needed && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-orange-50 text-orange-800 border-orange-200">
            <HandHeart className="w-3.5 h-3.5" /> Volunteers needed
          </span>
        )}
        {facility_available && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-violet-50 text-violet-800 border-violet-200">
            <KeyRound className="w-3.5 h-3.5" /> Space to hire
          </span>
        )}
      </div>

      {welcome_note && (
        <p className="text-sm leading-relaxed mb-2" style={{ color: "#097275" }}>
          “{welcome_note}”
        </p>
      )}

      <div className="space-y-2 text-sm">
        {volunteer_needed && volunteer_summary && (
          <div className="flex items-start gap-2">
            <HandHeart className="w-4 h-4 mt-0.5 shrink-0 text-orange-600" />
            <p className="leading-relaxed">
              <span className="font-medium">We need help with: </span>
              {volunteer_summary}
            </p>
          </div>
        )}
        {facility_available && facility_details && (
          <div className="flex items-start gap-2">
            <KeyRound className="w-4 h-4 mt-0.5 shrink-0 text-violet-600" />
            <p className="leading-relaxed">
              <span className="font-medium">Space available: </span>
              {facility_details}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
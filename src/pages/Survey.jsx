import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

const IRISH_COUNTIES = [
  "Antrim","Armagh","Carlow","Cavan","Clare","Cork","Derry","Donegal","Down","Dublin",
  "Fermanagh","Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim","Limerick",
  "Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo",
  "Tipperary","Tyrone","Waterford","Westmeath","Wexford","Wicklow"
];

const RESPONDENT_TYPES = ["Local business owner", "Community group / club", "Event organiser", "Public sector / council", "Local resident"];
const PROMOTION_METHODS = ["Facebook", "Word of mouth", "Local newspaper", "Flyers", "My own website", "Nothing / not sure"];
const FEATURES = ["Being found by locals searching online", "Listing events / What's On", "Contact details visible", "Profile page with photos", "Analytics (who viewed my listing)", "Mobile-friendly"];
const TRUST_FACTORS = ["Backed by local council / community organisation", "Lots of other local listings already there", "Free to try first", "Recommended by someone I know", "Local person managing it"];

function MultiCheck({ options, value, onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className="flex items-center gap-3 cursor-pointer group w-full text-left"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${value.includes(opt) ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
            {value.includes(opt) && <CheckCircle2 className="w-4 h-4 text-white" />}
          </div>
          <span className="text-sm">{opt}</span>
        </button>
      ))}
    </div>
  );
}

// Ranked selection — shows a number badge as each item is ticked in order
function RankedCheck({ options, value, onChange, maxRank }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      // Remove it, keeping order of remaining
      onChange(value.filter(v => v !== opt));
    } else if (!maxRank || value.length < maxRank) {
      onChange([...value, opt]);
    }
  };
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const rank = value.indexOf(opt) + 1; // 0 means not selected
        const selected = rank > 0;
        const atMax = maxRank && value.length >= maxRank && !selected;
        return (
          <label key={opt} className={`flex items-center gap-3 cursor-pointer group ${atMax ? "opacity-40 cursor-not-allowed" : ""}`}>
            <div
              onClick={() => !atMax && toggle(opt)}
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors shrink-0
                ${selected ? "bg-primary border-primary text-white" : "border-border group-hover:border-primary/50 text-muted-foreground"}`}
            >
              {selected ? rank : ""}
            </div>
            <span className="text-sm">{opt}</span>
          </label>
        );
      })}
      {maxRank && <p className="text-xs text-muted-foreground mt-2">Tick in order of importance — {value.length}/{maxRank} selected</p>}
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === opt ? "border-primary" : "border-border group-hover:border-primary/50"}`}>
            {value === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ScaleSelector({ value, onChange }) {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      <span className="text-xs text-muted-foreground">Very easy</span>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-full border-2 font-semibold text-sm transition-colors ${value === n ? "bg-primary border-primary text-white" : "border-border hover:border-primary/50"}`}
        >
          {n}
        </button>
      ))}
      <span className="text-xs text-muted-foreground">Very difficult</span>
    </div>
  );
}

export default function Survey() {
  usePageTitle("Survey");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    respondent_type: [],
    location: "",
    current_promotion: [],
    difficulty_finding_local: 0,
    directory_useful: "",
    important_features: [],
    willing_to_pay: "",
    price_preference: "",
    trust_factors: [],
    would_share: "",
    essential_feature: "",
    follow_up_name: "",
    follow_up_email: ""
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const sections = [
    {
      title: "About You",
      subtitle: "Section 1 of 6",
      content: (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">1. What best describes you? <span className="text-muted-foreground font-normal">(tick in order — 1 = most relevant)</span></p>
            <RankedCheck options={RESPONDENT_TYPES} value={form.respondent_type} onChange={v => set("respondent_type", v)} maxRank={5} />
          </div>
          <div>
            <p className="font-medium mb-2">2. Where are you based?</p>
            <select
              value={form.location}
              onChange={e => set("location", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select your county…</option>
              {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )
    },
    {
      title: "The Problem",
      subtitle: "Section 2 of 6",
      content: (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">3. How do you currently promote yourself locally? <span className="text-muted-foreground font-normal">(select all that apply)</span></p>
            <MultiCheck options={PROMOTION_METHODS} value={form.current_promotion} onChange={v => set("current_promotion", v)} />
          </div>
          <div>
            <p className="font-medium mb-3">4. How hard is it to find out what's happening locally in one place?</p>
            <ScaleSelector value={form.difficulty_finding_local} onChange={v => set("difficulty_finding_local", v)} />
          </div>
        </div>
      )
    },
    {
      title: "The Platform",
      subtitle: "Section 3 of 6",
      content: (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">5. Would a single directory of local businesses, clubs and events be useful to you?</p>
            <RadioGroup options={["Yes", "No", "Maybe"]} value={form.directory_useful} onChange={v => set("directory_useful", v)} />
          </div>
          <div>
            <p className="font-medium mb-3">6. What features matter most to you? <span className="text-muted-foreground font-normal">(tick in order — 1 = most important)</span></p>
            <RankedCheck options={FEATURES} value={form.important_features} onChange={v => set("important_features", v)} maxRank={6} />
          </div>
        </div>
      )
    },
    {
      title: "Willingness to Pay",
      subtitle: "Section 4 of 6",
      content: (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">7. Would you pay for an enhanced listing?</p>
            <RadioGroup
              options={["Yes, definitely", "Maybe, depends on price", "No, only if it's free", "Not sure yet"]}
              value={form.willing_to_pay}
              onChange={v => set("willing_to_pay", v)}
            />
          </div>
          <div>
            <p className="font-medium mb-2">8. What would feel like fair value for a full-year enhanced listing?</p>
            <p className="text-xs text-muted-foreground mb-3">e.g. €40/yr, €75/yr — whatever feels right to you</p>
            <Input placeholder="Your suggestion (e.g. €50/yr)" value={form.price_preference} onChange={e => set("price_preference", e.target.value)} />
          </div>
        </div>
      )
    },
    {
      title: "Trust & Adoption",
      subtitle: "Section 5 of 6",
      content: (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">9. What would make you trust and use this platform? <span className="text-muted-foreground font-normal">(tick in order — 1 = most important)</span></p>
            <RankedCheck options={TRUST_FACTORS} value={form.trust_factors} onChange={v => set("trust_factors", v)} maxRank={5} />
          </div>
          <div>
            <p className="font-medium mb-3">10. Would you share it with others in your community?</p>
            <RadioGroup options={["Yes", "No", "Maybe"]} value={form.would_share} onChange={v => set("would_share", v)} />
          </div>
        </div>
      )
    },
    {
      title: "Your Thoughts",
      subtitle: "Section 6 of 6",
      content: (
        <div className="space-y-6">
          <div>
            <p className="font-medium mb-2">11. What one thing would make this absolutely essential for your town?</p>
            <Textarea
              placeholder="Your thoughts..."
              value={form.essential_feature}
              onChange={e => set("essential_feature", e.target.value)}
              className="h-24"
            />
          </div>
          <div>
            <p className="font-medium mb-2">12. Can we follow up with you? <span className="text-muted-foreground font-normal">(optional)</span></p>
            <div className="space-y-2">
              <Input placeholder="Your name" value={form.follow_up_name} onChange={e => set("follow_up_name", e.target.value)} />
              <Input placeholder="Your email" type="email" value={form.follow_up_email} onChange={e => set("follow_up_email", e.target.value)} />
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.SurveyResponse.create(form);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Thank you!</h2>
          <p className="text-muted-foreground mb-6">Your feedback will help shape Hub4Community for West Cork. We really appreciate you taking the time.</p>
          <Button onClick={() => window.location.href = "/"} variant="outline">Visit the Directory</Button>
        </div>
      </div>
    );
  }

  const current = sections[step];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-primary mb-1">Hub4Community Survey</h1>
          <p className="text-muted-foreground text-sm">Help us shape your local community directory — takes about 3 minutes</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {sections.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="mb-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">{current.subtitle}</div>
          <h2 className="font-display text-xl font-semibold mb-6">{current.title}</h2>
          {current.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < sections.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>Next →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Survey ✓"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
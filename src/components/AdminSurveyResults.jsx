import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Loader2, Users, TrendingUp, DollarSign, Share2, Copy, Check } from "lucide-react";

const COLORS = ["#097275", "#E2701B", "#911B1B", "#4f86c6", "#6ab04c", "#8e44ad"];

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function HorizontalBar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color || "#097275" }} />
      </div>
    </div>
  );
}

function countField(responses, field) {
  const counts = {};
  responses.forEach(r => {
    const val = r[field];
    if (Array.isArray(val)) {
      val.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    } else if (val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

const SURVEY_URL = `${window.location.origin}/survey`;

export default function AdminSurveyResults() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SURVEY_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    base44.entities.SurveyResponse.list("-created_date", 500)
      .then(setResponses)
      .finally(() => setLoading(false));
  }, []);

  const surveyLinkBanner = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Survey Link — share this to collect responses</p>
        <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline break-all">{SURVEY_URL}</a>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0"
      >
        {copied ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
      </button>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!responses.length) return (
    <div className="space-y-6">
      {surveyLinkBanner}
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">No survey responses yet</p>
        <p className="text-sm mt-1">Share the link above to start collecting responses</p>
      </div>
    </div>
  );

  const total = responses.length;
  const willingToPay = responses.filter(r => r.willing_to_pay === "Yes, definitely" || r.willing_to_pay === "Maybe, depends on price").length;
  const wouldShare = responses.filter(r => r.would_share === "Yes").length;
  const avgDifficulty = responses.filter(r => r.difficulty_finding_local).reduce((s, r) => s + r.difficulty_finding_local, 0) / (responses.filter(r => r.difficulty_finding_local).length || 1);
  const followUps = responses.filter(r => r.follow_up_email).length;

  const respondentData = countField(responses, "respondent_type");
  const usefulData = countField(responses, "directory_useful");
  const payData = countField(responses, "willing_to_pay");
  const priceData = countField(responses, "price_preference");
  const featuresData = countField(responses, "important_features");
  const trustData = countField(responses, "trust_factors");
  const promotionData = countField(responses, "current_promotion");

  return (
    <div className="space-y-8">
      {/* Survey Link Banner */}
      {surveyLinkBanner}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Responses" value={total} sub={`${followUps} left contact details`} />
        <StatCard icon={TrendingUp} label="Would Use It" value={`${Math.round((usefulData.find(d => d.name === "Yes")?.value || 0) / total * 100)}%`} sub="said Yes" />
        <StatCard icon={DollarSign} label="Open to Paying" value={`${Math.round(willingToPay / total * 100)}%`} sub="yes or maybe" />
        <StatCard icon={Share2} label="Would Share" value={`${Math.round(wouldShare / total * 100)}%`} sub={`avg difficulty: ${avgDifficulty.toFixed(1)}/5`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Who responded */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Who Responded</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={respondentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${Math.round(percent * 100)}%`}>
                {respondentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Would directory be useful */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Would a Directory Be Useful?</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usefulData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
              <Tooltip />
              <Bar dataKey="value" radius={4}>
                {usefulData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Willing to pay */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Willingness to Pay</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={150} />
              <Tooltip />
              <Bar dataKey="value" radius={4}>
                {payData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price preference */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Price Preference</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priceData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={150} />
              <Tooltip />
              <Bar dataKey="value" radius={4}>
                {priceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Features & Trust */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Most Wanted Features</h3>
          <div>
            {featuresData.map((d, i) => (
              <HorizontalBar key={d.name} label={d.name} count={d.value} total={total} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Trust Factors</h3>
          <div>
            {trustData.map((d, i) => (
              <HorizontalBar key={d.name} label={d.name} count={d.value} total={total} color={COLORS[i % COLORS.length]} />
            ))}
          </div>
        </div>
      </div>

      {/* Current promotion methods */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold mb-4">How People Currently Promote Themselves</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={promotionData} margin={{ bottom: 20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={4}>
              {promotionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Open text responses */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold mb-4">What Would Make It Essential? <span className="text-muted-foreground font-normal text-sm">(open responses)</span></h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {responses.filter(r => r.essential_feature).map((r, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-muted-foreground shrink-0">{r.respondent_type || "—"}</span>
              <span className="text-foreground">"{r.essential_feature}"</span>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up contacts */}
      {responses.filter(r => r.follow_up_email).length > 0 && (
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Follow-up Contacts ({followUps})</h3>
          <div className="space-y-2">
            {responses.filter(r => r.follow_up_email).map((r, i) => (
              <div key={i} className="flex gap-4 text-sm py-2 border-b last:border-0">
                <span className="font-medium">{r.follow_up_name || "—"}</span>
                <a href={`mailto:${r.follow_up_email}`} className="text-primary hover:underline">{r.follow_up_email}</a>
                <span className="text-muted-foreground">{r.location}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
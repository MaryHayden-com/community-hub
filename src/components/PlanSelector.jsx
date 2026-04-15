import { Check, Zap, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    period: "",
    icon: Shield,
    color: "border-border",
    headerColor: "bg-muted/50",
    features: [
      "Listed in community directory",
      "Name, type & location shown",
      "Standard search placement",
    ],
    missing: [
      "Contact details hidden",
      "No social links",
      "No featured badge",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "€49",
    period: "/year",
    icon: Zap,
    color: "border-primary",
    headerColor: "bg-primary/5",
    badge: "Most Popular",
    features: [
      "Everything in Basic",
      "Phone & email visible",
      "Website link shown",
      "Social media links",
      "Contact name shown",
      "Meeting info shown",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "€99",
    period: "/year",
    icon: Star,
    color: "border-amber-400",
    headerColor: "bg-amber-50",
    badge: "Best Value",
    features: [
      "Everything in Standard",
      "Featured badge on listing",
      "Priority in search results",
      "Homepage spotlight eligibility",
      "Verified listing badge",
    ],
  },
];

export default function PlanSelector({ currentPlan = "basic", onSelect, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLANS.map((plan) => {
        const Icon = plan.icon;
        const isCurrent = currentPlan === plan.id;
        return (
          <div
            key={plan.id}
            className={`rounded-xl border-2 overflow-hidden transition-all ${plan.color} ${isCurrent ? "ring-2 ring-offset-2 ring-primary" : ""}`}
          >
            <div className={`p-4 ${plan.headerColor}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-bold text-base">{plan.name}</span>
                </div>
                {plan.badge && (
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{plan.badge}</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {plan.missing?.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground line-through">
                  <div className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              {isCurrent ? (
                <Button className="w-full" disabled variant="outline">Current Plan</Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.id === "premium" ? "default" : "outline"}
                  onClick={() => onSelect(plan.id)}
                  disabled={loading}
                >
                  {plan.id === "basic" ? "Downgrade" : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
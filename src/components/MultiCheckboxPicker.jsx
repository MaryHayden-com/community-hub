import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * A multi-select picker using togglable chips/badges.
 * Props:
 *   options: string[]
 *   selected: string[]
 *   onChange: (newSelected: string[]) => void
 */
export default function MultiCheckboxPicker({ options, selected = [], onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-muted"
            )}
          >
            {active && <Check className="w-3 h-3" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}
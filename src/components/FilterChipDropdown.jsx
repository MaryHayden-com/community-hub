import { ChevronDown, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

/**
 * A tappable filter chip that opens a dropdown of options, each with a count.
 * - value: currently selected option value ("" = All)
 * - options: [{ value, count }]
 * - onChange(value)
 */
export default function FilterChipDropdown({ label, value, options, onChange, accent = "#097275" }) {
  const hasOptions = Array.isArray(options) && options.length > 0;
  const selected = hasOptions ? options.find((o) => o.value === value) : null;
  const isActive = !!selected;
  const total = hasOptions ? options.reduce((s, o) => s + (o.count || 0), 0) : 0;

  const trigger = (
    <button
      type="button"
      disabled={!hasOptions}
      className={`flex items-center gap-1.5 rounded-full px-3 py-2 min-h-[40px] text-xs font-semibold whitespace-nowrap transition-colors border ${
        !hasOptions
          ? "opacity-40 cursor-not-allowed bg-card border-border"
          : isActive
          ? "text-white"
          : "bg-card border-border hover:border-primary"
      }`}
      style={isActive ? { background: accent, borderColor: accent } : {}}
    >
      <span className="opacity-80">{label}</span>
      <span className="font-bold">{isActive ? selected.value : "All"}</span>
      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
    </button>
  );

  if (!hasOptions) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto w-56">
        <DropdownMenuItem onClick={() => onChange("")} className="flex justify-between">
          <span className="flex items-center gap-1.5">{!value && <Check className="w-3 h-3" style={{ color: accent }} />}All {label}</span>
          <span className="text-xs text-muted-foreground ml-3">{total}</span>
        </DropdownMenuItem>
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => onChange(o.value)} className="flex justify-between">
            <span className="flex items-center gap-1.5">{value === o.value && <Check className="w-3 h-3" style={{ color: accent }} />}{o.value}</span>
            <span className="text-xs text-muted-foreground ml-3">{o.count}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
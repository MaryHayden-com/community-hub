import { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/**
 * A tappable filter chip that opens a PORTALED multi-select list with tick boxes + counts.
 * Portaling avoids the list being clipped by the horizontally-scrollable chip row.
 * - value: array of selected values
 * - options: [{ value, count }]
 * - onChange(array)
 */
export default function FilterMultiChipDropdown({ label, value = [], options, onChange, accent = "#097275" }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const hasOptions = Array.isArray(options) && options.length > 0;
  const selected = Array.isArray(value) ? value : [];
  const selCount = hasOptions ? options.filter((o) => selected.includes(o.value)).length : 0;
  const isActive = selCount > 0;
  const total = hasOptions ? options.reduce((s, o) => s + (o.count || 0), 0) : 0;

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };
  const clearAll = () => onChange([]);

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
      <span className="font-bold">{isActive ? `${selCount} ticked` : "All"}</span>
      <ChevronDown className={cn("w-3.5 h-3.5 opacity-70 transition-transform", open && "rotate-180")} />
    </button>
  );

  if (!hasOptions) return trigger;

  const optionsList = (
    <div className="overflow-y-auto max-h-72 py-1">
      <div
        onClick={clearAll}
        className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-accent transition-colors"
      >
        <div className="w-5 h-5 rounded border flex items-center justify-center shrink-0" style={{ borderColor: accent }} />
        <span className="flex-1">All {label}</span>
        <span className="text-xs text-muted-foreground">{total}</span>
      </div>
      {options.map((o) => {
        const isSel = selected.includes(o.value);
        return (
          <div
            key={o.value}
            onClick={() => toggle(o.value)}
            className="flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-accent transition-colors"
          >
            <div
              className={cn("w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors", !isSel && "border-input")}
              style={isSel ? { background: accent, borderColor: accent } : {}}
            >
              {isSel && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="flex-1">{o.value}</span>
            {o.count != null && <span className="text-xs text-muted-foreground">{o.count}</span>}
          </div>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          {optionsList}
          <div className="px-4 pb-6 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="w-full h-11 rounded-lg text-white text-sm font-semibold"
              style={{ background: accent }}
            >
              Done ({selCount} ticked)
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        {optionsList}
      </PopoverContent>
    </Popover>
  );
}
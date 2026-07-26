import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

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
 * A tappable filter chip that opens a multi-select dropdown with tick boxes + counts.
 * - value: array of selected values
 * - options: [{ value, count }]
 * - onChange(array)
 */
export default function FilterMultiChipDropdown({ label, value = [], options, onChange, accent = "#097275" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

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
      onClick={() => hasOptions && setOpen((o) => !o)}
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
    <div className={cn("overflow-y-auto", isMobile ? "max-h-[60vh] py-2" : "max-h-72")}>
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
      <div>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
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
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div className="absolute z-50 mt-1 w-56 rounded-md border bg-popover shadow-md">
          {optionsList}
        </div>
      )}
    </div>
  );
}
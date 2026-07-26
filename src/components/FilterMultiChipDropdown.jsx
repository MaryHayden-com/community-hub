import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
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
 * A tappable filter chip that opens a PORTALED multi-select grid with a search box + tick boxes + counts.
 * Portaling avoids the list being clipped by the horizontally-scrollable chip row.
 * - value: array of selected values
 * - options: [{ value, count }]
 * - onChange(array)
 */
export default function FilterMultiChipDropdown({ label, value = [], options, onChange, accent = "#097275" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isMobile = useIsMobile();

  const hasOptions = Array.isArray(options) && options.length > 0;
  const selected = Array.isArray(value) ? value : [];
  const selCount = hasOptions ? options.filter((o) => selected.includes(o.value)).length : 0;
  const isActive = selCount > 0;
  const total = hasOptions ? options.reduce((s, o) => s + (o.count || 0), 0) : 0;

  const filtered = useMemo(() => {
    if (!hasOptions) return [];
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, query, hasOptions]);

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

  const searchBox = (
    <div className="relative px-3 pt-3 pb-2 sticky top-0 bg-popover z-10">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Find a ${label.toLowerCase().replace(/s$/, "")}…`}
        className="w-full h-9 pl-8 pr-2 rounded-md border border-input bg-background text-sm outline-none focus:border-primary"
      />
    </div>
  );

  const allRow = (
    <button
      type="button"
      onClick={clearAll}
      className="flex items-center gap-2 px-3 py-2.5 text-sm w-full text-left hover:bg-accent transition-colors min-h-[44px]"
    >
      <div className="w-5 h-5 rounded border flex items-center justify-center shrink-0" style={{ borderColor: accent }} />
      <span className="flex-1 font-semibold">All {label}</span>
      <span className="text-xs text-muted-foreground">{total}</span>
    </button>
  );

  const grid = (
    <div className="px-3 pb-3">
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No matches for "{query}"</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-80 overflow-y-auto pr-1">
          {filtered.map((o) => {
            const isSel = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className="flex items-start gap-2 px-2 py-2.5 text-sm rounded-md hover:bg-accent text-left min-h-[44px]"
              >
                <div
                  className={cn("w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5", !isSel && "border-input")}
                  style={isSel ? { background: accent, borderColor: accent } : {}}
                >
                  {isSel && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="flex-1 leading-tight break-words">{o.value}</span>
                {o.count != null && <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{o.count}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-1">
            <DrawerTitle>{label}</DrawerTitle>
          </DrawerHeader>
          {searchBox}
          <div className="px-3">{allRow}</div>
          {grid}
          <div className="px-4 pb-6 pt-2 sticky bottom-0 bg-popover">
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
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,640px)] p-0">
        {searchBox}
        {allRow}
        {grid}
      </PopoverContent>
    </Popover>
  );
}
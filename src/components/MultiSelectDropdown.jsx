import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
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

export default function MultiSelectDropdown({ options, selected = [], onChange, placeholder = "Select options..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  const remove = (val, e) => { e.stopPropagation(); onChange(selected.filter((v) => v !== val)); };

  const trigger = (
    <div
      onClick={() => setOpen((o) => !o)}
      className="min-h-[44px] w-full flex items-center flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm cursor-pointer hover:bg-muted/30 transition-colors"
    >
      {selected.length === 0 ? (
        <span className="text-muted-foreground">{placeholder}</span>
      ) : (
        selected.map((val) => (
          <span key={val} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-md px-2 py-0.5 font-medium">
            {val}
            <button onClick={(e) => remove(val, e)} className="hover:text-primary/60 leading-none">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))
      )}
      <ChevronDown className={cn("w-4 h-4 text-muted-foreground ml-auto shrink-0 transition-transform", open && "rotate-180")} />
    </div>
  );

  const optionsList = (
    <div className={cn(isMobile ? "max-h-[60vh] overflow-y-auto py-2" : "max-h-56 overflow-y-auto")}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <div
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
              isSelected && "bg-primary/5"
            )}
          >
            <div className={cn("w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
              isSelected ? "bg-primary border-primary" : "border-input"
            )}>
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            {opt}
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
              <DrawerTitle>{placeholder}</DrawerTitle>
            </DrawerHeader>
            {optionsList}
            <div className="px-4 pb-6 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
              >
                Done ({selected.length} selected)
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
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {optionsList}
        </div>
      )}
    </div>
  );
}
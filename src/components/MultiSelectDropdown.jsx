import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MultiSelectDropdown({ options, selected = [], onChange, placeholder = "Select options..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  const remove = (val, e) => { e.stopPropagation(); onChange(selected.filter((v) => v !== val)); };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        className="min-h-9 w-full flex items-center flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm cursor-pointer hover:bg-muted/30 transition-colors"
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

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border bg-popover shadow-md">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggle(opt)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                  isSelected && "bg-primary/5"
                )}
              >
                <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "bg-primary border-primary" : "border-input"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
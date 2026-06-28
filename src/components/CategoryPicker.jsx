import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { TAXONOMY } from "@/utils/taxonomy";

/**
 * Mobile-friendly category picker.
 * Shows a search input + scrollable grouped list.
 * Supports single or multi select.
 * Props:
 *   type         – listing type (key into TAXONOMY)
 *   selected     – array of selected category strings
 *   onChange     – (newArray) => void
 *   placeholder  – string
 *   single       – bool (default false = multi-select)
 */
export default function CategoryPicker({ type, selected = [], onChange, placeholder = "Search or browse categories...", single = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Build flat list with group/subgroup context for display
  const allOptions = useMemo(() => {
    const groups = TAXONOMY[type] || {};
    const opts = [];
    Object.entries(groups).forEach(([group, subGroups]) => {
      Object.entries(subGroups).forEach(([subGroup, cats]) => {
        cats.forEach(cat => {
          opts.push({ cat, group, subGroup });
        });
      });
    });
    return opts;
  }, [type]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allOptions;
    const q = query.toLowerCase();
    return allOptions.filter(o =>
      o.cat.toLowerCase().includes(q) ||
      o.group.toLowerCase().includes(q) ||
      o.subGroup.toLowerCase().includes(q)
    );
  }, [allOptions, query]);

  // Group filtered results for display
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(o => {
      const key = `${o.group} › ${o.subGroup}`;
      if (!map[key]) map[key] = [];
      map[key].push(o.cat);
    });
    return map;
  }, [filtered]);

  const toggle = (cat) => {
    if (single) {
      onChange([cat]);
      setOpen(false);
      setQuery("");
      return;
    }
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const remove = (cat, e) => {
    e.stopPropagation();
    onChange(selected.filter(c => c !== cat));
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger / selected display */}
      <div
        onClick={() => setOpen(v => !v)}
        className="min-h-[36px] w-full flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm cursor-pointer focus-within:ring-1 focus-within:ring-ring"
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground flex-1 py-0.5">{placeholder}</span>
        ) : (
          selected.map(cat => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {cat}
              {!single && (
                <button
                  type="button"
                  onClick={(e) => remove(cat, e)}
                  className="hover:text-destructive ml-0.5"
                  aria-label={`Remove ${cat}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}
        <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 sticky top-0">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to filter..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No categories match "{query}"</p>
            ) : (
              Object.entries(grouped).map(([heading, cats]) => (
                <div key={heading}>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20 sticky top-[41px]">
                    {heading}
                  </p>
                  {cats.map(cat => {
                    const isSelected = selected.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggle(cat)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2
                          ${isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"}`}
                      >
                        <span>{cat}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {!single && selected.length > 0 && (
            <div className="border-t px-3 py-2 flex justify-between items-center bg-muted/20">
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
              <button
                type="button"
                onClick={() => { onChange([]); setOpen(false); setQuery(""); }}
                className="text-xs text-destructive hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
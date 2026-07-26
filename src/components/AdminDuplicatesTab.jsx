import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import MergeListingsDialog from "@/components/MergeListingsDialog";
import { Button } from "@/components/ui/button";
import { Loader2, CopyX } from "lucide-react";

export default function AdminDuplicatesTab() {
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState([]);
  const [error, setError] = useState(null);
  const [mergePair, setMergePair] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("findDuplicateListings", {});
      setClusters(res.data?.clusters || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return <div className="py-10 text-center text-destructive">Error: {error}</div>;
  }
  if (clusters.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <CopyX className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No duplicates detected. Nice and clean.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {clusters.length} duplicate group{clusters.length !== 1 ? "s" : ""} found. Open a group,
        choose which record to keep — the other is permanently removed.
      </p>
      {clusters.map((g, i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold" style={{ color: "#097275" }}>
              {g[0].name}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                in {g[0].town || g[0].area || g[0].county}
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">{g.length} copies</span>
          </div>
          <div className="space-y-2">
            {g.map((l) => (
              <div key={l.id} className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-muted">
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{l.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {l.type}
                    {" · "}
                    {Array.isArray(l.category) ? l.category.join(", ") : (l.category || "")}
                    {l.type === "What's On" && l.event_date ? (
                      <>{" · "}{new Date(l.event_date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</>
                    ) : null}
                    {l.type === "What's On" && l.is_recurring ? <>{" · "}{l.recurring_type || "recurring"}</> : null}
                    {" · "}
                    updated {new Date(l.updated_date).toLocaleDateString("en-IE", { month: "short", year: "numeric" })}
                  </p>
                </div>
                {l.owner_email && (
                  <span className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold shrink-0">claimed</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <Button size="sm" variant="outline" onClick={() => setMergePair([g[0], g[1]])}>
              Merge first two…
            </Button>
          </div>
        </div>
      ))}

      {mergePair && (
        <MergeListingsDialog
          listingA={mergePair[0]}
          listingB={mergePair[1]}
          onClose={() => setMergePair(null)}
          onMerged={() => { setMergePair(null); load(); }}
        />
      )}
    </div>
  );
}
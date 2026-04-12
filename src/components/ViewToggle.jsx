import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden">
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-none h-9"
        onClick={() => setViewMode("grid")}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-none h-9"
        onClick={() => setViewMode("list")}
        title="List view"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}
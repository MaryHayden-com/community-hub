import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewToggle({ view, setView }) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-none h-8"
        onClick={() => setView("grid")}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        className="rounded-none h-8"
        onClick={() => setView("list")}
        title="List view"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}
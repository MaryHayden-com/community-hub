import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";

export default function CountyCard({ county, count, towns }) {
  return (
    <Link
      to={`/county/${encodeURIComponent(county)}`}
      className="group block bg-card rounded-xl border hover:border-primary/30 hover:shadow-lg transition-all duration-300 p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              Co. {county}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {count} listing{count !== 1 ? "s" : ""} · {towns.length} town{towns.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
      </div>

      {towns.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
          {towns.slice(0, 5).map((t) => (
            <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {t}
            </span>
          ))}
          {towns.length > 5 && (
            <span className="text-xs text-muted-foreground">+{towns.length - 5} more</span>
          )}
        </div>
      )}
    </Link>
  );
}
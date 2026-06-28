import { Star } from "lucide-react";

export default function ReviewStars({ rating, size = "sm" }) {
  const sizeClass = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}
import { Link } from "react-router-dom";
import { PlusCircle, HeartHandshake } from "lucide-react";

// Community-contribution value proposition. Encourages locals to add listings —
// the more listings, the more useful the hub is for everyone.
export default function CommunityContributionBanner({ town, onAddListing }) {
  const cta = onAddListing ? (
    <button
      onClick={onAddListing}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white shadow"
      style={{ background: "#E2701B" }}
    >
      <PlusCircle className="w-4 h-4" /> Add Your Listing
    </button>
  ) : (
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white shadow"
      style={{ background: "#E2701B" }}
    >
      <PlusCircle className="w-4 h-4" /> Add Your Listing
    </Link>
  );

  return (
    <section
      className="rounded-2xl p-6 sm:p-8 text-center"
      style={{ background: "hsl(182 85% 18%)", border: "1px solid hsl(182 85% 25%)" }}
      aria-labelledby="community-contribution"
    >
      <HeartHandshake className="w-7 h-7 mx-auto text-white/80" aria-hidden="true" />
      <h2 id="community-contribution" className="font-display text-xl sm:text-2xl font-bold text-white mt-3">
        Every listing strengthens {town ? town : "your community"}
      </h2>
      <p className="text-white/85 mt-2 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
        Hub4Community is built by people like you. Adding your business, club or event is free,
        takes a minute, and makes it easier for neighbours to find what's on their doorstep.
        The more of us who list, the more useful this becomes for everyone.
      </p>
      <div className="mt-5">{cta}</div>
    </section>
  );
}
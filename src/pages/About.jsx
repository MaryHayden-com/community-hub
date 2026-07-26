import { Link } from "react-router-dom";
import { Compass, Heart, HeartHandshake, Store } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

const POINTS = [
  { icon: HeartHandshake, title: "Welcome newcomers", body: "New to the area? Everything local, in one friendly place — find your people and your next thing to do." },
  { icon: Store, title: "Shop local", body: "Keep the community thriving by finding and supporting the businesses on your doorstep." },
  { icon: Heart, title: "A platform for local business", body: "Be found by the people looking for you — your business, club or event, in front of your local community, for free." },
  { icon: Compass, title: "Less friction, for everyone", body: "No account needed to browse. Adding your listing takes a minute. Finding what you need takes less." },
];

export default function About() {
  usePageTitle("About", {
    description: "Why Your Community Hub exists — putting the right people in front of the right things, and helping everything local get seen.",
  });
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3" style={{ color: "#097275" }}>
        Why we built this
      </h1>
      <p className="text-base sm:text-lg leading-relaxed" style={{ color: "#333333" }}>
        Great local businesses, clubs and events shouldn't be hard to find — and finding your feet
        in a new place shouldn't feel lonely. We put the right people in front of the right things, and
        help everything local get seen. That's how communities come together.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl p-4 border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-5 h-5" style={{ color: "#E2701B" }} />
              <h2 className="font-bold text-sm" style={{ color: "#097275" }}>{title}</h2>
            </div>
            <p className="text-sm" style={{ color: "#555555" }}>{body}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mt-10 mb-2" style={{ color: "#097275" }}>How it works</h2>
      <ol className="space-y-2 text-sm" style={{ color: "#333333" }}>
        <li><strong>Discover</strong> — Browse local businesses, clubs, classes and what's on near you.</li>
        <li><strong>Connect</strong> — Save your favourites and get involved in what's happening.</li>
        <li><strong>Belong</strong> — Add your own business, group or event and help the community grow.</li>
      </ol>

      <div className="mt-10 p-5 rounded-xl bg-primary/5 border border-primary/20">
        <h2 className="font-bold text-sm mb-1" style={{ color: "#097275" }}>A note from the founder</h2>
        <p className="text-sm" style={{ color: "#555555" }}>
          I built this to take the pain out of getting the right people in front of the right thing —
          and to give local businesses a platform to be found. It's free, it's local, and it's ours.
          [Add a sentence or two in your own words, and your name, here — this is the line that turns
          a visitor into a believer.]
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/directory" className="rounded-lg px-4 py-2.5 text-white text-sm font-bold min-h-[44px] flex items-center" style={{ background: "#097275" }}>Explore the directory</Link>
        <Link to="/directory" className="rounded-lg px-4 py-2.5 text-white text-sm font-bold min-h-[44px] flex items-center" style={{ background: "#E2701B" }}>Add your listing</Link>
        <Link to="/privacy" className="text-sm underline underline-offset-2 flex items-center px-2" style={{ color: "#097275" }}>Privacy policy</Link>
      </div>
    </div>
  );
}
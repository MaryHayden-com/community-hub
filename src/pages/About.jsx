import { Link } from "react-router-dom";
import { PlusCircle, HeartHandshake, MapPin, Users, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

export default function About() {
  usePageTitle("About Community Hub", {
    description: "Community Hub is a free local directory for Ireland, starting in Bandon and West Cork — built by Mary Hayden to make local life easier to find, share and take part in.",
    path: "/about",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Hero */}
      <header className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "#097275" }}>
          About Community Hub
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "#333333" }}>
          Community Hub is a free, locally-focused directory that brings the businesses, clubs, services, schools and events of a place together in one simple, trusted space.
        </p>
      </header>

      {/* Why it was set up */}
      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>Why it was set up</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed" style={{ color: "#333333" }}>
          <p>
            Local information is often scattered. A club posts on Facebook, a business relies on a website no one visits, an event is shared in a Whatsapp group, and a community service is buried in a PDF somewhere. The result is simple: people miss what is right on their doorstep.
          </p>
          <p>
            Community Hub was set up to fix that for one place at a time. Starting in Bandon and across West Cork, it gathers trusted local listings into a single, easy-to-search directory — so a neighbour can find a plumber, a parent can find a toddler group, a visitor can find what's on this weekend, and a small club can finally be discovered.
          </p>
          <p>
            The goal is not to be the biggest. It is to be the most genuinely local — a directory that reflects the real fabric of a community and helps it stay connected.
          </p>
        </div>
      </section>

      {/* What Community Hub does */}
      <section className="rounded-2xl p-5 sm:p-6" style={{ background: "#097275" }}>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white">What Community Hub does</h2>
        <ul className="mt-3 space-y-2">
          {[
            { icon: MapPin, text: "Brings businesses, clubs, services and events together in one place." },
            { icon: Users, text: "Helps small, volunteer-run groups become visible and easier to join." },
            { icon: Calendar, text: "Shows what's on locally — one-off events, regular meet-ups and everything between." },
            { icon: HeartHandshake, text: "Keeps community services and trusted local providers easy to find." },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-white/90">
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Meet Mary Hayden */}
      <section className="rounded-2xl border p-5 sm:p-6" style={{ background: "rgba(226, 112, 27, 0.08)", borderColor: "#E2701B" }}>
        <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "#097275" }}>Meet Mary Hayden</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed" style={{ color: "#333333" }}>
          <p>
            Community Hub was created by Mary Hayden. With a background in finance, operations and digital transformation, Mary works independently with founders, SME leaders and community-focused organisations to help them bring more clarity to what they are building, how they communicate it and how they grow it.
          </p>
          <p>
            Mary set up Community Hub because she kept seeing the same gap on her own doorstep in Bandon and West Cork: good local organisations struggling to be found, and good local people struggling to find them. Community Hub is her practical answer — a clear, locally-owned directory that helps communities become more visible and better connected.
          </p>
          <p className="italic" style={{ color: "#097275" }}>
            Independent strategic partner helping community-focused organisations and SMEs make ideas clearer, more visible and easier to deliver.
          </p>
        </div>
      </section>

      {/* Get involved */}
      <section className="text-center rounded-2xl border bg-card p-6 sm:p-8">
        <Sparkles className="w-6 h-6 mx-auto" style={{ color: "#E2701B" }} />
        <h2 className="font-display text-xl sm:text-2xl font-bold mt-2" style={{ color: "#097275" }}>Keep this site useful</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#333333" }}>
          Community Hub is built by the community, for the community. If your business, club, service or event is missing, add it — it's free and only takes a minute.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild style={{ background: "#E2701B", border: "none" }}>
            <Link to="/directory"><PlusCircle className="w-4 h-4" /> Add your listing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/whats-on"><Calendar className="w-4 h-4" /> See what's on</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
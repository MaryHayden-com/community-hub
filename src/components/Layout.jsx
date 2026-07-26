import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  MapPin, Building2, Users, GraduationCap, Calendar,
  Shield, Menu, X, ChevronRight, CreditCard, LayoutDashboard,
  Tag, ChevronLeft, HeartHandshake, Heart, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Directory", icon: MapPin },
  { to: "/directory?type=Business", label: "Business & Retail", icon: Building2 },
  { to: "/directory?type=Club+%26+Group", label: "Clubs & Groups", icon: Users },
  { to: "/directory?type=Community+Services", label: "Community Services", icon: HeartHandshake },
  { to: "/directory?type=Education", label: "Education & Training", icon: GraduationCap },
  { to: "/whats-on", label: "What's On", icon: Calendar },
];

// Root paths that show the app title (no back button)
const ROOT_PATHS = ["/", "/directory", "/admin", "/dashboard", "/group-dashboard", "/billing", "/calendar", "/whats-on"];

// Bottom nav tabs (mobile)
const BOTTOM_TABS = [
  { to: "/", label: "Directory", icon: MapPin },
  { to: "/whats-on", label: "What's On", icon: Calendar },
  { to: "/saved", label: "Saved", icon: Heart },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // System dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Scroll to top whenever we navigate to a different page (desktop header links etc.)
  useEffect(() => {
    // Don't fight an explicit "scroll to About" cross-page request.
    if (window.sessionStorage.getItem("scrollToAbout")) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  const isAdmin = user?.role === "admin";
  const isGroupAdmin = user?.role === "group_admin";
  const isListingOwner = user?.role === "listing_owner";

  const isRootPath = ROOT_PATHS.includes(location.pathname);
  const canGoBack = !isRootPath;

  // Save/restore scroll position per tab
  const scrollPositions = useRef({});
  const prevPathRef = useRef(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">

          {/* Mobile: back button OR logo */}
          <div className="flex items-center gap-2">
            {canGoBack ? (
              <button
                onClick={() => navigate(-1)}
                className="md:hidden flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-1"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : null}
            <button
              onClick={() => {
                const scrollToAbout = () => {
                  const el = document.getElementById("about");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                };
                if (location.pathname === "/" || location.pathname === "/directory") {
                  // Try immediately; retry a few times in case content is still mounting.
                  scrollToAbout();
                  let tries = 0;
                  const iv = setInterval(() => {
                    if (document.getElementById("about")) { scrollToAbout(); clearInterval(iv); }
                    else if (++tries > 20) clearInterval(iv);
                  }, 80);
                } else {
                  sessionStorage.setItem("scrollToAbout", "1");
                  navigate("/");
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer"
              title="About"
            >
              <img src="https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/e27af7809_generated_image.png" alt="Community Hub Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0" />
              <span className="font-display font-bold tracking-tight text-base sm:text-xl" style={{ color: '#097275' }}>
                About
              </span>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === "/"
                ? (location.pathname === "/" || location.pathname === "/directory") && !location.search
                : location.pathname + location.search === item.to ||
                  (item.to === "/directory" && location.pathname === "/directory" && !location.search);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    const dest = item.to.split("?")[0];
                    if (dest === "/") {
                      if (location.pathname === "/" || location.pathname === "/directory") window.scrollTo({ top: 0, behavior: "smooth" });
                    } else if (location.pathname === dest) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/saved"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === "/saved" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Saved
            </Link>

            {isListingOwner && (
              <Link to="/dashboard" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${location.pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            )}
            {isGroupAdmin && (
              <Link to="/group-dashboard" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${location.pathname === "/group-dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <Tag className="w-3.5 h-3.5" /> Group
              </Link>
            )}
            {isListingOwner && (
              <Link to="/billing" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${location.pathname === "/billing" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <CreditCard className="w-3.5 h-3.5" /> Billing
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${location.pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </nav>

          {/* User + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {isListingOwner && (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                aria-label="My Profile"
              >
                <User className="w-3.5 h-3.5" />
                My Profile
              </Link>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Slide-down Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-card px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-muted transition-colors uppercase tracking-wide" style={{ color: '#097275' }}>
                  <Icon className="w-4 h-4" style={{ color: '#097275' }} />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </Link>
              );
            })}
            <Link to="/saved" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-muted transition-colors uppercase tracking-wide" style={{ color: '#097275' }}>
              <Heart className="w-4 h-4" style={{ color: '#097275' }} />
              Saved
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Link>

            {isListingOwner && (
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> My Dashboard
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
            {isGroupAdmin && (
              <Link to="/group-dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Tag className="w-4 h-4 text-muted-foreground" /> Group Dashboard
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
            {isListingOwner && (
              <Link to="/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <CreditCard className="w-4 h-4 text-muted-foreground" /> Billing
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Shield className="w-4 h-4 text-muted-foreground" /> Admin
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main ref={mainRef} className="flex-1 page-transition">
        <Outlet />
      </main>

      {/* ── Footer (mobile + desktop) ── */}
      <footer className="block border-t bg-card mt-8 pb-24 md:mt-12 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold mb-1" style={{ color: '#097275' }}>📬 Stay updated on local events & news</p>
            <p className="text-xs text-muted-foreground mb-3">Get the latest listings, events and community news delivered to your inbox.</p>
            <NewsletterSignup source="footer" />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Your Community Hub. Connecting communities across Ireland.</p>
            <p className="mt-2 leading-relaxed">
              <Link to="/directory" className="hover:text-foreground underline underline-offset-2 transition-colors">Browse by county</Link>
              {" · "}
              <Link to="/directory" className="hover:text-foreground underline underline-offset-2 transition-colors">Browse by category</Link>
              {" · "}

              <Link to="/directory" className="hover:text-foreground underline underline-offset-2 transition-colors">Add a listing</Link>
              {" · "}
              <a href="mailto:communitywhatson@gmail.com" className="hover:text-foreground underline underline-offset-2 transition-colors">Contact</a>
              {" · "}
              <Link to="/guidelines" className="hover:text-foreground underline underline-offset-2 transition-colors">Community guidelines</Link>
              {" · "}
              <Link to="/privacy" className="hover:text-foreground underline underline-offset-2 transition-colors">Privacy policy</Link>
              {" · "}
              <Link to="/terms" className="hover:text-foreground underline underline-offset-2 transition-colors">Terms of use</Link>
            </p>
            <p className="mt-2 text-xs">Built locally, for Bandon and beyond — your community, in one place.</p>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t flex items-stretch" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}>
        {BOTTOM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.to === "/"
              ? (location.pathname === "/" || location.pathname === "/directory")
              : location.pathname.startsWith(tab.to.split("?")[0]) && tab.to !== "/";
            return (
              <button
                key={tab.to}
                onClick={() => {
                  if (isActive) {
                    // Re-clicking active tab: scroll to top
                    scrollPositions.current[tab.to] = 0;
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    if (location.pathname !== tab.to && tab.to !== "/" && location.pathname !== "/directory") {
                      navigate(tab.to);
                    }
                  } else {
                    // Save current scroll before switching
                    scrollPositions.current[prevPathRef.current] = window.scrollY;
                    prevPathRef.current = tab.to;
                    navigate(tab.to);
                    // Restore scroll for destination tab after navigation
                    requestAnimationFrame(() => {
                      window.scrollTo({ top: scrollPositions.current[tab.to] || 0, behavior: "instant" });
                    });
                  }
                }}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[44px] min-w-[44px] text-[10px] font-medium transition-colors"
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
      </nav>
    </div>
  );
}
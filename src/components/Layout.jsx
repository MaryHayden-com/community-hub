import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  MapPin, Building2, Users, GraduationCap, Calendar,
  Shield, Menu, X, ChevronRight, CreditCard, LayoutDashboard,
  Tag, ChevronLeft, HeartHandshake, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Directory", icon: MapPin },
  { to: "/directory?type=Business", label: "Businesses", icon: Building2 },
  { to: "/directory?type=Club+%26+Group", label: "Clubs & Groups", icon: Users },
  { to: "/directory?type=Community+Services", label: "Services", icon: HeartHandshake },
  { to: "/directory?type=Education", label: "Education", icon: GraduationCap },
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
            <Link to="/" className="flex items-center gap-2.5">
              <img src="https://media.base44.com/images/public/69d7dcee3ce725bf49f16135/935f3b972_generated_image.png" alt="Community Hub Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0" />
              <span className="font-display font-bold tracking-tight text-base sm:text-xl" style={{ color: '#097275' }}>
                Community Hub
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
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
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 uppercase tracking-wide border-2 ${
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  style={{ color: '#097275', borderColor: '#E2701B' }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/saved"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 uppercase tracking-wide border-2 ${
                location.pathname === "/saved" ? "bg-primary/10" : "hover:bg-muted"
              }`}
              style={{ color: '#097275', borderColor: '#E2701B' }}
            >
              <Heart className="w-4 h-4" />
              Saved
            </Link>
            {isListingOwner && (
              <Link to="/dashboard" className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 uppercase tracking-wide border-2 ${location.pathname === "/dashboard" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275', borderColor: '#E2701B' }}>
                <LayoutDashboard className="w-4 h-4" /> My Dashboard
              </Link>
            )}
            {isGroupAdmin && (
              <Link to="/group-dashboard" className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 uppercase tracking-wide border-2 ${location.pathname === "/group-dashboard" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275', borderColor: '#E2701B' }}>
                <Tag className="w-4 h-4" /> Group Dashboard
              </Link>
            )}
            {isListingOwner && (
              <Link to="/billing" className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 uppercase tracking-wide border-2 ${location.pathname === "/billing" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275', borderColor: '#E2701B' }}>
                <CreditCard className="w-4 h-4" /> Billing
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 uppercase tracking-wide border-2 ${location.pathname === "/admin" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275', borderColor: '#E2701B' }}>
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
          </nav>

          {/* User + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden sm:block text-xs text-muted-foreground">
                {user.full_name || user.email}
              </span>
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
      <main ref={mainRef} className="flex-1 pb-16 md:pb-0 page-transition">
        <Outlet />
      </main>

      {/* ── Footer (desktop only) ── */}
      <footer className="hidden md:block border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold mb-1" style={{ color: '#097275' }}>📬 Stay updated on local events & news</p>
            <p className="text-xs text-muted-foreground mb-3">Get the latest listings, events and community news delivered to your inbox.</p>
            <NewsletterSignup source="footer" />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Community Hub. Connecting communities across Ireland.</p>
            <p className="mt-2">
              <Link to="/privacy" className="hover:text-foreground underline underline-offset-2 transition-colors">Privacy Policy</Link>
              {" · "}
              <a href="mailto:privacy@communityhub.ie" className="hover:text-foreground underline underline-offset-2 transition-colors">privacy@communityhub.ie</a>
            </p>
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
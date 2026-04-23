import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  Home, MapPin, Building2, Users, GraduationCap, Calendar,
  Shield, Menu, X, ChevronRight, CreditCard, LayoutDashboard,
  Tag, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/directory", label: "Directory", icon: MapPin },
  { to: "/directory?type=Business", label: "Businesses", icon: Building2 },
  { to: "/directory?type=Club+%26+Group", label: "Clubs & Groups", icon: Users },
  { to: "/directory?type=Education", label: "Education", icon: GraduationCap },
  { to: "/directory?type=What%27s+On", label: "What's On", icon: Calendar },
];

// Root paths that show the app title (no back button)
const ROOT_PATHS = ["/", "/directory", "/admin", "/dashboard", "/group-dashboard", "/billing"];

// Bottom nav tabs (mobile)
const BOTTOM_TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/directory", label: "Directory", icon: MapPin },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    // Scroll to top on route change
    if (mainRef.current) mainRef.current.scrollTop = 0;
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
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
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight uppercase" style={{ color: '#097275' }}>Community Hub</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === "/"
                ? location.pathname === "/"
                : location.pathname + location.search === item.to ||
                  (item.to === "/directory" && location.pathname === "/directory" && !location.search);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wide ${
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                  style={{ color: '#097275' }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {isListingOwner && (
              <Link to="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname === "/dashboard" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275' }}>
                <LayoutDashboard className="w-4 h-4" /> My Dashboard
              </Link>
            )}
            {isGroupAdmin && (
              <Link to="/group-dashboard" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname === "/group-dashboard" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275' }}>
                <Tag className="w-4 h-4" /> Group Dashboard
              </Link>
            )}
            {user && (
              <Link to="/billing" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname === "/billing" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275' }}>
                <CreditCard className="w-4 h-4" /> Billing
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname === "/admin" ? "bg-primary/10" : "hover:bg-muted"}`} style={{ color: '#097275' }}>
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
            {user && (
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Community Hub. Connecting communities across Ireland.</p>
          <p className="mt-2">
            <Link to="/privacy" className="hover:text-foreground underline underline-offset-2 transition-colors">Privacy Policy</Link>
            {" · "}
            <a href="mailto:privacy@communityhub.ie" className="hover:text-foreground underline underline-offset-2 transition-colors">privacy@communityhub.ie</a>
          </p>
        </div>
      </footer>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t flex items-stretch">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.to.split("?")[0]) && tab.to !== "/";
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
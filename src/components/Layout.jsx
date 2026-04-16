import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Home, MapPin, Building2, Users, GraduationCap, Calendar, Shield, Menu, X, ChevronRight, CreditCard, LayoutDashboard, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/directory", label: "Visibility: Towkin", icon: MapPin },
  { to: "/directory?type=Business", label: "Businesses", icon: Building2 },
  { to: "/directory?type=Club+%26+Group", label: "Clubs & Groups", icon: Users },
  { to: "/directory?type=Education", label: "Education", icon: GraduationCap },
  { to: "/directory?type=What%27s+On", label: "What's On", icon: Calendar },
];

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const isAdmin = user?.role === "admin";
  const isGroupAdmin = user?.role === "group_admin";
  const isListingOwner = user?.role === "listing_owner";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Community Hub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === "/" 
                ? location.pathname === "/" 
                : location.pathname + location.search === item.to || (item.to === "/directory" && location.pathname === "/directory" && !location.search);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {isListingOwner && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            )}
            {isGroupAdmin && (
              <Link
                to="/group-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === "/group-dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Tag className="w-4 h-4" />
                Group Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/billing"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === "/billing" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* User + Mobile Toggle */}
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

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-card px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </Link>
              );
            })}
            {isListingOwner && (
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                My Dashboard
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
            {isGroupAdmin && (
              <Link
                to="/group-dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Tag className="w-4 h-4 text-muted-foreground" />
                Group Dashboard
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
            {user && (
              <Link
                to="/billing"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Billing
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
                Admin
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Community Hub. Connecting communities across Ireland.</p>
          <p className="mt-2">
            <Link to="/privacy" className="hover:text-foreground underline underline-offset-2 transition-colors">Privacy Policy</Link>
            {" · "}
            <a href="mailto:privacy@communityhub.ie" className="hover:text-foreground underline underline-offset-2 transition-colors">privacy@communityhub.ie</a>
          </p>
        </div>
      </footer>
    </div>
  );
}